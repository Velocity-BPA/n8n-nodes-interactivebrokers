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

export const calendarOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['calendar'],
		},
	},
	options: [
		{
			name: 'Get Trading Schedule',
			value: 'getTradingSchedule',
			description: 'Get trading schedule by asset',
			action: 'Get trading schedule by asset',
		},
		{
			name: 'Get Holidays',
			value: 'getHolidays',
			description: 'Get market holidays',
			action: 'Get market holidays',
		},
	],
	default: 'getTradingSchedule',
};

export const calendarFields: INodeProperties[] = [
	{
		displayName: 'Asset Class',
		name: 'assetClass',
		type: 'options',
		options: [
			{ name: 'Stocks', value: 'STK' },
			{ name: 'Options', value: 'OPT' },
			{ name: 'Futures', value: 'FUT' },
			{ name: 'Forex', value: 'CASH' },
			{ name: 'Bonds', value: 'BOND' },
			{ name: 'Funds', value: 'FUND' },
		],
		default: 'STK',
		description: 'Asset class for schedule',
		displayOptions: {
			show: {
				resource: ['calendar'],
				operation: ['getTradingSchedule'],
			},
		},
	},
	{
		displayName: 'Symbol',
		name: 'symbol',
		type: 'string',
		default: '',
		description: 'Symbol to get schedule for',
		displayOptions: {
			show: {
				resource: ['calendar'],
				operation: ['getTradingSchedule'],
			},
		},
	},
	{
		displayName: 'Exchange',
		name: 'exchange',
		type: 'string',
		default: '',
		description: 'Exchange to get schedule for',
		displayOptions: {
			show: {
				resource: ['calendar'],
				operation: ['getTradingSchedule', 'getHolidays'],
			},
		},
	},
	{
		displayName: 'Direction',
		name: 'direction',
		type: 'options',
		options: [
			{ name: 'Past', value: '-1' },
			{ name: 'Future', value: '1' },
		],
		default: '1',
		description: 'Direction for holidays lookup',
		displayOptions: {
			show: {
				resource: ['calendar'],
				operation: ['getHolidays'],
			},
		},
	},
];

export async function executeCalendarOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let response: IDataObject | IDataObject[];

	switch (operation) {
		case 'getTradingSchedule': {
			const assetClass = this.getNodeParameter('assetClass', i, 'STK') as string;
			const symbol = this.getNodeParameter('symbol', i, '') as string;
			const exchange = this.getNodeParameter('exchange', i, '') as string;

			const query: IDataObject = {
				assetClass,
			};

			if (symbol) {
				query.symbol = symbol;
			}
			if (exchange) {
				query.exchange = exchange;
			}

			response = await ibkrApiRequest.call(this, {
				method: 'GET',
				endpoint: '/trsrv/secdef/schedule',
				query,
			});
			break;
		}

		case 'getHolidays': {
			const exchange = this.getNodeParameter('exchange', i, '') as string;
			const direction = this.getNodeParameter('direction', i, '1') as string;

			const query: IDataObject = {
				direction,
			};

			if (exchange) {
				query.exchange = exchange;
			}

			response = await ibkrApiRequest.call(this, {
				method: 'GET',
				endpoint: '/trsrv/calendar',
				query,
			});
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return response;
}
