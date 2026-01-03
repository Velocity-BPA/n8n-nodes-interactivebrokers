/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeProperties } from 'n8n-workflow';

export const RESOURCES = {
	SESSION: 'session',
	ACCOUNT: 'account',
	PORTFOLIO: 'portfolio',
	ORDERS: 'orders',
	TRADES: 'trades',
	MARKET_DATA: 'marketData',
	CONTRACTS: 'contracts',
	SCANNER: 'scanner',
	ALERTS: 'alerts',
	WATCHLISTS: 'watchlists',
	FUND_BANKING: 'fundBanking',
	FA: 'fa',
	CALENDAR: 'calendar',
	PERFORMANCE: 'performance',
	UTILITY: 'utility',
} as const;

export const ORDER_TYPES = [
	{ name: 'Market', value: 'MKT' },
	{ name: 'Limit', value: 'LMT' },
	{ name: 'Stop', value: 'STP' },
	{ name: 'Stop Limit', value: 'STP_LIMIT' },
	{ name: 'Trailing Stop', value: 'TRAIL' },
	{ name: 'Trailing Stop Limit', value: 'TRAIL_LIMIT' },
	{ name: 'Market on Close', value: 'MOC' },
	{ name: 'Limit on Close', value: 'LOC' },
	{ name: 'Market on Open', value: 'MOO' },
	{ name: 'Limit on Open', value: 'LOO' },
	{ name: 'Market If Touched', value: 'MIT' },
	{ name: 'Limit If Touched', value: 'LIT' },
	{ name: 'Pegged to Market', value: 'PEG_MKT' },
	{ name: 'Pegged to Midpoint', value: 'PEG_MID' },
	{ name: 'Pegged to Primary', value: 'PEG_PRIM' },
	{ name: 'Relative', value: 'REL' },
	{ name: 'VWAP', value: 'VWAP' },
];

export const TIME_IN_FORCE = [
	{ name: 'Day', value: 'DAY' },
	{ name: 'Good Till Cancelled', value: 'GTC' },
	{ name: 'Immediate or Cancel', value: 'IOC' },
	{ name: 'Fill or Kill', value: 'FOK' },
	{ name: 'Opening', value: 'OPG' },
	{ name: 'Day Till Cancelled', value: 'DTC' },
];

export const SECURITY_TYPES = [
	{ name: 'Stock', value: 'STK' },
	{ name: 'Option', value: 'OPT' },
	{ name: 'Future', value: 'FUT' },
	{ name: 'Forex', value: 'CASH' },
	{ name: 'Bond', value: 'BOND' },
	{ name: 'Contract for Difference', value: 'CFD' },
	{ name: 'Warrant', value: 'WAR' },
	{ name: 'Index', value: 'IND' },
	{ name: 'Fund', value: 'FUND' },
	{ name: 'Structured Product', value: 'IOPT' },
];

export const EXCHANGES = [
	{ name: 'SMART', value: 'SMART' },
	{ name: 'NYSE', value: 'NYSE' },
	{ name: 'NASDAQ', value: 'NASDAQ' },
	{ name: 'AMEX', value: 'AMEX' },
	{ name: 'ARCA', value: 'ARCA' },
	{ name: 'BATS', value: 'BATS' },
	{ name: 'IEX', value: 'IEX' },
	{ name: 'CME', value: 'CME' },
	{ name: 'GLOBEX', value: 'GLOBEX' },
	{ name: 'NYMEX', value: 'NYMEX' },
	{ name: 'COMEX', value: 'COMEX' },
	{ name: 'CBOT', value: 'CBOT' },
	{ name: 'IDEALPRO', value: 'IDEALPRO' },
	{ name: 'LSE', value: 'LSE' },
	{ name: 'TSE', value: 'TSE' },
];

export const BAR_SIZES = [
	{ name: '1 Second', value: '1secs' },
	{ name: '5 Seconds', value: '5secs' },
	{ name: '10 Seconds', value: '10secs' },
	{ name: '15 Seconds', value: '15secs' },
	{ name: '30 Seconds', value: '30secs' },
	{ name: '1 Minute', value: '1min' },
	{ name: '2 Minutes', value: '2mins' },
	{ name: '3 Minutes', value: '3mins' },
	{ name: '5 Minutes', value: '5mins' },
	{ name: '10 Minutes', value: '10mins' },
	{ name: '15 Minutes', value: '15mins' },
	{ name: '30 Minutes', value: '30mins' },
	{ name: '1 Hour', value: '1hour' },
	{ name: '2 Hours', value: '2hours' },
	{ name: '3 Hours', value: '3hours' },
	{ name: '4 Hours', value: '4hours' },
	{ name: '8 Hours', value: '8hours' },
	{ name: '1 Day', value: '1day' },
	{ name: '1 Week', value: '1week' },
	{ name: '1 Month', value: '1month' },
];

export const DURATION_UNITS = [
	{ name: 'Seconds', value: 'S' },
	{ name: 'Days', value: 'D' },
	{ name: 'Weeks', value: 'W' },
	{ name: 'Months', value: 'M' },
	{ name: 'Years', value: 'Y' },
];

export const ALERT_CONDITIONS = [
	{ name: 'Price', value: 'price' },
	{ name: 'Trade', value: 'trade' },
	{ name: 'Volume', value: 'volume' },
	{ name: 'Time', value: 'time' },
	{ name: 'Margin', value: 'margin' },
	{ name: 'Bid', value: 'bid' },
	{ name: 'Ask', value: 'ask' },
	{ name: 'Last', value: 'last' },
];

export const ALERT_OPERATORS = [
	{ name: 'Greater Than or Equal', value: '1' },
	{ name: 'Less Than or Equal', value: '2' },
];

export const resourceProperty: INodeProperties = {
	displayName: 'Resource',
	name: 'resource',
	type: 'options',
	noDataExpression: true,
	options: [
		{
			name: 'Session',
			value: RESOURCES.SESSION,
			description: 'Manage authentication sessions',
		},
		{
			name: 'Account',
			value: RESOURCES.ACCOUNT,
			description: 'Access account information',
		},
		{
			name: 'Portfolio',
			value: RESOURCES.PORTFOLIO,
			description: 'Manage portfolio positions',
		},
		{
			name: 'Orders',
			value: RESOURCES.ORDERS,
			description: 'Place and manage orders',
		},
		{
			name: 'Trades',
			value: RESOURCES.TRADES,
			description: 'View executed trades',
		},
		{
			name: 'Market Data',
			value: RESOURCES.MARKET_DATA,
			description: 'Get market data and quotes',
		},
		{
			name: 'Contracts',
			value: RESOURCES.CONTRACTS,
			description: 'Search and get contract information',
		},
		{
			name: 'Scanner',
			value: RESOURCES.SCANNER,
			description: 'Run market scanners',
		},
		{
			name: 'Alerts',
			value: RESOURCES.ALERTS,
			description: 'Manage trading alerts',
		},
		{
			name: 'Watchlists',
			value: RESOURCES.WATCHLISTS,
			description: 'Manage watchlists',
		},
		{
			name: 'Fund/Banking',
			value: RESOURCES.FUND_BANKING,
			description: 'Access fund and banking operations',
		},
		{
			name: 'Financial Advisor',
			value: RESOURCES.FA,
			description: 'Financial advisor operations',
		},
		{
			name: 'Calendar',
			value: RESOURCES.CALENDAR,
			description: 'Trading calendar and schedules',
		},
		{
			name: 'Performance',
			value: RESOURCES.PERFORMANCE,
			description: 'Account performance analytics',
		},
		{
			name: 'Utility',
			value: RESOURCES.UTILITY,
			description: 'Utility operations',
		},
	],
	default: RESOURCES.ACCOUNT,
};

export const IBKR_ERROR_CODES: Record<string, string> = {
	'1100': 'Connectivity between IB and TWS has been lost',
	'1101': 'Connectivity between IB and TWS has been restored',
	'1102': 'Connectivity between IB and TWS has been restored - data maintained',
	'2100': 'New account data requested',
	'2101': 'Unable to subscribe to account',
	'2102': 'Unable to modify order',
	'2103': 'Market data farm connection is broken',
	'2104': 'Market data farm connection is OK',
	'2105': 'Historical Market Data Service is inactive',
	'2106': 'Historical Market Data Service is connected',
	'2107': 'Historical Market Data Service is inactive but active for contract',
	'2108': 'Market data farm is inactive',
	'2109': 'Order event warning - your order is not active',
	'2110': 'Connectivity between TWS and server is broken',
	'2137': 'Cross side warning',
	'10000': 'Order rejected - insufficient funds',
	'10001': 'Order rejected - contract not found',
	'10002': 'Order rejected - invalid account',
	'10003': 'Order rejected - price out of range',
	'10004': 'Order rejected - duplicate order',
	'10005': 'Order rejected - trading halted',
	'10006': 'Order rejected - order would trigger immediately',
	'10007': 'Order rejected - invalid order type',
	'10008': 'Order rejected - size out of range',
	'10009': 'Order rejected - order not found',
	'10010': 'Order rejected - cannot cancel filled order',
	'10011': 'Order rejected - invalid time in force',
	'10012': 'Order rejected - invalid security type',
	'10013': 'Order rejected - cannot route order',
	'10014': 'Order rejected - market closed',
	'10015': 'Order rejected - not authenticated',
	'10016': 'Order rejected - pending other request',
	'10017': 'Order rejected - order already filled',
	'10018': 'Order rejected - order already cancelled',
	'10019': 'Order rejected - order modification failed',
	'10020': 'Order rejected - internal error',
	'10021': 'Order rejected - invalid quantity',
	'10022': 'Order rejected - contract expired',
	'10023': 'Order rejected - invalid exchange',
	'10024': 'Order rejected - position limit exceeded',
	'10025': 'Order rejected - day trading margin call',
};

export const API_VERSION = 'v1';
export const DEFAULT_GATEWAY_URL = 'https://localhost:5000';
export const API_BASE_PATH = '/v1/api';
