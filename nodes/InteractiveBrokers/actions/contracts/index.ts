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
import { SECURITY_TYPES } from '../../constants';

export const contractsOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['contracts'],
		},
	},
	options: [
		{
			name: 'Search Contracts',
			value: 'searchContracts',
			description: 'Search for contracts by symbol',
			action: 'Search for contracts by symbol',
		},
		{
			name: 'Get Contract Details',
			value: 'getContractDetails',
			description: 'Get contract details by conid',
			action: 'Get contract details by conid',
		},
		{
			name: 'Get Contract Info',
			value: 'getContractInfo',
			description: 'Get detailed contract info',
			action: 'Get detailed contract info',
		},
		{
			name: 'Get Contract Rules',
			value: 'getContractRules',
			description: 'Get trading rules for contract',
			action: 'Get trading rules for contract',
		},
		{
			name: 'Get Security Definition',
			value: 'getSecDefByConid',
			description: 'Get security definition',
			action: 'Get security definition',
		},
		{
			name: 'Get Futures by Symbol',
			value: 'getFuturesBySymbol',
			description: 'Get futures contracts',
			action: 'Get futures contracts',
		},
		{
			name: 'Get Stocks by Symbol',
			value: 'getStocksBySymbol',
			description: 'Get stocks by symbol',
			action: 'Get stocks by symbol',
		},
		{
			name: 'Search Bond Filters',
			value: 'searchBondFilters',
			description: 'Search bond filters',
			action: 'Search bond filters',
		},
		{
			name: 'Get IB Algo Parameters',
			value: 'getIBAlgoParams',
			description: 'Get IB algorithm parameters',
			action: 'Get IB algorithm parameters',
		},
	],
	default: 'searchContracts',
};

export const contractsFields: INodeProperties[] = [
	{
		displayName: 'Symbol',
		name: 'symbol',
		type: 'string',
		default: '',
		required: true,
		description: 'Symbol to search for',
		displayOptions: {
			show: {
				resource: ['contracts'],
				operation: ['searchContracts', 'getFuturesBySymbol', 'getStocksBySymbol'],
			},
		},
	},
	{
		displayName: 'Contract ID',
		name: 'conid',
		type: 'string',
		default: '',
		required: true,
		description: 'The contract ID (conid)',
		displayOptions: {
			show: {
				resource: ['contracts'],
				operation: ['getContractDetails', 'getContractInfo', 'getContractRules', 'getSecDefByConid', 'getIBAlgoParams'],
			},
		},
	},
	{
		displayName: 'Security Type',
		name: 'secType',
		type: 'options',
		options: SECURITY_TYPES,
		default: 'STK',
		description: 'Security type to filter by',
		displayOptions: {
			show: {
				resource: ['contracts'],
				operation: ['searchContracts'],
			},
		},
	},
	{
		displayName: 'Name Filter',
		name: 'name',
		type: 'boolean',
		default: false,
		description: 'Whether to search by company name instead of symbol',
		displayOptions: {
			show: {
				resource: ['contracts'],
				operation: ['searchContracts'],
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
				resource: ['contracts'],
				operation: ['searchBondFilters'],
			},
		},
		options: [
			{
				displayName: 'Symbol',
				name: 'symbol',
				type: 'string',
				default: '',
				description: 'Symbol to filter bonds',
			},
			{
				displayName: 'Issuer ID',
				name: 'issuerId',
				type: 'string',
				default: '',
				description: 'Issuer ID to filter bonds',
			},
		],
	},
	{
		displayName: 'Is Buy',
		name: 'isBuy',
		type: 'boolean',
		default: true,
		description: 'Whether this is for a buy or sell order (affects contract rules)',
		displayOptions: {
			show: {
				resource: ['contracts'],
				operation: ['getContractRules'],
			},
		},
	},
];

export async function executeContractsOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let response: IDataObject | IDataObject[];

	switch (operation) {
		case 'searchContracts': {
			const symbol = this.getNodeParameter('symbol', i) as string;
			const secType = this.getNodeParameter('secType', i, 'STK') as string;
			const name = this.getNodeParameter('name', i, false) as boolean;

			response = await ibkrApiRequest.call(this, {
				method: 'GET',
				endpoint: '/iserver/secdef/search',
				query: {
					symbol,
					secType,
					name: name.toString(),
				},
			});
			break;
		}

		case 'getContractDetails': {
			const conid = parseConid(this.getNodeParameter('conid', i) as string);

			response = await ibkrApiRequest.call(this, {
				method: 'GET',
				endpoint: `/iserver/contract/${conid}/info`,
			});
			break;
		}

		case 'getContractInfo': {
			const conid = parseConid(this.getNodeParameter('conid', i) as string);

			response = await ibkrApiRequest.call(this, {
				method: 'GET',
				endpoint: `/iserver/contract/${conid}/info-and-rules`,
			});
			break;
		}

		case 'getContractRules': {
			const conid = parseConid(this.getNodeParameter('conid', i) as string);
			const isBuy = this.getNodeParameter('isBuy', i, true) as boolean;

			response = await ibkrApiRequest.call(this, {
				method: 'GET',
				endpoint: `/iserver/contract/${conid}/rules`,
				query: {
					isBuy: isBuy.toString(),
				},
			});
			break;
		}

		case 'getSecDefByConid': {
			const conid = parseConid(this.getNodeParameter('conid', i) as string);

			response = await ibkrApiRequest.call(this, {
				method: 'POST',
				endpoint: '/trsrv/secdef',
				body: {
					conids: [conid],
				},
			});
			break;
		}

		case 'getFuturesBySymbol': {
			const symbol = this.getNodeParameter('symbol', i) as string;

			response = await ibkrApiRequest.call(this, {
				method: 'GET',
				endpoint: '/trsrv/futures',
				query: {
					symbols: symbol,
				},
			});
			break;
		}

		case 'getStocksBySymbol': {
			const symbol = this.getNodeParameter('symbol', i) as string;

			response = await ibkrApiRequest.call(this, {
				method: 'GET',
				endpoint: '/trsrv/stocks',
				query: {
					symbols: symbol,
				},
			});
			break;
		}

		case 'searchBondFilters': {
			const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;
			const query: IDataObject = {};

			if (additionalOptions.symbol) {
				query.symbol = additionalOptions.symbol;
			}
			if (additionalOptions.issuerId) {
				query.issuerId = additionalOptions.issuerId;
			}

			response = await ibkrApiRequest.call(this, {
				method: 'GET',
				endpoint: '/iserver/secdef/bond-filters',
				query,
			});
			break;
		}

		case 'getIBAlgoParams': {
			const conid = parseConid(this.getNodeParameter('conid', i) as string);

			response = await ibkrApiRequest.call(this, {
				method: 'GET',
				endpoint: '/iserver/contract/${conid}/algos'.replace('${conid}', conid.toString()),
			});
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return response;
}
