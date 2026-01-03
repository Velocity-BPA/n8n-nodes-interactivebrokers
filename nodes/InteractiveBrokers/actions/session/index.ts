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

export const sessionOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['session'],
		},
	},
	options: [
		{
			name: 'Authenticate',
			value: 'authenticate',
			description: 'Initiate authentication',
			action: 'Initiate authentication',
		},
		{
			name: 'Get Auth Status',
			value: 'getAuthStatus',
			description: 'Check authentication status',
			action: 'Check authentication status',
		},
		{
			name: 'Reauthenticate',
			value: 'reauthenticate',
			description: 'Re-authenticate session',
			action: 'Re-authenticate session',
		},
		{
			name: 'Logout',
			value: 'logout',
			description: 'Terminate session',
			action: 'Terminate session',
		},
		{
			name: 'Tickle',
			value: 'tickle',
			description: 'Keep session alive (heartbeat)',
			action: 'Keep session alive',
		},
		{
			name: 'Validate SSO',
			value: 'validateSSO',
			description: 'Validate SSO token',
			action: 'Validate SSO token',
		},
	],
	default: 'getAuthStatus',
};

export const sessionFields: INodeProperties[] = [];

export async function executeSessionOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let response: IDataObject | IDataObject[];

	switch (operation) {
		case 'authenticate': {
			response = await ibkrApiRequest.call(this, {
				method: 'POST',
				endpoint: '/iserver/auth/ssodh/init',
			});
			break;
		}

		case 'getAuthStatus': {
			response = await ibkrApiRequest.call(this, {
				method: 'POST',
				endpoint: '/iserver/auth/status',
			});
			break;
		}

		case 'reauthenticate': {
			response = await ibkrApiRequest.call(this, {
				method: 'POST',
				endpoint: '/iserver/reauthenticate',
			});
			break;
		}

		case 'logout': {
			response = await ibkrApiRequest.call(this, {
				method: 'POST',
				endpoint: '/logout',
			});
			break;
		}

		case 'tickle': {
			response = await ibkrApiRequest.call(this, {
				method: 'POST',
				endpoint: '/tickle',
			});
			break;
		}

		case 'validateSSO': {
			response = await ibkrApiRequest.call(this, {
				method: 'GET',
				endpoint: '/sso/validate',
			});
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return response;
}
