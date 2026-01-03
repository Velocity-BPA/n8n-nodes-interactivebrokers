/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IPollFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	IDataObject,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

import { API_BASE_PATH, IBKR_ERROR_CODES } from '../constants';

export interface IIBKRCredentials {
	accountId: string;
	sessionToken?: string;
	environment: 'production' | 'paper';
	gatewayUrl: string;
	ignoreSslErrors: boolean;
}

export interface IIBKRRequestOptions {
	method: IHttpRequestMethods;
	endpoint: string;
	body?: IDataObject;
	query?: IDataObject;
	headers?: IDataObject;
}

export interface IIBKRResponse {
	// Generic response fields
	[key: string]: unknown;
	error?: string;
	message?: string;
}

/**
 * Get credentials for Interactive Brokers API
 */
export async function getCredentials(
	this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions | IPollFunctions,
): Promise<IIBKRCredentials> {
	const credentials = await this.getCredentials('interactiveBrokersApi');
	return {
		accountId: credentials.accountId as string,
		sessionToken: credentials.sessionToken as string | undefined,
		environment: credentials.environment as 'production' | 'paper',
		gatewayUrl: credentials.gatewayUrl as string,
		ignoreSslErrors: credentials.ignoreSslErrors as boolean,
	};
}

/**
 * Format IBKR-specific error messages
 */
function formatErrorMessage(error: IDataObject): string {
	const errorCode = error.error_code?.toString() || error.code?.toString();
	const errorMessage = error.error?.toString() || error.message?.toString() || 'Unknown error';

	if (errorCode && IBKR_ERROR_CODES[errorCode]) {
		return `${IBKR_ERROR_CODES[errorCode]} (Code: ${errorCode})`;
	}

	return errorMessage;
}

/**
 * Make an API request to Interactive Brokers Client Portal API
 */
export async function ibkrApiRequest(
	this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions | IPollFunctions,
	options: IIBKRRequestOptions,
): Promise<IDataObject | IDataObject[]> {
	const credentials = await getCredentials.call(this);

	const baseUrl = credentials.gatewayUrl.replace(/\/$/, '');
	const url = `${baseUrl}${API_BASE_PATH}${options.endpoint}`;

	const requestOptions: IHttpRequestOptions = {
		method: options.method,
		url,
		json: true,
		skipSslCertificateValidation: credentials.ignoreSslErrors,
	};

	// Add headers
	requestOptions.headers = {
		'Content-Type': 'application/json',
		Accept: 'application/json',
		...options.headers,
	};

	// Add session token if available
	if (credentials.sessionToken) {
		requestOptions.headers['Cookie'] = `sessionid=${credentials.sessionToken}`;
	}

	// Add body for POST/PUT/PATCH requests
	if (options.body && Object.keys(options.body).length > 0) {
		requestOptions.body = options.body;
	}

	// Add query parameters
	if (options.query && Object.keys(options.query).length > 0) {
		requestOptions.qs = options.query;
	}

	try {
		const response = await this.helpers.httpRequest(requestOptions);

		// Check for IBKR-specific error responses
		if (response && typeof response === 'object') {
			const responseObj = response as IDataObject;
			if (responseObj.error || responseObj.error_code) {
				throw new NodeApiError(this.getNode(), response as JsonObject, {
					message: formatErrorMessage(responseObj),
				});
			}
		}

		return response as IDataObject | IDataObject[];
	} catch (error) {
		if (error instanceof NodeApiError) {
			throw error;
		}

		// Handle HTTP errors
		const errorData = (error as { response?: { data?: IDataObject } }).response?.data;
		if (errorData) {
			throw new NodeApiError(this.getNode(), errorData as JsonObject, {
				message: formatErrorMessage(errorData),
			});
		}

		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: 'Interactive Brokers API request failed',
		});
	}
}

/**
 * Make a paginated API request
 */
export async function ibkrApiRequestAllItems(
	this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions | IPollFunctions,
	options: IIBKRRequestOptions,
	pageParam: string = 'page',
	maxPages: number = 100,
): Promise<IDataObject[]> {
	const allItems: IDataObject[] = [];
	let page = 0;
	let hasMore = true;

	while (hasMore && page < maxPages) {
		const query = { ...options.query, [pageParam]: page };
		const response = await ibkrApiRequest.call(this, { ...options, query });

		if (Array.isArray(response)) {
			if (response.length === 0) {
				hasMore = false;
			} else {
				allItems.push(...response);
				page++;
			}
		} else {
			allItems.push(response);
			hasMore = false;
		}
	}

	return allItems;
}

/**
 * Helper to build the account-specific endpoint
 */
export function getAccountEndpoint(
	accountId: string,
	path: string,
): string {
	return `/portfolio/${accountId}${path}`;
}

/**
 * Helper to format order payload
 */
export function formatOrderPayload(
	accountId: string,
	conid: number,
	orderData: IDataObject,
): IDataObject {
	return {
		acctId: accountId,
		conid,
		secType: orderData.secType || undefined,
		orderType: orderData.orderType,
		side: orderData.side,
		quantity: orderData.quantity,
		price: orderData.price || undefined,
		auxPrice: orderData.auxPrice || undefined,
		tif: orderData.tif || 'DAY',
		outsideRTH: orderData.outsideRTH || false,
		useAdaptive: orderData.useAdaptive || false,
		isCcyConv: orderData.isCcyConv || false,
		cOID: orderData.cOID || undefined,
		parentId: orderData.parentId || undefined,
		referrer: orderData.referrer || undefined,
		...orderData,
	};
}

/**
 * Session keepalive - should be called periodically
 */
export async function tickleSession(
	this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions | IPollFunctions,
): Promise<IDataObject> {
	return (await ibkrApiRequest.call(this, {
		method: 'POST',
		endpoint: '/tickle',
	})) as IDataObject;
}

/**
 * Check authentication status
 */
export async function checkAuthStatus(
	this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions | IPollFunctions,
): Promise<IDataObject> {
	return (await ibkrApiRequest.call(this, {
		method: 'POST',
		endpoint: '/iserver/auth/status',
	})) as IDataObject;
}
