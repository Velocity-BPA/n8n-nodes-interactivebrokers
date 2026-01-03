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

export const fundBankingOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['fundBanking'],
		},
	},
	options: [
		{
			name: 'Get Transaction History',
			value: 'getTransactionHistory',
			description: 'Get transaction history',
			action: 'Get transaction history',
		},
		{
			name: 'Get IRA Contributions',
			value: 'getIRAContributions',
			description: 'Get IRA contributions',
			action: 'Get IRA contributions',
		},
		{
			name: 'Get Cash Balances',
			value: 'getCashBalances',
			description: 'Get cash balances',
			action: 'Get cash balances',
		},
	],
	default: 'getTransactionHistory',
};

export const fundBankingFields: INodeProperties[] = [
	{
		displayName: 'Account ID',
		name: 'accountIdOverride',
		type: 'string',
		default: '',
		description: 'Override the account ID from credentials. Leave empty to use credentials.',
		displayOptions: {
			show: {
				resource: ['fundBanking'],
			},
		},
	},
	{
		displayName: 'Currency',
		name: 'currency',
		type: 'string',
		default: 'USD',
		description: 'Currency for transactions',
		displayOptions: {
			show: {
				resource: ['fundBanking'],
				operation: ['getTransactionHistory'],
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
				resource: ['fundBanking'],
				operation: ['getTransactionHistory'],
			},
		},
		options: [
			{
				displayName: 'Days',
				name: 'days',
				type: 'number',
				default: 90,
				description: 'Number of days for transaction history',
			},
		],
	},
];

export async function executeFundBankingOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	const credentials = await getCredentials.call(this);
	const accountIdOverride = this.getNodeParameter('accountIdOverride', i, '') as string;
	const accountId = accountIdOverride || credentials.accountId;

	let response: IDataObject | IDataObject[];

	switch (operation) {
		case 'getTransactionHistory': {
			const currency = this.getNodeParameter('currency', i, 'USD') as string;
			const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;

			const query: IDataObject = {
				currency,
			};

			if (additionalOptions.days) {
				query.days = additionalOptions.days;
			}

			response = await ibkrApiRequest.call(this, {
				method: 'GET',
				endpoint: `/fyi/transactions/${accountId}`,
				query,
			});
			break;
		}

		case 'getIRAContributions': {
			response = await ibkrApiRequest.call(this, {
				method: 'GET',
				endpoint: `/pa/ira/${accountId}`,
			});
			break;
		}

		case 'getCashBalances': {
			response = await ibkrApiRequest.call(this, {
				method: 'GET',
				endpoint: `/portfolio/${accountId}/ledger`,
			});
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return response;
}
