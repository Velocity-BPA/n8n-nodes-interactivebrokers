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

import { ibkrApiRequest } from '../../transport';

export const utilityOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['utility'],
		},
	},
	options: [
		{
			name: 'Validate SSO',
			value: 'getSsoValidate',
			description: 'Validate SSO',
			action: 'Validate SSO',
		},
		{
			name: 'Ping',
			value: 'getPing',
			description: 'API ping',
			action: 'API ping',
		},
		{
			name: 'Get Gateway Version',
			value: 'getGWVersion',
			description: 'Get gateway version',
			action: 'Get gateway version',
		},
		{
			name: 'Search Symbol',
			value: 'searchSymbol',
			description: 'Symbol search',
			action: 'Symbol search',
		},
	],
	default: 'getPing',
};

export const utilityFields: INodeProperties[] = [
	{
		displayName: 'Symbol',
		name: 'symbol',
		type: 'string',
		default: '',
		required: true,
		description: 'Symbol to search for',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['searchSymbol'],
			},
		},
	},
	{
		displayName: 'Security Type',
		name: 'secType',
		type: 'options',
		options: [
			{ name: 'Any', value: '' },
			{ name: 'Stock', value: 'STK' },
			{ name: 'Option', value: 'OPT' },
			{ name: 'Future', value: 'FUT' },
			{ name: 'Forex', value: 'CASH' },
			{ name: 'Bond', value: 'BOND' },
			{ name: 'Fund', value: 'FUND' },
			{ name: 'Index', value: 'IND' },
		],
		default: '',
		description: 'Security type filter',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['searchSymbol'],
			},
		},
	},
];

export async function executeUtilityOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let response: IDataObject | IDataObject[];

	switch (operation) {
		case 'getSsoValidate': {
			response = await ibkrApiRequest.call(this, {
				method: 'GET',
				endpoint: '/sso/validate',
			});
			break;
		}

		case 'getPing': {
			response = await ibkrApiRequest.call(this, {
				method: 'POST',
				endpoint: '/tickle',
			});
			break;
		}

		case 'getGWVersion': {
			response = await ibkrApiRequest.call(this, {
				method: 'GET',
				endpoint: '/about',
			});
			break;
		}

		case 'searchSymbol': {
			const symbol = this.getNodeParameter('symbol', i) as string;
			const secType = this.getNodeParameter('secType', i, '') as string;

			const query: IDataObject = {
				symbol,
			};

			if (secType) {
				query.secType = secType;
			}

			response = await ibkrApiRequest.call(this, {
				method: 'GET',
				endpoint: '/iserver/secdef/search',
				query,
			});
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return response;
}
