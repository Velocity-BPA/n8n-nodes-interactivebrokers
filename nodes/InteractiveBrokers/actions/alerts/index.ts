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

import { ibkrApiRequest, getCredentials } from '../../transport';
import { parseConid, cleanObject } from '../../utils';
import { ALERT_CONDITIONS, ALERT_OPERATORS } from '../../constants';

export const alertsOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['alerts'],
		},
	},
	options: [
		{
			name: 'Get Alerts',
			value: 'getAlerts',
			description: 'Get MTA alerts',
			action: 'Get MTA alerts',
		},
		{
			name: 'Create Alert',
			value: 'createAlert',
			description: 'Create new alert',
			action: 'Create new alert',
		},
		{
			name: 'Modify Alert',
			value: 'modifyAlert',
			description: 'Modify alert',
			action: 'Modify alert',
		},
		{
			name: 'Delete Alert',
			value: 'deleteAlert',
			description: 'Delete alert',
			action: 'Delete alert',
		},
		{
			name: 'Get Alert Details',
			value: 'getAlertDetails',
			description: 'Get alert details',
			action: 'Get alert details',
		},
		{
			name: 'Activate Alert',
			value: 'activateAlert',
			description: 'Activate/deactivate alert',
			action: 'Activate deactivate alert',
		},
	],
	default: 'getAlerts',
};

export const alertsFields: INodeProperties[] = [
	{
		displayName: 'Account ID',
		name: 'accountIdOverride',
		type: 'string',
		default: '',
		description: 'Override the account ID from credentials. Leave empty to use credentials.',
		displayOptions: {
			show: {
				resource: ['alerts'],
			},
		},
	},
	{
		displayName: 'Alert ID',
		name: 'alertId',
		type: 'string',
		default: '',
		required: true,
		description: 'The alert ID',
		displayOptions: {
			show: {
				resource: ['alerts'],
				operation: ['modifyAlert', 'deleteAlert', 'getAlertDetails', 'activateAlert'],
			},
		},
	},
	{
		displayName: 'Contract ID',
		name: 'conid',
		type: 'string',
		default: '',
		required: true,
		description: 'The contract ID (conid)',
		displayOptions: {
			show: {
				resource: ['alerts'],
				operation: ['createAlert', 'modifyAlert'],
			},
		},
	},
	{
		displayName: 'Alert Name',
		name: 'alertName',
		type: 'string',
		default: '',
		required: true,
		description: 'Name of the alert',
		displayOptions: {
			show: {
				resource: ['alerts'],
				operation: ['createAlert', 'modifyAlert'],
			},
		},
	},
	{
		displayName: 'Condition Type',
		name: 'conditionType',
		type: 'options',
		options: ALERT_CONDITIONS,
		default: 'price',
		description: 'Type of condition',
		displayOptions: {
			show: {
				resource: ['alerts'],
				operation: ['createAlert', 'modifyAlert'],
			},
		},
	},
	{
		displayName: 'Operator',
		name: 'operator',
		type: 'options',
		options: ALERT_OPERATORS,
		default: '1',
		description: 'Condition operator',
		displayOptions: {
			show: {
				resource: ['alerts'],
				operation: ['createAlert', 'modifyAlert'],
			},
		},
	},
	{
		displayName: 'Trigger Price',
		name: 'triggerPrice',
		type: 'number',
		default: 0,
		required: true,
		description: 'Price at which to trigger the alert',
		displayOptions: {
			show: {
				resource: ['alerts'],
				operation: ['createAlert', 'modifyAlert'],
			},
		},
	},
	{
		displayName: 'Alert Options',
		name: 'alertOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['alerts'],
				operation: ['createAlert', 'modifyAlert'],
			},
		},
		options: [
			{
				displayName: 'Outside Regular Trading Hours',
				name: 'outsideRth',
				type: 'boolean',
				default: false,
				description: 'Whether to trigger outside regular trading hours',
			},
			{
				displayName: 'Repeat Until Cancelled',
				name: 'iTWSOrdersOnly',
				type: 'boolean',
				default: false,
				description: 'Whether to repeat the alert until cancelled',
			},
			{
				displayName: 'Show Popup',
				name: 'showPopup',
				type: 'boolean',
				default: true,
				description: 'Whether to show popup notification',
			},
			{
				displayName: 'Play Audio',
				name: 'playAudio',
				type: 'boolean',
				default: false,
				description: 'Whether to play audio alert',
			},
			{
				displayName: 'Send Email',
				name: 'sendEmail',
				type: 'boolean',
				default: false,
				description: 'Whether to send email notification',
			},
			{
				displayName: 'Email Address',
				name: 'email',
				type: 'string',
				default: '',
				description: 'Email address for notifications',
			},
			{
				displayName: 'Expiry Time',
				name: 'expireTime',
				type: 'string',
				default: '',
				description: 'Alert expiry time (YYYYMMDD-HH:MM:SS)',
			},
		],
	},
	{
		displayName: 'Activate',
		name: 'activate',
		type: 'boolean',
		default: true,
		description: 'Whether to activate or deactivate the alert',
		displayOptions: {
			show: {
				resource: ['alerts'],
				operation: ['activateAlert'],
			},
		},
	},
];

export async function executeAlertsOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	const credentials = await getCredentials.call(this);
	const accountIdOverride = this.getNodeParameter('accountIdOverride', i, '') as string;
	const accountId = accountIdOverride || credentials.accountId;

	let response: IDataObject | IDataObject[];

	switch (operation) {
		case 'getAlerts': {
			response = await ibkrApiRequest.call(this, {
				method: 'GET',
				endpoint: `/iserver/account/${accountId}/alerts`,
			});
			break;
		}

		case 'createAlert': {
			const conid = parseConid(this.getNodeParameter('conid', i) as string);
			const alertName = this.getNodeParameter('alertName', i) as string;
			const conditionType = this.getNodeParameter('conditionType', i) as string;
			const operator = this.getNodeParameter('operator', i) as string;
			const triggerPrice = this.getNodeParameter('triggerPrice', i) as number;
			const alertOptions = this.getNodeParameter('alertOptions', i, {}) as IDataObject;

			const condition: IDataObject = {
				type: 1, // Price alert
				conidex: `${conid}@SMART`,
				operator,
				triggerMethod: conditionType === 'price' ? '0' : '1',
				value: triggerPrice.toString(),
			};

			const body = cleanObject({
				alertName,
				alertMessage: alertName,
				alertRepeatable: alertOptions.iTWSOrdersOnly ? 1 : 0,
				outsideRth: alertOptions.outsideRth ? 1 : 0,
				showPopup: alertOptions.showPopup !== false ? 1 : 0,
				playAudio: alertOptions.playAudio ? 1 : 0,
				sendMessage: alertOptions.sendEmail ? 1 : 0,
				email: alertOptions.email || undefined,
				expireTime: alertOptions.expireTime || undefined,
				conditions: [condition],
			});

			response = await ibkrApiRequest.call(this, {
				method: 'POST',
				endpoint: `/iserver/account/${accountId}/alert`,
				body,
			});
			break;
		}

		case 'modifyAlert': {
			const alertId = this.getNodeParameter('alertId', i) as string;
			const conid = parseConid(this.getNodeParameter('conid', i) as string);
			const alertName = this.getNodeParameter('alertName', i) as string;
			const conditionType = this.getNodeParameter('conditionType', i) as string;
			const operator = this.getNodeParameter('operator', i) as string;
			const triggerPrice = this.getNodeParameter('triggerPrice', i) as number;
			const alertOptions = this.getNodeParameter('alertOptions', i, {}) as IDataObject;

			const condition: IDataObject = {
				type: 1,
				conidex: `${conid}@SMART`,
				operator,
				triggerMethod: conditionType === 'price' ? '0' : '1',
				value: triggerPrice.toString(),
			};

			const body = cleanObject({
				alertId: parseInt(alertId, 10),
				alertName,
				alertMessage: alertName,
				alertRepeatable: alertOptions.iTWSOrdersOnly ? 1 : 0,
				outsideRth: alertOptions.outsideRth ? 1 : 0,
				showPopup: alertOptions.showPopup !== false ? 1 : 0,
				playAudio: alertOptions.playAudio ? 1 : 0,
				sendMessage: alertOptions.sendEmail ? 1 : 0,
				email: alertOptions.email || undefined,
				expireTime: alertOptions.expireTime || undefined,
				conditions: [condition],
			});

			response = await ibkrApiRequest.call(this, {
				method: 'POST',
				endpoint: `/iserver/account/${accountId}/alert/${alertId}`,
				body,
			});
			break;
		}

		case 'deleteAlert': {
			const alertId = this.getNodeParameter('alertId', i) as string;

			response = await ibkrApiRequest.call(this, {
				method: 'DELETE',
				endpoint: `/iserver/account/${accountId}/alert/${alertId}`,
			});
			break;
		}

		case 'getAlertDetails': {
			const alertId = this.getNodeParameter('alertId', i) as string;

			response = await ibkrApiRequest.call(this, {
				method: 'GET',
				endpoint: `/iserver/account/${accountId}/alert/${alertId}`,
			});
			break;
		}

		case 'activateAlert': {
			const alertId = this.getNodeParameter('alertId', i) as string;
			const activate = this.getNodeParameter('activate', i, true) as boolean;

			response = await ibkrApiRequest.call(this, {
				method: 'POST',
				endpoint: `/iserver/account/${accountId}/alert/activate`,
				body: {
					alertId: parseInt(alertId, 10),
					alertActive: activate ? 1 : 0,
				},
			});
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return response;
}
