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

export const tradesOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['trades'],
		},
	},
	options: [
		{
			name: 'Get Trades',
			value: 'getTrades',
			description: 'Get executed trades',
			action: 'Get executed trades',
		},
		{
			name: 'Get Trades by Days',
			value: 'getTradesByDays',
			description: 'Get trades for date range',
			action: 'Get trades for date range',
		},
	],
	default: 'getTrades',
};

export const tradesFields: INodeProperties[] = [
	{
		displayName: 'Account ID',
		name: 'accountIdOverride',
		type: 'string',
		default: '',
		description: 'Override the account ID from credentials. Leave empty to use credentials.',
		displayOptions: {
			show: {
				resource: ['trades'],
			},
		},
	},
	{
		displayName: 'Days',
		name: 'days',
		type: 'number',
		default: 7,
		description: 'Number of days to retrieve trades for',
		displayOptions: {
			show: {
				resource: ['trades'],
				operation: ['getTradesByDays'],
			},
		},
	},
];

export async function executeTradesOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	const credentials = await getCredentials.call(this);
	const accountIdOverride = this.getNodeParameter('accountIdOverride', i, '') as string;
	const accountId = accountIdOverride || credentials.accountId;

	let response: IDataObject | IDataObject[];

	switch (operation) {
		case 'getTrades': {
			response = await ibkrApiRequest.call(this, {
				method: 'GET',
				endpoint: '/iserver/account/trades',
			});
			break;
		}

		case 'getTradesByDays': {
			const days = this.getNodeParameter('days', i, 7) as number;

			response = await ibkrApiRequest.call(this, {
				method: 'GET',
				endpoint: '/iserver/account/trades',
				query: {
					days: days.toString(),
					accountId,
				},
			});
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return response;
}
