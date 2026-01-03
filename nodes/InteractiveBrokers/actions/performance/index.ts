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

export const performanceOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['performance'],
		},
	},
	options: [
		{
			name: 'Get Performance',
			value: 'getPerformance',
			description: 'Get account performance',
			action: 'Get account performance',
		},
		{
			name: 'Get Transaction History',
			value: 'getTransactionHistory',
			description: 'Get transaction history',
			action: 'Get transaction history',
		},
		{
			name: 'Get Portfolio Summary',
			value: 'getPortfolioSummary',
			description: 'Get portfolio summary',
			action: 'Get portfolio summary',
		},
	],
	default: 'getPerformance',
};

export const performanceFields: INodeProperties[] = [
	{
		displayName: 'Account ID',
		name: 'accountIdOverride',
		type: 'string',
		default: '',
		description: 'Override the account ID from credentials. Leave empty to use credentials.',
		displayOptions: {
			show: {
				resource: ['performance'],
			},
		},
	},
	{
		displayName: 'Period',
		name: 'period',
		type: 'options',
		options: [
			{ name: '1 Day', value: '1D' },
			{ name: '7 Days', value: '7D' },
			{ name: '1 Month', value: '1M' },
			{ name: '3 Months', value: '3M' },
			{ name: '6 Months', value: '6M' },
			{ name: '1 Year', value: '1Y' },
			{ name: '3 Years', value: '3Y' },
			{ name: '5 Years', value: '5Y' },
			{ name: 'Year to Date', value: 'YTD' },
			{ name: 'Max', value: 'MAX' },
		],
		default: '1M',
		description: 'Performance period',
		displayOptions: {
			show: {
				resource: ['performance'],
				operation: ['getPerformance'],
			},
		},
	},
	{
		displayName: 'Days',
		name: 'days',
		type: 'number',
		default: 90,
		description: 'Number of days for transaction history',
		displayOptions: {
			show: {
				resource: ['performance'],
				operation: ['getTransactionHistory'],
			},
		},
	},
	{
		displayName: 'Currency',
		name: 'currency',
		type: 'string',
		default: 'USD',
		description: 'Currency for values',
		displayOptions: {
			show: {
				resource: ['performance'],
				operation: ['getTransactionHistory'],
			},
		},
	},
];

export async function executePerformanceOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	const credentials = await getCredentials.call(this);
	const accountIdOverride = this.getNodeParameter('accountIdOverride', i, '') as string;
	const accountId = accountIdOverride || credentials.accountId;

	let response: IDataObject | IDataObject[];

	switch (operation) {
		case 'getPerformance': {
			const period = this.getNodeParameter('period', i, '1M') as string;

			response = await ibkrApiRequest.call(this, {
				method: 'POST',
				endpoint: '/pa/performance',
				body: {
					acctIds: [accountId],
					freq: 'D',
					period,
				},
			});
			break;
		}

		case 'getTransactionHistory': {
			const days = this.getNodeParameter('days', i, 90) as number;
			const currency = this.getNodeParameter('currency', i, 'USD') as string;

			response = await ibkrApiRequest.call(this, {
				method: 'POST',
				endpoint: '/pa/transactions',
				body: {
					acctIds: [accountId],
					days,
					currency,
				},
			});
			break;
		}

		case 'getPortfolioSummary': {
			response = await ibkrApiRequest.call(this, {
				method: 'POST',
				endpoint: '/pa/summary',
				body: {
					acctIds: [accountId],
				},
			});
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return response;
}
