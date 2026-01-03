/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject } from 'n8n-workflow';

/**
 * Validate contract ID
 */
export function validateConid(conid: string): boolean {
	if (!conid || conid.length === 0) {
		return false;
	}
	const num = parseInt(conid, 10);
	return !isNaN(num) && num > 0;
}

/**
 * Validate account ID format
 */
export function validateAccountId(accountId: string): boolean {
	if (!accountId || accountId.length === 0) {
		return false;
	}
	// IBKR account IDs start with U, DU, F, or other letters followed by numbers
	return /^[A-Z]{1,2}\d{6,}$/.test(accountId);
}

/**
 * Format quantity as integer string
 */
export function formatQuantity(quantity: number): string {
	return Math.round(quantity).toString();
}

/**
 * Parse order side to uppercase
 */
export function parseOrderSide(side: string): 'BUY' | 'SELL' {
	const normalized = side.toUpperCase();
	if (normalized === 'BUY' || normalized === 'SELL') {
		return normalized;
	}
	throw new Error(`Invalid order side: ${side}. Must be BUY or SELL.`);
}

/**
 * Parse order type to IBKR format
 */
export function parseOrderType(orderType: string): string {
	const normalized = orderType.toUpperCase();
	const mapping: Record<string, string> = {
		'MKT': 'MKT',
		'MARKET': 'MKT',
		'LMT': 'LMT',
		'LIMIT': 'LMT',
		'STP': 'STP',
		'STOP': 'STP',
		'STP_LIMIT': 'STP_LIMIT',
		'STOPLIMIT': 'STP_LIMIT',
		'STOP_LIMIT': 'STP_LIMIT',
		'TRAIL': 'TRAIL',
		'TRAILING': 'TRAIL',
		'TRAIL_LIMIT': 'TRAIL_LIMIT',
		'MOC': 'MOC',
		'LOC': 'LOC',
		'MIT': 'MIT',
		'LIT': 'LIT',
	};
	return mapping[normalized] || normalized;
}

/**
 * Build query string from object
 */
export function buildQueryString(params: Record<string, unknown>): string {
	const parts: string[] = [];
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined && value !== null) {
			parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
		}
	}
	return parts.join('&');
}

/**
 * Clean undefined values from an object
 */
export function cleanObject(obj: IDataObject): IDataObject {
	const cleaned: IDataObject = {};
	for (const [key, value] of Object.entries(obj)) {
		if (value !== undefined && value !== null && value !== '') {
			cleaned[key] = value;
		}
	}
	return cleaned;
}

/**
 * Parse contract ID from string or number
 */
export function parseConid(conid: string | number): number {
	if (typeof conid === 'number') {
		return conid;
	}
	return parseInt(conid, 10);
}

/**
 * Format date for IBKR API (YYYYMMDD)
 */
export function formatDateIBKR(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	const year = d.getFullYear();
	const month = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${year}${month}${day}`;
}

/**
 * Format datetime for IBKR API
 */
export function formatDateTimeIBKR(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	return `${formatDateIBKR(d)}-${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

/**
 * Parse IBKR date format to ISO date
 */
export function parseIBKRDate(dateStr: string): Date {
	// Handle YYYYMMDD format
	if (/^\d{8}$/.test(dateStr)) {
		const year = parseInt(dateStr.substring(0, 4), 10);
		const month = parseInt(dateStr.substring(4, 6), 10) - 1;
		const day = parseInt(dateStr.substring(6, 8), 10);
		return new Date(year, month, day);
	}
	// Handle other formats
	return new Date(dateStr);
}

/**
 * Calculate duration string for historical data
 */
export function calculateDuration(
	amount: number,
	unit: 'S' | 'D' | 'W' | 'M' | 'Y',
): string {
	return `${amount} ${unit}`;
}

/**
 * Format price with proper decimal places
 */
export function formatPrice(price: number, decimals: number = 2): string {
	return price.toFixed(decimals);
}

/**
 * Validate order parameters - throws on error
 */
export function validateOrderParams(params: IDataObject): void {
	const errors: string[] = [];
	const orderType = params.orderType as string;

	// Check required fields
	if (!params.conid) {
		errors.push('Contract ID (conid) is required');
	}
	if (!params.side) {
		errors.push('Order side (BUY/SELL) is required');
	}
	if (!params.quantity || (params.quantity as number) <= 0) {
		errors.push('Quantity must be greater than 0');
	}
	if (!params.orderType) {
		errors.push('Order type is required');
	}

	// Order type specific validation
	if (['LMT', 'STP_LIMIT', 'LIT', 'LOC', 'LOO'].includes(orderType)) {
		if (!params.price) {
			errors.push(`Price is required for ${orderType} orders`);
		}
	}

	if (['STP', 'STP_LIMIT'].includes(orderType)) {
		if (!params.auxPrice) {
			errors.push(`Stop price (auxPrice) is required for ${orderType} orders`);
		}
	}

	if (['TRAIL', 'TRAIL_LIMIT'].includes(orderType)) {
		if (!params.trailingAmt && !params.trailingPercent) {
			errors.push(`Trailing amount or percent is required for ${orderType} orders`);
		}
	}

	if (errors.length > 0) {
		throw new Error(errors.join('; '));
	}
}

/**
 * Validate order parameters - returns validation result
 */
export function validateOrderParamsWithResult(
	orderType: string,
	params: IDataObject,
): { valid: boolean; errors: string[] } {
	const errors: string[] = [];

	// Check required fields
	if (!params.conid) {
		errors.push('Contract ID (conid) is required');
	}
	if (!params.side) {
		errors.push('Order side (BUY/SELL) is required');
	}
	if (!params.quantity || (params.quantity as number) <= 0) {
		errors.push('Quantity must be greater than 0');
	}

	// Order type specific validation
	if (['LMT', 'STP_LIMIT', 'LIT', 'LOC', 'LOO'].includes(orderType)) {
		if (!params.price) {
			errors.push(`Price is required for ${orderType} orders`);
		}
	}

	if (['STP', 'STP_LIMIT'].includes(orderType)) {
		if (!params.auxPrice) {
			errors.push(`Stop price (auxPrice) is required for ${orderType} orders`);
		}
	}

	if (['TRAIL', 'TRAIL_LIMIT'].includes(orderType)) {
		if (!params.trailingAmt && !params.trailingPercent) {
			errors.push(`Trailing amount or percent is required for ${orderType} orders`);
		}
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}

/**
 * Parse order status to human-readable format
 */
export function parseOrderStatus(status: string): string {
	const statusMap: Record<string, string> = {
		PendingSubmit: 'Pending Submit',
		PendingCancel: 'Pending Cancel',
		PreSubmitted: 'Pre-submitted',
		Submitted: 'Submitted',
		Cancelled: 'Cancelled',
		Filled: 'Filled',
		Inactive: 'Inactive',
		ApiPending: 'API Pending',
		ApiCancelled: 'API Cancelled',
		Error: 'Error',
		WarnState: 'Warning State',
	};
	return statusMap[status] || status;
}

/**
 * Calculate order total value
 */
export function calculateOrderValue(
	quantity: number,
	price: number,
	multiplier: number = 1,
): number {
	return quantity * price * multiplier;
}

/**
 * Format account ID for display
 */
export function formatAccountId(accountId: string): string {
	// Paper accounts start with 'DU'
	if (accountId.startsWith('DU')) {
		return `${accountId} (Paper)`;
	}
	return accountId;
}

/**
 * Check if session is authenticated
 */
export function isAuthenticated(authStatus: IDataObject): boolean {
	return authStatus.authenticated === true && authStatus.connected === true;
}

/**
 * Build market data fields string
 */
export function buildMarketDataFields(fields: string[]): string {
	return fields.join(',');
}

/**
 * Parse market data snapshot
 */
export function parseMarketDataSnapshot(data: IDataObject): IDataObject {
	const parsed: IDataObject = {
		conid: data.conid,
		symbol: data['55'],
		lastPrice: data['31'],
		bidPrice: data['84'],
		askPrice: data['86'],
		bidSize: data['88'],
		askSize: data['85'],
		volume: data['7762'],
		high: data['70'],
		low: data['71'],
		open: data['7295'],
		close: data['7296'],
		change: data['82'],
		changePercent: data['83'],
	};
	return cleanObject(parsed);
}

/**
 * Format scanner filter
 */
export function formatScannerFilter(
	type: string,
	instrument: string,
	filters: IDataObject[],
): IDataObject {
	return {
		instrument,
		type,
		filter: filters,
	};
}

/**
 * Sleep utility for rate limiting
 */
export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry utility with exponential backoff
 */
export async function retryWithBackoff<T>(
	fn: () => Promise<T>,
	maxRetries: number = 3,
	baseDelay: number = 1000,
): Promise<T> {
	let lastError: Error | undefined;

	for (let i = 0; i < maxRetries; i++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error as Error;
			if (i < maxRetries - 1) {
				const delay = baseDelay * Math.pow(2, i);
				await sleep(delay);
			}
		}
	}

	throw lastError;
}

/**
 * Check if market is open based on schedule
 */
export function isMarketOpen(schedule: IDataObject): boolean {
	const now = new Date();
	const openTime = schedule.openingTime as string;
	const closeTime = schedule.closingTime as string;

	if (!openTime || !closeTime) {
		return false;
	}

	const [openHour, openMin] = openTime.split(':').map(Number);
	const [closeHour, closeMin] = closeTime.split(':').map(Number);

	const currentMinutes = now.getHours() * 60 + now.getMinutes();
	const openMinutes = openHour * 60 + openMin;
	const closeMinutes = closeHour * 60 + closeMin;

	return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
}
