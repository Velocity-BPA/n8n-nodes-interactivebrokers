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

export const accountOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['account'],
		},
	},
	options: [
		{
			name: 'Get Accounts',
			value: 'getAccounts',
			description: 'Get portfolio accounts',
			action: 'Get portfolio accounts',
		},
		{
			name: 'Switch Account',
			value: 'switchAccount',
			description: 'Switch between accounts',
			action: 'Switch between accounts',
		},
		{
			name: 'Get Account Summary',
			value: 'getAccountSummary',
			description: 'Get account summary',
			action: 'Get account summary',
		},
		{
			name: 'Get Account Ledger',
			value: 'getAccountLedger',
			description: 'Get account ledger',
			action: 'Get account ledger',
		},
		{
			name: 'Get Account Metadata',
			value: 'getAccountMetadata',
			description: 'Get account metadata',
			action: 'Get account metadata',
		},
		{
			name: 'Get PnL Partitioned',
			value: 'getPnLPartitioned',
			description: 'Get profit/loss by account',
			action: 'Get profit loss by account',
		},
	],
	default: 'getAccounts',
};

export const accountFields: INodeProperties[] = [
	{
		displayName: 'Account ID',
		name: 'accountIdOverride',
		type: 'string',
		default: '',
		description: 'Override the account ID from credentials. Leave empty to use credentials.',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['switchAccount', 'getAccountSummary', 'getAccountLedger', 'getAccountMetadata', 'getPnLPartitioned'],
			},
		},
	},
];

export async function executeAccountOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	const credentials = await getCredentials.call(this);
	const accountIdOverride = this.getNodeParameter('accountIdOverride', i, '') as string;
	const accountId = accountIdOverride || credentials.accountId;

	let response: IDataObject | IDataObject[];

	switch (operation) {
		case 'getAccounts': {
			response = await ibkrApiRequest.call(this, {
				method: 'GET',
				endpoint: '/portfolio/accounts',
			});
			break;
		}

		case 'switchAccount': {
			response = await ibkrApiRequest.call(this, {
				method: 'POST',
				endpoint: '/iserver/account',
				body: {
					acctId: accountId,
				},
			});
			break;
		}

		case 'getAccountSummary': {
			response = await ibkrApiRequest.call(this, {
				method: 'GET',
				endpoint: `/portfolio/${accountId}/summary`,
			});
			break;
		}

		case 'getAccountLedger': {
			response = await ibkrApiRequest.call(this, {
				method: 'GET',
				endpoint: `/portfolio/${accountId}/ledger`,
			});
			break;
		}

		case 'getAccountMetadata': {
			response = await ibkrApiRequest.call(this, {
				method: 'GET',
				endpoint: `/portfolio/${accountId}/meta`,
			});
			break;
		}

		case 'getPnLPartitioned': {
			response = await ibkrApiRequest.call(this, {
				method: 'GET',
				endpoint: '/iserver/account/pnl/partitioned',
			});
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return response;
}
