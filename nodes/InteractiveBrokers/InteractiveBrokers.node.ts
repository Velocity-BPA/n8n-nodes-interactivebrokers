/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { sessionOperations, sessionFields, executeSessionOperation } from './actions/session';
import { accountOperations, accountFields, executeAccountOperation } from './actions/account';
import { portfolioOperations, portfolioFields, executePortfolioOperation } from './actions/portfolio';
import { ordersOperations, ordersFields, executeOrdersOperation } from './actions/orders';
import { tradesOperations, tradesFields, executeTradesOperation } from './actions/trades';
import { marketDataOperations, marketDataFields, executeMarketDataOperation } from './actions/marketData';
import { contractsOperations, contractsFields, executeContractsOperation } from './actions/contracts';
import { scannerOperations, scannerFields, executeScannerOperation } from './actions/scanner';
import { alertsOperations, alertsFields, executeAlertsOperation } from './actions/alerts';
import { watchlistsOperations, watchlistsFields, executeWatchlistsOperation } from './actions/watchlists';
import { fundBankingOperations, fundBankingFields, executeFundBankingOperation } from './actions/fundBanking';
import { faOperations, faFields, executeFAOperation } from './actions/fa';
import { calendarOperations, calendarFields, executeCalendarOperation } from './actions/calendar';
import { performanceOperations, performanceFields, executePerformanceOperation } from './actions/performance';
import { utilityOperations, utilityFields, executeUtilityOperation } from './actions/utility';

// Log licensing notice once on node load
const licensingLogged = false;
if (!licensingLogged) {
	console.warn(`[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.`);
}

export class InteractiveBrokers implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Interactive Brokers',
		name: 'interactiveBrokers',
		icon: 'file:interactiveBrokers.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Interactive Brokers Client Portal API',
		defaults: {
			name: 'Interactive Brokers',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'interactiveBrokersApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Account',
						value: 'account',
						description: 'Manage account information',
					},
					{
						name: 'Alert',
						value: 'alerts',
						description: 'Manage MTA alerts',
					},
					{
						name: 'Calendar',
						value: 'calendar',
						description: 'Get trading schedules and holidays',
					},
					{
						name: 'Contract',
						value: 'contracts',
						description: 'Search and retrieve contract information',
					},
					{
						name: 'FA (Financial Advisor)',
						value: 'fa',
						description: 'Financial advisor operations',
					},
					{
						name: 'Fund/Banking',
						value: 'fundBanking',
						description: 'Fund and banking operations',
					},
					{
						name: 'Market Data',
						value: 'marketData',
						description: 'Get market data snapshots and history',
					},
					{
						name: 'Order',
						value: 'orders',
						description: 'Place and manage orders',
					},
					{
						name: 'Performance',
						value: 'performance',
						description: 'Get account performance data',
					},
					{
						name: 'Portfolio',
						value: 'portfolio',
						description: 'Get portfolio positions and allocations',
					},
					{
						name: 'Scanner',
						value: 'scanner',
						description: 'Run market scanners',
					},
					{
						name: 'Session',
						value: 'session',
						description: 'Manage session and authentication',
					},
					{
						name: 'Trade',
						value: 'trades',
						description: 'Get executed trades',
					},
					{
						name: 'Utility',
						value: 'utility',
						description: 'Utility operations',
					},
					{
						name: 'Watchlist',
						value: 'watchlists',
						description: 'Manage watchlists',
					},
				],
				default: 'account',
			},
			// Session
			sessionOperations,
			...sessionFields,
			// Account
			accountOperations,
			...accountFields,
			// Portfolio
			portfolioOperations,
			...portfolioFields,
			// Orders
			ordersOperations,
			...ordersFields,
			// Trades
			tradesOperations,
			...tradesFields,
			// Market Data
			marketDataOperations,
			...marketDataFields,
			// Contracts
			contractsOperations,
			...contractsFields,
			// Scanner
			scannerOperations,
			...scannerFields,
			// Alerts
			alertsOperations,
			...alertsFields,
			// Watchlists
			watchlistsOperations,
			...watchlistsFields,
			// Fund/Banking
			fundBankingOperations,
			...fundBankingFields,
			// FA
			faOperations,
			...faFields,
			// Calendar
			calendarOperations,
			...calendarFields,
			// Performance
			performanceOperations,
			...performanceFields,
			// Utility
			utilityOperations,
			...utilityFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let response;

				switch (resource) {
					case 'session':
						response = await executeSessionOperation.call(this, operation, i);
						break;

					case 'account':
						response = await executeAccountOperation.call(this, operation, i);
						break;

					case 'portfolio':
						response = await executePortfolioOperation.call(this, operation, i);
						break;

					case 'orders':
						response = await executeOrdersOperation.call(this, operation, i);
						break;

					case 'trades':
						response = await executeTradesOperation.call(this, operation, i);
						break;

					case 'marketData':
						response = await executeMarketDataOperation.call(this, operation, i);
						break;

					case 'contracts':
						response = await executeContractsOperation.call(this, operation, i);
						break;

					case 'scanner':
						response = await executeScannerOperation.call(this, operation, i);
						break;

					case 'alerts':
						response = await executeAlertsOperation.call(this, operation, i);
						break;

					case 'watchlists':
						response = await executeWatchlistsOperation.call(this, operation, i);
						break;

					case 'fundBanking':
						response = await executeFundBankingOperation.call(this, operation, i);
						break;

					case 'fa':
						response = await executeFAOperation.call(this, operation, i);
						break;

					case 'calendar':
						response = await executeCalendarOperation.call(this, operation, i);
						break;

					case 'performance':
						response = await executePerformanceOperation.call(this, operation, i);
						break;

					case 'utility':
						response = await executeUtilityOperation.call(this, operation, i);
						break;

					default:
						throw new NodeOperationError(
							this.getNode(),
							`Unknown resource: ${resource}`,
						);
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(response),
					{ itemData: { item: i } },
				);

				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const executionErrorData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: (error as Error).message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionErrorData);
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
