/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	INodeProperties,
	IDataObject,
} from 'n8n-workflow';

import { ibkrApiRequest, getCredentials, formatOrderPayload } from '../../transport';
import { parseConid, cleanObject, validateOrderParams } from '../../utils';
import { ORDER_TYPES, TIME_IN_FORCE, SECURITY_TYPES } from '../../constants';

export const ordersOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['orders'],
		},
	},
	options: [
		{
			name: 'Place Order',
			value: 'placeOrder',
			description: 'Place a new order',
			action: 'Place a new order',
		},
		{
			name: 'Place Order Reply',
			value: 'placeOrderReply',
			description: 'Confirm order (handle warnings)',
			action: 'Confirm order',
		},
		{
			name: 'Modify Order',
			value: 'modifyOrder',
			description: 'Modify an existing order',
			action: 'Modify an existing order',
		},
		{
			name: 'Cancel Order',
			value: 'cancelOrder',
			description: 'Cancel an order',
			action: 'Cancel an order',
		},
		{
			name: 'Get Live Orders',
			value: 'getLiveOrders',
			description: 'Get live orders',
			action: 'Get live orders',
		},
		{
			name: 'Get Order Status',
			value: 'getOrderStatus',
			description: 'Get order status',
			action: 'Get order status',
		},
		{
			name: 'Preview Order',
			value: 'previewOrder',
			description: 'Preview order before execution',
			action: 'Preview order',
		},
		{
			name: 'What If Order',
			value: 'whatIfOrder',
			description: 'Simulate order impact',
			action: 'Simulate order impact',
		},
	],
	default: 'getLiveOrders',
};

export const ordersFields: INodeProperties[] = [
	{
		displayName: 'Account ID',
		name: 'accountIdOverride',
		type: 'string',
		default: '',
		description: 'Override the account ID from credentials. Leave empty to use credentials.',
		displayOptions: {
			show: {
				resource: ['orders'],
			},
		},
	},
	{
		displayName: 'Contract ID',
		name: 'conid',
		type: 'string',
		default: '',
		required: true,
		description: 'The contract ID (conid) of the instrument',
		displayOptions: {
			show: {
				resource: ['orders'],
				operation: ['placeOrder', 'previewOrder', 'whatIfOrder'],
			},
		},
	},
	{
		displayName: 'Order ID',
		name: 'orderId',
		type: 'string',
		default: '',
		required: true,
		description: 'The order ID',
		displayOptions: {
			show: {
				resource: ['orders'],
				operation: ['modifyOrder', 'cancelOrder', 'getOrderStatus'],
			},
		},
	},
	{
		displayName: 'Reply ID',
		name: 'replyId',
		type: 'string',
		default: '',
		required: true,
		description: 'The reply ID from place order response',
		displayOptions: {
			show: {
				resource: ['orders'],
				operation: ['placeOrderReply'],
			},
		},
	},
	{
		displayName: 'Confirmed',
		name: 'confirmed',
		type: 'boolean',
		default: true,
		description: 'Whether to confirm the order',
		displayOptions: {
			show: {
				resource: ['orders'],
				operation: ['placeOrderReply'],
			},
		},
	},
	{
		displayName: 'Side',
		name: 'side',
		type: 'options',
		options: [
			{ name: 'Buy', value: 'BUY' },
			{ name: 'Sell', value: 'SELL' },
		],
		default: 'BUY',
		required: true,
		description: 'Order side',
		displayOptions: {
			show: {
				resource: ['orders'],
				operation: ['placeOrder', 'modifyOrder', 'previewOrder', 'whatIfOrder'],
			},
		},
	},
	{
		displayName: 'Order Type',
		name: 'orderType',
		type: 'options',
		options: ORDER_TYPES,
		default: 'LMT',
		required: true,
		description: 'Type of order',
		displayOptions: {
			show: {
				resource: ['orders'],
				operation: ['placeOrder', 'modifyOrder', 'previewOrder', 'whatIfOrder'],
			},
		},
	},
	{
		displayName: 'Quantity',
		name: 'quantity',
		type: 'number',
		default: 1,
		required: true,
		description: 'Order quantity',
		displayOptions: {
			show: {
				resource: ['orders'],
				operation: ['placeOrder', 'modifyOrder', 'previewOrder', 'whatIfOrder'],
			},
		},
	},
	{
		displayName: 'Price',
		name: 'price',
		type: 'number',
		default: 0,
		description: 'Limit price (required for limit orders)',
		displayOptions: {
			show: {
				resource: ['orders'],
				operation: ['placeOrder', 'modifyOrder', 'previewOrder', 'whatIfOrder'],
			},
		},
	},
	{
		displayName: 'Aux Price',
		name: 'auxPrice',
		type: 'number',
		default: 0,
		description: 'Stop price or trailing amount (for stop and trailing orders)',
		displayOptions: {
			show: {
				resource: ['orders'],
				operation: ['placeOrder', 'modifyOrder', 'previewOrder', 'whatIfOrder'],
			},
		},
	},
	{
		displayName: 'Time In Force',
		name: 'tif',
		type: 'options',
		options: TIME_IN_FORCE,
		default: 'DAY',
		description: 'Time in force for the order',
		displayOptions: {
			show: {
				resource: ['orders'],
				operation: ['placeOrder', 'modifyOrder', 'previewOrder', 'whatIfOrder'],
			},
		},
	},
	{
		displayName: 'Security Type',
		name: 'secType',
		type: 'options',
		options: SECURITY_TYPES,
		default: 'STK',
		description: 'Security type',
		displayOptions: {
			show: {
				resource: ['orders'],
				operation: ['placeOrder', 'previewOrder', 'whatIfOrder'],
			},
		},
	},
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['orders'],
				operation: ['placeOrder', 'modifyOrder', 'previewOrder', 'whatIfOrder'],
			},
		},
		options: [
			{
				displayName: 'Outside Regular Trading Hours',
				name: 'outsideRTH',
				type: 'boolean',
				default: false,
				description: 'Whether to trade outside regular trading hours',
			},
			{
				displayName: 'Use Adaptive Algorithm',
				name: 'useAdaptive',
				type: 'boolean',
				default: false,
				description: 'Whether to use IB Adaptive algorithm',
			},
			{
				displayName: 'Currency Conversion',
				name: 'isCcyConv',
				type: 'boolean',
				default: false,
				description: 'Whether this is a currency conversion order',
			},
			{
				displayName: 'Client Order ID',
				name: 'cOID',
				type: 'string',
				default: '',
				description: 'Client-provided order ID',
			},
			{
				displayName: 'Parent Order ID',
				name: 'parentId',
				type: 'string',
				default: '',
				description: 'Parent order ID for bracket orders',
			},
			{
				displayName: 'Referrer',
				name: 'referrer',
				type: 'string',
				default: '',
				description: 'Order referrer/source',
			},
			{
				displayName: 'Trailing Percent',
				name: 'trailingPercent',
				type: 'number',
				default: 0,
				description: 'Trailing stop percent',
			},
			{
				displayName: 'All Or None',
				name: 'allOrNone',
				type: 'boolean',
				default: false,
				description: 'Whether to fill all or none',
			},
		],
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['orders'],
				operation: ['getLiveOrders'],
			},
		},
		options: [
			{
				displayName: 'Force Refresh',
				name: 'force',
				type: 'boolean',
				default: false,
				description: 'Whether to force refresh orders',
			},
			{
				displayName: 'Account Filter',
				name: 'accountId',
				type: 'string',
				default: '',
				description: 'Filter by account ID',
			},
		],
	},
];

export async function executeOrdersOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	const credentials = await getCredentials.call(this);
	const accountIdOverride = this.getNodeParameter('accountIdOverride', i, '') as string;
	const accountId = accountIdOverride || credentials.accountId;

	let response: IDataObject | IDataObject[];

	switch (operation) {
		case 'placeOrder': {
			const conid = parseConid(this.getNodeParameter('conid', i) as string);
			const side = this.getNodeParameter('side', i) as string;
			const orderType = this.getNodeParameter('orderType', i) as string;
			const quantity = this.getNodeParameter('quantity', i) as number;
			const price = this.getNodeParameter('price', i, 0) as number;
			const auxPrice = this.getNodeParameter('auxPrice', i, 0) as number;
			const tif = this.getNodeParameter('tif', i, 'DAY') as string;
			const secType = this.getNodeParameter('secType', i, 'STK') as string;
			const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;

			const orderData: IDataObject = {
				side,
				orderType,
				quantity,
				price: price || undefined,
				auxPrice: auxPrice || undefined,
				tif,
				secType,
				...additionalOptions,
			};

			// Validate order - throws on error
			validateOrderParams({ conid, orderType, ...orderData });

			const orderPayload = formatOrderPayload(accountId, conid, orderData);

			response = await ibkrApiRequest.call(this, {
				method: 'POST',
				endpoint: `/iserver/account/${accountId}/orders`,
				body: {
					orders: [cleanObject(orderPayload)],
				},
			});
			break;
		}

		case 'placeOrderReply': {
			const replyId = this.getNodeParameter('replyId', i) as string;
			const confirmed = this.getNodeParameter('confirmed', i, true) as boolean;

			response = await ibkrApiRequest.call(this, {
				method: 'POST',
				endpoint: `/iserver/reply/${replyId}`,
				body: {
					confirmed,
				},
			});
			break;
		}

		case 'modifyOrder': {
			const orderId = this.getNodeParameter('orderId', i) as string;
			const conid = parseConid(this.getNodeParameter('conid', i, '') as string);
			const side = this.getNodeParameter('side', i) as string;
			const orderType = this.getNodeParameter('orderType', i) as string;
			const quantity = this.getNodeParameter('quantity', i) as number;
			const price = this.getNodeParameter('price', i, 0) as number;
			const auxPrice = this.getNodeParameter('auxPrice', i, 0) as number;
			const tif = this.getNodeParameter('tif', i, 'DAY') as string;
			const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;

			const modifyData = cleanObject({
				conid: conid || undefined,
				side,
				orderType,
				quantity,
				price: price || undefined,
				auxPrice: auxPrice || undefined,
				tif,
				...additionalOptions,
			});

			response = await ibkrApiRequest.call(this, {
				method: 'POST',
				endpoint: `/iserver/account/${accountId}/order/${orderId}`,
				body: modifyData,
			});
			break;
		}

		case 'cancelOrder': {
			const orderId = this.getNodeParameter('orderId', i) as string;

			response = await ibkrApiRequest.call(this, {
				method: 'DELETE',
				endpoint: `/iserver/account/${accountId}/order/${orderId}`,
			});
			break;
		}

		case 'getLiveOrders': {
			const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
			const query: IDataObject = {};

			if (filters.force) {
				query.force = 'true';
			}
			if (filters.accountId) {
				query.accountId = filters.accountId;
			}

			response = await ibkrApiRequest.call(this, {
				method: 'GET',
				endpoint: '/iserver/account/orders',
				query,
			});
			break;
		}

		case 'getOrderStatus': {
			const orderId = this.getNodeParameter('orderId', i) as string;

			response = await ibkrApiRequest.call(this, {
				method: 'GET',
				endpoint: `/iserver/account/order/status/${orderId}`,
			});
			break;
		}

		case 'previewOrder': {
			const conid = parseConid(this.getNodeParameter('conid', i) as string);
			const side = this.getNodeParameter('side', i) as string;
			const orderType = this.getNodeParameter('orderType', i) as string;
			const quantity = this.getNodeParameter('quantity', i) as number;
			const price = this.getNodeParameter('price', i, 0) as number;
			const auxPrice = this.getNodeParameter('auxPrice', i, 0) as number;
			const tif = this.getNodeParameter('tif', i, 'DAY') as string;
			const secType = this.getNodeParameter('secType', i, 'STK') as string;
			const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;

			const orderData = cleanObject({
				acctId: accountId,
				conid,
				side,
				orderType,
				quantity,
				price: price || undefined,
				auxPrice: auxPrice || undefined,
				tif,
				secType,
				...additionalOptions,
			});

			response = await ibkrApiRequest.call(this, {
				method: 'POST',
				endpoint: `/iserver/account/${accountId}/orders/preview`,
				body: {
					orders: [orderData],
				},
			});
			break;
		}

		case 'whatIfOrder': {
			const conid = parseConid(this.getNodeParameter('conid', i) as string);
			const side = this.getNodeParameter('side', i) as string;
			const orderType = this.getNodeParameter('orderType', i) as string;
			const quantity = this.getNodeParameter('quantity', i) as number;
			const price = this.getNodeParameter('price', i, 0) as number;
			const auxPrice = this.getNodeParameter('auxPrice', i, 0) as number;
			const tif = this.getNodeParameter('tif', i, 'DAY') as string;
			const secType = this.getNodeParameter('secType', i, 'STK') as string;
			const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;

			const orderData = cleanObject({
				acctId: accountId,
				conid,
				side,
				orderType,
				quantity,
				price: price || undefined,
				auxPrice: auxPrice || undefined,
				tif,
				secType,
				...additionalOptions,
			});

			response = await ibkrApiRequest.call(this, {
				method: 'POST',
				endpoint: `/iserver/account/${accountId}/orders/whatif`,
				body: {
					orders: [orderData],
				},
			});
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return response;
}
