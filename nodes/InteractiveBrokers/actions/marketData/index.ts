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
import { parseConid } from '../../utils';
import { BAR_SIZES, DURATION_UNITS } from '../../constants';

export const marketDataOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['marketData'],
		},
	},
	options: [
		{
			name: 'Get Market Data Snapshot',
			value: 'getMarketDataSnapshot',
			description: 'Get market data snapshot',
			action: 'Get market data snapshot',
		},
		{
			name: 'Get Market Data History',
			value: 'getMarketDataHistory',
			description: 'Get historical market data',
			action: 'Get historical market data',
		},
		{
			name: 'Unsubscribe Market Data',
			value: 'unsubscribeMarketData',
			description: 'Unsubscribe from market data',
			action: 'Unsubscribe from market data',
		},
		{
			name: 'Unsubscribe All',
			value: 'unsubscribeAll',
			description: 'Unsubscribe all market data',
			action: 'Unsubscribe all market data',
		},
	],
	default: 'getMarketDataSnapshot',
};

export const marketDataFields: INodeProperties[] = [
	{
		displayName: 'Contract IDs',
		name: 'conids',
		type: 'string',
		default: '',
		required: true,
		description: 'Comma-separated list of contract IDs',
		displayOptions: {
			show: {
				resource: ['marketData'],
				operation: ['getMarketDataSnapshot'],
			},
		},
	},
	{
		displayName: 'Contract ID',
		name: 'conid',
		type: 'string',
		default: '',
		required: true,
		description: 'The contract ID',
		displayOptions: {
			show: {
				resource: ['marketData'],
				operation: ['getMarketDataHistory', 'unsubscribeMarketData'],
			},
		},
	},
	{
		displayName: 'Fields',
		name: 'fields',
		type: 'multiOptions',
		options: [
			{ name: 'Last Price', value: '31' },
			{ name: 'Symbol', value: '55' },
			{ name: 'High', value: '70' },
			{ name: 'Low', value: '71' },
			{ name: 'Change', value: '82' },
			{ name: 'Change %', value: '83' },
			{ name: 'Bid Price', value: '84' },
			{ name: 'Ask Size', value: '85' },
			{ name: 'Ask Price', value: '86' },
			{ name: 'Bid Size', value: '88' },
			{ name: 'Volume', value: '7762' },
			{ name: 'Open', value: '7295' },
			{ name: 'Close', value: '7296' },
			{ name: 'Put/Call Interest', value: '7308' },
			{ name: 'Put/Call Volume', value: '7309' },
			{ name: 'Implied Volatility', value: '7283' },
			{ name: 'Market Cap', value: '7289' },
			{ name: 'P/E Ratio', value: '7290' },
			{ name: 'EPS', value: '7291' },
			{ name: '52 Week High', value: '7293' },
			{ name: '52 Week Low', value: '7294' },
			{ name: 'Dividend Yield', value: '7287' },
		],
		default: ['31', '84', '86'],
		description: 'Market data fields to retrieve',
		displayOptions: {
			show: {
				resource: ['marketData'],
				operation: ['getMarketDataSnapshot'],
			},
		},
	},
	{
		displayName: 'Bar Size',
		name: 'barSize',
		type: 'options',
		options: BAR_SIZES,
		default: '1day',
		description: 'Bar size for historical data',
		displayOptions: {
			show: {
				resource: ['marketData'],
				operation: ['getMarketDataHistory'],
			},
		},
	},
	{
		displayName: 'Duration Amount',
		name: 'durationAmount',
		type: 'number',
		default: 1,
		description: 'Duration amount',
		displayOptions: {
			show: {
				resource: ['marketData'],
				operation: ['getMarketDataHistory'],
			},
		},
	},
	{
		displayName: 'Duration Unit',
		name: 'durationUnit',
		type: 'options',
		options: DURATION_UNITS,
		default: 'M',
		description: 'Duration unit',
		displayOptions: {
			show: {
				resource: ['marketData'],
				operation: ['getMarketDataHistory'],
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
				resource: ['marketData'],
				operation: ['getMarketDataHistory'],
			},
		},
		options: [
			{
				displayName: 'Exchange',
				name: 'exchange',
				type: 'string',
				default: '',
				description: 'Exchange to retrieve data from',
			},
			{
				displayName: 'Outside Regular Trading Hours',
				name: 'outsideRth',
				type: 'boolean',
				default: false,
				description: 'Whether to include data outside regular trading hours',
			},
			{
				displayName: 'Start Time',
				name: 'startTime',
				type: 'string',
				default: '',
				description: 'Start time in format YYYYMMDD-HH:MM:SS',
			},
		],
	},
];

export async function executeMarketDataOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let response: IDataObject | IDataObject[];

	switch (operation) {
		case 'getMarketDataSnapshot': {
			const conids = this.getNodeParameter('conids', i) as string;
			const fields = this.getNodeParameter('fields', i, ['31', '84', '86']) as string[];

			response = await ibkrApiRequest.call(this, {
				method: 'GET',
				endpoint: '/iserver/marketdata/snapshot',
				query: {
					conids,
					fields: fields.join(','),
				},
			});
			break;
		}

		case 'getMarketDataHistory': {
			const conid = parseConid(this.getNodeParameter('conid', i) as string);
			const barSize = this.getNodeParameter('barSize', i, '1day') as string;
			const durationAmount = this.getNodeParameter('durationAmount', i, 1) as number;
			const durationUnit = this.getNodeParameter('durationUnit', i, 'M') as string;
			const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;

			const query: IDataObject = {
				conid: conid.toString(),
				period: `${durationAmount}${durationUnit}`,
				bar: barSize,
			};

			if (additionalOptions.exchange) {
				query.exchange = additionalOptions.exchange;
			}
			if (additionalOptions.outsideRth) {
				query.outsideRth = 'true';
			}
			if (additionalOptions.startTime) {
				query.startTime = additionalOptions.startTime;
			}

			response = await ibkrApiRequest.call(this, {
				method: 'GET',
				endpoint: '/iserver/marketdata/history',
				query,
			});
			break;
		}

		case 'unsubscribeMarketData': {
			const conid = parseConid(this.getNodeParameter('conid', i) as string);

			response = await ibkrApiRequest.call(this, {
				method: 'GET',
				endpoint: `/iserver/marketdata/${conid}/unsubscribe`,
			});
			break;
		}

		case 'unsubscribeAll': {
			response = await ibkrApiRequest.call(this, {
				method: 'GET',
				endpoint: '/iserver/marketdata/unsubscribeall',
			});
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return response;
}
