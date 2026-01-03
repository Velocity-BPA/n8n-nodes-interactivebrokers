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

export const scannerOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['scanner'],
		},
	},
	options: [
		{
			name: 'Get Scanner Parameters',
			value: 'getScannerParams',
			description: 'Get scanner parameters',
			action: 'Get scanner parameters',
		},
		{
			name: 'Run Scanner',
			value: 'runScanner',
			description: 'Run market scanner',
			action: 'Run market scanner',
		},
		{
			name: 'Get HMDS Scanner Parameters',
			value: 'getHMDSScannerParams',
			description: 'Get HMDS scanner params',
			action: 'Get HMDS scanner params',
		},
	],
	default: 'getScannerParams',
};

export const scannerFields: INodeProperties[] = [
	{
		displayName: 'Instrument',
		name: 'instrument',
		type: 'options',
		options: [
			{ name: 'Stocks - US', value: 'STK.US' },
			{ name: 'Stocks - US (Major)', value: 'STK.US.MAJOR' },
			{ name: 'Stocks - US (Minor)', value: 'STK.US.MINOR' },
			{ name: 'Stocks - EU', value: 'STK.EU' },
			{ name: 'Stocks - HK', value: 'STK.HK' },
			{ name: 'ETFs - US', value: 'ETF.US' },
			{ name: 'Options', value: 'OPT' },
			{ name: 'Futures', value: 'FUT.US' },
			{ name: 'Forex', value: 'FX' },
			{ name: 'Bonds', value: 'BOND' },
			{ name: 'Mutual Funds', value: 'FUND.US' },
			{ name: 'Warrants', value: 'WAR' },
		],
		default: 'STK.US.MAJOR',
		required: true,
		description: 'Instrument type to scan',
		displayOptions: {
			show: {
				resource: ['scanner'],
				operation: ['runScanner'],
			},
		},
	},
	{
		displayName: 'Scan Type',
		name: 'scanType',
		type: 'options',
		options: [
			{ name: 'Top % Gainers', value: 'TOP_PERC_GAIN' },
			{ name: 'Top % Losers', value: 'TOP_PERC_LOSE' },
			{ name: 'Most Active', value: 'MOST_ACTIVE' },
			{ name: 'Hot by Volume', value: 'HOT_BY_VOLUME' },
			{ name: 'Hot by Price', value: 'HOT_BY_PRICE' },
			{ name: 'Hot by Price Range', value: 'HOT_BY_PRICE_RANGE' },
			{ name: 'Top Trade Count', value: 'TOP_TRADE_COUNT' },
			{ name: 'Top Trade Rate', value: 'TOP_TRADE_RATE' },
			{ name: 'Top Open Interest', value: 'TOP_OPEN_INTEREST' },
			{ name: 'Highest Option Volume', value: 'HIGH_OPT_VOLUME' },
			{ name: 'Highest Put Call Ratio', value: 'HIGH_OPEN_INT_PUT_CALL_RATIO' },
			{ name: 'High Dividend Yield', value: 'HIGH_DIV_YIELD' },
			{ name: 'Low P/E Ratio', value: 'LOW_PE_RATIO' },
			{ name: 'High P/E Ratio', value: 'HIGH_PE_RATIO' },
			{ name: 'Near 52 Week High', value: 'SCAN_52WK_HL_NEAR_HIGH' },
			{ name: 'Near 52 Week Low', value: 'SCAN_52WK_HL_NEAR_LOW' },
			{ name: 'New 52 Week High', value: 'SCAN_52WK_HL_NEW_HIGH' },
			{ name: 'New 52 Week Low', value: 'SCAN_52WK_HL_NEW_LOW' },
			{ name: 'Volume Rate Change', value: 'VOLUME_RATE_CHANGE' },
		],
		default: 'TOP_PERC_GAIN',
		required: true,
		description: 'Type of scan to run',
		displayOptions: {
			show: {
				resource: ['scanner'],
				operation: ['runScanner'],
			},
		},
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['scanner'],
				operation: ['runScanner'],
			},
		},
		options: [
			{
				displayName: 'Price Above',
				name: 'priceAbove',
				type: 'number',
				default: 0,
				description: 'Minimum price filter',
			},
			{
				displayName: 'Price Below',
				name: 'priceBelow',
				type: 'number',
				default: 0,
				description: 'Maximum price filter',
			},
			{
				displayName: 'Volume Above',
				name: 'volumeAbove',
				type: 'number',
				default: 0,
				description: 'Minimum volume filter',
			},
			{
				displayName: 'Market Cap Above',
				name: 'marketCapAbove',
				type: 'number',
				default: 0,
				description: 'Minimum market cap (in millions)',
			},
			{
				displayName: 'Market Cap Below',
				name: 'marketCapBelow',
				type: 'number',
				default: 0,
				description: 'Maximum market cap (in millions)',
			},
			{
				displayName: 'Average Volume Above',
				name: 'avgVolumeAbove',
				type: 'number',
				default: 0,
				description: 'Minimum average volume',
			},
		],
	},
	{
		displayName: 'Location',
		name: 'location',
		type: 'string',
		default: '',
		description: 'Location code for scanner',
		displayOptions: {
			show: {
				resource: ['scanner'],
				operation: ['runScanner'],
			},
		},
	},
	{
		displayName: 'Size',
		name: 'size',
		type: 'number',
		default: 25,
		description: 'Number of results to return (max 50)',
		displayOptions: {
			show: {
				resource: ['scanner'],
				operation: ['runScanner'],
			},
		},
	},
];

export async function executeScannerOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let response: IDataObject | IDataObject[];

	switch (operation) {
		case 'getScannerParams': {
			response = await ibkrApiRequest.call(this, {
				method: 'GET',
				endpoint: '/iserver/scanner/params',
			});
			break;
		}

		case 'runScanner': {
			const instrument = this.getNodeParameter('instrument', i) as string;
			const scanType = this.getNodeParameter('scanType', i) as string;
			const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
			const location = this.getNodeParameter('location', i, '') as string;
			const size = this.getNodeParameter('size', i, 25) as number;

			const filterArray: IDataObject[] = [];

			if (filters.priceAbove) {
				filterArray.push({ code: 'priceAbove', value: filters.priceAbove });
			}
			if (filters.priceBelow) {
				filterArray.push({ code: 'priceBelow', value: filters.priceBelow });
			}
			if (filters.volumeAbove) {
				filterArray.push({ code: 'volumeAbove', value: filters.volumeAbove });
			}
			if (filters.marketCapAbove) {
				filterArray.push({ code: 'marketCapAbove1e6', value: filters.marketCapAbove });
			}
			if (filters.marketCapBelow) {
				filterArray.push({ code: 'marketCapBelow1e6', value: filters.marketCapBelow });
			}
			if (filters.avgVolumeAbove) {
				filterArray.push({ code: 'avgVolumeAbove', value: filters.avgVolumeAbove });
			}

			const body: IDataObject = {
				instrument,
				type: scanType,
				filter: filterArray,
			};

			if (location) {
				body.location = location;
			}
			if (size) {
				body.size = Math.min(size, 50).toString();
			}

			response = await ibkrApiRequest.call(this, {
				method: 'POST',
				endpoint: '/iserver/scanner/run',
				body,
			});
			break;
		}

		case 'getHMDSScannerParams': {
			response = await ibkrApiRequest.call(this, {
				method: 'GET',
				endpoint: '/hmds/scanner/params',
			});
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return response;
}
