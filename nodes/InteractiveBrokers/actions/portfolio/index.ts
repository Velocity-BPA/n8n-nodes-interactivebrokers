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
import { parseConid } from '../../utils';

export const portfolioOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['portfolio'],
		},
	},
	options: [
		{
			name: 'Get Positions',
			value: 'getPositions',
			description: 'Get all positions',
			action: 'Get all positions',
		},
		{
			name: 'Get Position by Contract ID',
			value: 'getPositionByConid',
			description: 'Get position for a specific contract',
			action: 'Get position for contract',
		},
		{
			name: 'Get Positions by Page',
			value: 'getPositionsByPage',
			description: 'Get paginated positions',
			action: 'Get paginated positions',
		},
		{
			name: 'Invalidate Position Cache',
			value: 'invalidatePositionCache',
			description: 'Refresh position cache',
			action: 'Refresh position cache',
		},
		{
			name: 'Get Allocations',
			value: 'getAllocations',
			description: 'Get portfolio allocations',
			action: 'Get portfolio allocations',
		},
	],
	default: 'getPositions',
};

export const portfolioFields: INodeProperties[] = [
	{
		displayName: 'Account ID',
		name: 'accountIdOverride',
		type: 'string',
		default: '',
		description: 'Override the account ID from credentials. Leave empty to use credentials.',
		displayOptions: {
			show: {
				resource: ['portfolio'],
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
				resource: ['portfolio'],
				operation: ['getPositionByConid'],
			},
		},
	},
	{
		displayName: 'Page',
		name: 'pageId',
		type: 'number',
		default: 0,
		description: 'Page number for pagination (starts at 0)',
		displayOptions: {
			show: {
				resource: ['portfolio'],
				operation: ['getPositionsByPage'],
			},
		},
	},
	{
		displayName: 'Model',
		name: 'model',
		type: 'string',
		default: '',
		description: 'Model for allocations',
		displayOptions: {
			show: {
				resource: ['portfolio'],
				operation: ['getAllocations'],
			},
		},
	},
	{
		displayName: 'Sort',
		name: 'sort',
		type: 'options',
		options: [
			{ name: 'Position', value: 'position' },
			{ name: 'Market Value', value: 'marketValue' },
			{ name: 'Unrealized PnL', value: 'unrealizedPnl' },
			{ name: 'Unrealized PnL %', value: 'unrealizedPnlPercent' },
		],
		default: 'position',
		description: 'Sort order for positions',
		displayOptions: {
			show: {
				resource: ['portfolio'],
				operation: ['getPositions', 'getPositionsByPage'],
			},
		},
	},
	{
		displayName: 'Direction',
		name: 'direction',
		type: 'options',
		options: [
			{ name: 'Ascending', value: 'a' },
			{ name: 'Descending', value: 'd' },
		],
		default: 'a',
		description: 'Sort direction',
		displayOptions: {
			show: {
				resource: ['portfolio'],
				operation: ['getPositions', 'getPositionsByPage'],
			},
		},
	},
];

export async function executePortfolioOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	const credentials = await getCredentials.call(this);
	const accountIdOverride = this.getNodeParameter('accountIdOverride', i, '') as string;
	const accountId = accountIdOverride || credentials.accountId;

	let response: IDataObject | IDataObject[];

	switch (operation) {
		case 'getPositions': {
			const sort = this.getNodeParameter('sort', i, 'position') as string;
			const direction = this.getNodeParameter('direction', i, 'a') as string;

			response = await ibkrApiRequest.call(this, {
				method: 'GET',
				endpoint: `/portfolio/${accountId}/positions/0`,
				query: {
					sort,
					direction,
				},
			});
			break;
		}

		case 'getPositionByConid': {
			const conid = parseConid(this.getNodeParameter('conid', i) as string);

			response = await ibkrApiRequest.call(this, {
				method: 'GET',
				endpoint: `/portfolio/${accountId}/position/${conid}`,
			});
			break;
		}

		case 'getPositionsByPage': {
			const pageId = this.getNodeParameter('pageId', i, 0) as number;
			const sort = this.getNodeParameter('sort', i, 'position') as string;
			const direction = this.getNodeParameter('direction', i, 'a') as string;

			response = await ibkrApiRequest.call(this, {
				method: 'GET',
				endpoint: `/portfolio/${accountId}/positions/${pageId}`,
				query: {
					sort,
					direction,
				},
			});
			break;
		}

		case 'invalidatePositionCache': {
			response = await ibkrApiRequest.call(this, {
				method: 'POST',
				endpoint: `/portfolio/${accountId}/positions/invalidate`,
			});
			break;
		}

		case 'getAllocations': {
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

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return response;
}
