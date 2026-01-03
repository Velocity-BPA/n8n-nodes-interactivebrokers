/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class InteractiveBrokersApi implements ICredentialType {
	name = 'interactiveBrokersApi';
	displayName = 'Interactive Brokers API';
	documentationUrl = 'https://www.interactivebrokers.com/api/doc.html';

	properties: INodeProperties[] = [
		{
			displayName: 'Account ID',
			name: 'accountId',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'e.g., DU1234567',
			description: 'Your Interactive Brokers account ID. Paper trading accounts start with DU.',
		},
		{
			displayName: 'Session Token',
			name: 'sessionToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Session token from Client Portal Gateway authentication. Leave empty if using gateway session.',
		},
		{
			displayName: 'Environment',
			name: 'environment',
			type: 'options',
			options: [
				{
					name: 'Production',
					value: 'production',
				},
				{
					name: 'Paper Trading',
					value: 'paper',
				},
			],
			default: 'paper',
			description: 'Trading environment to use',
		},
		{
			displayName: 'Gateway URL',
			name: 'gatewayUrl',
			type: 'string',
			default: 'https://localhost:5000',
			description: 'URL of the Client Portal Gateway. Default is https://localhost:5000.',
		},
		{
			displayName: 'Ignore SSL Errors',
			name: 'ignoreSslErrors',
			type: 'boolean',
			default: true,
			description: 'Whether to ignore SSL certificate errors (useful for local gateway with self-signed cert)',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.gatewayUrl}}/v1/api',
			url: '/iserver/auth/status',
			method: 'POST',
			skipSslCertificateValidation: '={{$credentials.ignoreSslErrors}}',
		},
	};
}
