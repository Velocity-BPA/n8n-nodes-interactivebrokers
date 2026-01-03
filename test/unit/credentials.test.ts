/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { InteractiveBrokersApi } from '../../credentials/InteractiveBrokersApi.credentials';

describe('InteractiveBrokersApi Credentials', () => {
	let credentials: InteractiveBrokersApi;

	beforeEach(() => {
		credentials = new InteractiveBrokersApi();
	});

	describe('Credential Definition', () => {
		it('should have correct name', () => {
			expect(credentials.name).toBe('interactiveBrokersApi');
		});

		it('should have correct displayName', () => {
			expect(credentials.displayName).toBe('Interactive Brokers API');
		});

		it('should have documentation URL', () => {
			expect(credentials.documentationUrl).toBeDefined();
		});
	});

	describe('Credential Properties', () => {
		it('should have accountId property', () => {
			const accountIdProp = credentials.properties.find((p) => p.name === 'accountId');
			expect(accountIdProp).toBeDefined();
			expect(accountIdProp?.type).toBe('string');
			expect(accountIdProp?.required).toBe(true);
		});

		it('should have gatewayUrl property', () => {
			const gatewayUrlProp = credentials.properties.find((p) => p.name === 'gatewayUrl');
			expect(gatewayUrlProp).toBeDefined();
			expect(gatewayUrlProp?.type).toBe('string');
			expect(gatewayUrlProp?.default).toBe('https://localhost:5000');
		});

		it('should have environment property', () => {
			const envProp = credentials.properties.find((p) => p.name === 'environment');
			expect(envProp).toBeDefined();
			expect(envProp?.type).toBe('options');
		});

		it('should have production and paper environment options', () => {
			const envProp = credentials.properties.find((p) => p.name === 'environment');
			const options = envProp?.options?.map((o: any) => o.value);
			expect(options).toContain('production');
			expect(options).toContain('paper');
		});

		it('should have ignoreSslErrors property', () => {
			const sslProp = credentials.properties.find((p) => p.name === 'ignoreSslErrors');
			expect(sslProp).toBeDefined();
			expect(sslProp?.type).toBe('boolean');
		});
	});
});
