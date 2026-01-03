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
import { parseConid, cleanObject } from '../../utils';

export const watchlistsOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['watchlists'],
		},
	},
	options: [
		{
			name: 'Get Watchlists',
			value: 'getWatchlists',
			description: 'Get all watchlists',
			action: 'Get all watchlists',
		},
		{
			name: 'Create Watchlist',
			value: 'createWatchlist',
			description: 'Create watchlist',
			action: 'Create watchlist',
		},
		{
			name: 'Get Watchlist',
			value: 'getWatchlist',
			description: 'Get watchlist by ID',
			action: 'Get watchlist by ID',
		},
		{
			name: 'Update Watchlist',
			value: 'updateWatchlist',
			description: 'Update watchlist',
			action: 'Update watchlist',
		},
		{
			name: 'Delete Watchlist',
			value: 'deleteWatchlist',
			description: 'Delete watchlist',
			action: 'Delete watchlist',
		},
	],
	default: 'getWatchlists',
};

export const watchlistsFields: INodeProperties[] = [
	{
		displayName: 'Watchlist ID',
		name: 'watchlistId',
		type: 'string',
		default: '',
		required: true,
		description: 'The watchlist ID',
		displayOptions: {
			show: {
				resource: ['watchlists'],
				operation: ['getWatchlist', 'updateWatchlist', 'deleteWatchlist'],
			},
		},
	},
	{
		displayName: 'Watchlist Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		description: 'Name of the watchlist',
		displayOptions: {
			show: {
				resource: ['watchlists'],
				operation: ['createWatchlist', 'updateWatchlist'],
			},
		},
	},
	{
		displayName: 'Contract IDs',
		name: 'conids',
		type: 'string',
		default: '',
		description: 'Comma-separated list of contract IDs to add to watchlist',
		displayOptions: {
			show: {
				resource: ['watchlists'],
				operation: ['createWatchlist', 'updateWatchlist'],
			},
		},
	},
];

export async function executeWatchlistsOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let response: IDataObject | IDataObject[];

	switch (operation) {
		case 'getWatchlists': {
			response = await ibkrApiRequest.call(this, {
				method: 'GET',
				endpoint: '/iserver/watchlists',
			});
			break;
		}

		case 'createWatchlist': {
			const name = this.getNodeParameter('name', i) as string;
			const conidsStr = this.getNodeParameter('conids', i, '') as string;

			const rows: IDataObject[] = [];
			if (conidsStr) {
				const conids = conidsStr.split(',').map((c) => parseConid(c.trim()));
				conids.forEach((conid) => {
					rows.push({ C: conid });
				});
			}

			const body = cleanObject({
				name,
				rows: rows.length > 0 ? rows : undefined,
			});

			response = await ibkrApiRequest.call(this, {
				method: 'POST',
				endpoint: '/iserver/watchlists',
				body,
			});
			break;
		}

		case 'getWatchlist': {
			const watchlistId = this.getNodeParameter('watchlistId', i) as string;

			response = await ibkrApiRequest.call(this, {
				method: 'GET',
				endpoint: `/iserver/watchlists/${watchlistId}`,
			});
			break;
		}

		case 'updateWatchlist': {
			const watchlistId = this.getNodeParameter('watchlistId', i) as string;
			const name = this.getNodeParameter('name', i) as string;
			const conidsStr = this.getNodeParameter('conids', i, '') as string;

			const rows: IDataObject[] = [];
			if (conidsStr) {
				const conids = conidsStr.split(',').map((c) => parseConid(c.trim()));
				conids.forEach((conid) => {
					rows.push({ C: conid });
				});
			}

			const body = cleanObject({
				id: watchlistId,
				name,
				rows: rows.length > 0 ? rows : undefined,
			});

			response = await ibkrApiRequest.call(this, {
				method: 'PUT',
				endpoint: `/iserver/watchlists/${watchlistId}`,
				body,
			});
			break;
		}

		case 'deleteWatchlist': {
			const watchlistId = this.getNodeParameter('watchlistId', i) as string;

			response = await ibkrApiRequest.call(this, {
				method: 'DELETE',
				endpoint: `/iserver/watchlists/${watchlistId}`,
			});
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return response;
}
