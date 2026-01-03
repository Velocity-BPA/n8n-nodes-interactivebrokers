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

export const faOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['fa'],
		},
	},
	options: [
		{
			name: 'Get FA Accounts',
			value: 'getFAAccounts',
			description: 'Get advisor accounts',
			action: 'Get advisor accounts',
		},
		{
			name: 'Get FA Allocation',
			value: 'getFAAllocation',
			description: 'Get allocation profiles',
			action: 'Get allocation profiles',
		},
		{
			name: 'Set FA Allocation',
			value: 'setFAAllocation',
			description: 'Set allocation',
			action: 'Set allocation',
		},
	],
	default: 'getFAAccounts',
};

export const faFields: INodeProperties[] = [
	{
		displayName: 'Account ID',
		name: 'accountIdOverride',
		type: 'string',
		default: '',
		description: 'Override the account ID from credentials. Leave empty to use credentials.',
		displayOptions: {
			show: {
				resource: ['fa'],
			},
		},
	},
	{
		displayName: 'Model',
		name: 'model',
		type: 'string',
		default: '',
		description: 'Allocation model name',
		displayOptions: {
			show: {
				resource: ['fa'],
				operation: ['getFAAllocation', 'setFAAllocation'],
			},
		},
	},
	{
		displayName: 'Allocations',
		name: 'allocations',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		description: 'Account allocations',
		displayOptions: {
			show: {
				resource: ['fa'],
				operation: ['setFAAllocation'],
			},
		},
		options: [
			{
				name: 'allocation',
				displayName: 'Allocation',
				values: [
					{
						displayName: 'Account ID',
						name: 'accountId',
						type: 'string',
						default: '',
						description: 'Account ID for allocation',
					},
					{
						displayName: 'Percentage',
						name: 'percentage',
						type: 'number',
						default: 0,
						description: 'Allocation percentage',
					},
				],
			},
		],
	},
];

export async function executeFAOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	const credentials = await getCredentials.call(this);
	const accountIdOverride = this.getNodeParameter('accountIdOverride', i, '') as string;
	const accountId = accountIdOverride || credentials.accountId;

	let response: IDataObject | IDataObject[];

	switch (operation) {
		case 'getFAAccounts': {
			response = await ibkrApiRequest.call(this, {
				method: 'GET',
				endpoint: '/portfolio/accounts',
			});
			break;
		}

		case 'getFAAllocation': {
			const model = this.getNodeParameter('model', i, '') as string;
			const query: IDataObject = {};

			if (model) {
				query.model = model;
			}

			response = await ibkrApiRequest.call(this, {
				method: 'GET',
				endpoint: `/portfolio/${accountId}/allocation`,
				query,
			});
			break;
		}

		case 'setFAAllocation': {
			const model = this.getNodeParameter('model', i, '') as string;
			const allocationsData = this.getNodeParameter('allocations', i) as IDataObject;
			const allocations = (allocationsData.allocation as IDataObject[]) || [];

			const allocationArray = allocations.map((alloc) => ({
				acctId: alloc.accountId,
				amount: alloc.percentage,
			}));

			response = await ibkrApiRequest.call(this, {
				method: 'POST',
				endpoint: `/portfolio/${accountId}/allocation`,
				body: {
					model,
					allocations: allocationArray,
				},
			});
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return response;
}
