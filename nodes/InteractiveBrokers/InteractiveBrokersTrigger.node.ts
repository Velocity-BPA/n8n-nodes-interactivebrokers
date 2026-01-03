/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IPollFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
} from 'n8n-workflow';

import { ibkrApiRequest } from './transport';

export class InteractiveBrokersTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Interactive Brokers Trigger',
		name: 'interactiveBrokersTrigger',
		icon: 'file:interactiveBrokers.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Trigger workflow on Interactive Brokers events',
		defaults: {
			name: 'Interactive Brokers Trigger',
		},
		polling: true,
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'interactiveBrokersApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'New Order',
						value: 'newOrder',
						description: 'Trigger when a new order is placed',
					},
					{
						name: 'Order Filled',
						value: 'orderFilled',
						description: 'Trigger when an order is executed',
					},
					{
						name: 'Order Canceled',
						value: 'orderCanceled',
						description: 'Trigger when an order is canceled',
					},
					{
						name: 'Alert Triggered',
						value: 'alertTriggered',
						description: 'Trigger when an MTA alert fires',
					},
					{
						name: 'Position Changed',
						value: 'positionChanged',
						description: 'Trigger when a position is updated',
					},
					{
						name: 'Trade Executed',
						value: 'tradeExecuted',
						description: 'Trigger when a trade is executed',
					},
				],
				default: 'orderFilled',
			},
			{
				displayName: 'Account ID',
				name: 'accountId',
				type: 'string',
				default: '',
				description: 'Account ID to monitor (leave empty to use default from credentials)',
			},
			{
				displayName: 'Contract ID',
				name: 'conid',
				type: 'string',
				default: '',
				description: 'Filter by specific contract ID (conid)',
				displayOptions: {
					show: {
						event: ['positionChanged', 'tradeExecuted'],
					},
				},
			},
		],
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const webhookData = this.getWorkflowStaticData('node');
		const event = this.getNodeParameter('event') as string;
		const accountId = this.getNodeParameter('accountId', '') as string;

		const returnData: INodeExecutionData[] = [];

		try {
			switch (event) {
				case 'newOrder':
				case 'orderFilled':
				case 'orderCanceled': {
					const orders = await ibkrApiRequest.call(this, {
						method: 'GET',
						endpoint: '/iserver/account/orders',
					}) as IDataObject;

					const ordersList = (orders.orders || []) as IDataObject[];
					const lastPollTime = webhookData.lastPollTime as number || 0;
					const now = Date.now();

					for (const order of ordersList) {
						const orderTime = new Date(order.lastExecutionTime as string || order.orderTime as string).getTime();
						
						if (orderTime > lastPollTime) {
							const status = (order.status as string || '').toLowerCase();
							
							if (event === 'newOrder' && status === 'submitted') {
								returnData.push({ json: order });
							} else if (event === 'orderFilled' && status === 'filled') {
								returnData.push({ json: order });
							} else if (event === 'orderCanceled' && status === 'cancelled') {
								returnData.push({ json: order });
							}
						}
					}

					webhookData.lastPollTime = now;
					break;
				}

				case 'alertTriggered': {
					const alerts = await ibkrApiRequest.call(this, {
						method: 'GET',
						endpoint: '/iserver/account/mta',
					}) as IDataObject[];

					const lastAlertIds = (webhookData.lastAlertIds || []) as string[];
					const currentAlertIds: string[] = [];

					for (const alert of alerts) {
						const alertId = alert.alert_id as string;
						currentAlertIds.push(alertId);

						if (alert.alert_triggered && !lastAlertIds.includes(alertId)) {
							returnData.push({ json: alert });
						}
					}

					webhookData.lastAlertIds = currentAlertIds;
					break;
				}

				case 'positionChanged': {
					const conid = this.getNodeParameter('conid', '') as string;
					const acctId = accountId || (await this.getCredentials('interactiveBrokersApi')).accountId as string;

					const positions = await ibkrApiRequest.call(this, {
						method: 'GET',
						endpoint: `/portfolio/${acctId}/positions/0`,
					}) as IDataObject[];

					const positionMap: { [key: string]: IDataObject } = {};
					for (const pos of positions) {
						positionMap[pos.conid as string] = pos;
					}

					const lastPositions = (webhookData.lastPositions || {}) as { [key: string]: IDataObject };

					for (const [posConid, position] of Object.entries(positionMap)) {
						if (conid && posConid !== conid) continue;

						const lastPosition = lastPositions[posConid];
						if (!lastPosition) {
							// New position
							returnData.push({ json: { ...position, changeType: 'new' } });
						} else if (
							lastPosition.position !== position.position ||
							lastPosition.avgCost !== position.avgCost
						) {
							// Position changed
							returnData.push({
								json: {
									...position,
									changeType: 'updated',
									previousPosition: lastPosition.position,
									previousAvgCost: lastPosition.avgCost,
								},
							});
						}
					}

					// Check for closed positions
					for (const [posConid, lastPosition] of Object.entries(lastPositions)) {
						if (conid && posConid !== conid) continue;

						if (!positionMap[posConid]) {
							returnData.push({
								json: {
									...lastPosition,
									changeType: 'closed',
									position: 0,
								},
							});
						}
					}

					webhookData.lastPositions = positionMap;
					break;
				}

				case 'tradeExecuted': {
					const conid = this.getNodeParameter('conid', '') as string;

					const trades = await ibkrApiRequest.call(this, {
						method: 'GET',
						endpoint: '/iserver/account/trades',
					}) as IDataObject[];

					const lastTradeIds = (webhookData.lastTradeIds || []) as string[];
					const currentTradeIds: string[] = [];

					for (const trade of trades) {
						const tradeId = trade.execution_id as string;
						currentTradeIds.push(tradeId);

						if (!lastTradeIds.includes(tradeId)) {
							if (!conid || trade.conid === conid) {
								returnData.push({ json: trade });
							}
						}
					}

					webhookData.lastTradeIds = currentTradeIds;
					break;
				}
			}
		} catch (error) {
			// On first poll or auth issues, just save state
			if ((error as Error).message.includes('not authenticated')) {
				console.warn('Interactive Brokers: Session not authenticated. Please authenticate via Client Portal Gateway.');
			}
		}

		if (returnData.length === 0) {
			return null;
		}

		return [returnData];
	}
}
