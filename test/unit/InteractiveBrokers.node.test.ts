/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { InteractiveBrokers } from '../../nodes/InteractiveBrokers/InteractiveBrokers.node';
import { InteractiveBrokersTrigger } from '../../nodes/InteractiveBrokers/InteractiveBrokersTrigger.node';

describe('InteractiveBrokers Node', () => {
	let node: InteractiveBrokers;

	beforeEach(() => {
		node = new InteractiveBrokers();
	});

	describe('Node Description', () => {
		it('should have correct displayName', () => {
			expect(node.description.displayName).toBe('Interactive Brokers');
		});

		it('should have correct name', () => {
			expect(node.description.name).toBe('interactiveBrokers');
		});

		it('should have version 1', () => {
			expect(node.description.version).toBe(1);
		});

		it('should require interactiveBrokersApi credentials', () => {
			const credentials = node.description.credentials;
			expect(credentials).toBeDefined();
			expect(credentials?.[0].name).toBe('interactiveBrokersApi');
			expect(credentials?.[0].required).toBe(true);
		});

		it('should have main inputs and outputs', () => {
			expect(node.description.inputs).toContain('main');
			expect(node.description.outputs).toContain('main');
		});
	});

	describe('Resources', () => {
		it('should have all 15 resources defined', () => {
			const resourceProperty = node.description.properties.find(
				(p) => p.name === 'resource',
			);
			expect(resourceProperty).toBeDefined();
			expect(resourceProperty?.options?.length).toBe(15);
		});

		it('should include session resource', () => {
			const resourceProperty = node.description.properties.find(
				(p) => p.name === 'resource',
			);
			const sessionResource = resourceProperty?.options?.find(
				(o: any) => o.value === 'session',
			);
			expect(sessionResource).toBeDefined();
		});

		it('should include account resource', () => {
			const resourceProperty = node.description.properties.find(
				(p) => p.name === 'resource',
			);
			const accountResource = resourceProperty?.options?.find(
				(o: any) => o.value === 'account',
			);
			expect(accountResource).toBeDefined();
		});

		it('should include orders resource', () => {
			const resourceProperty = node.description.properties.find(
				(p) => p.name === 'resource',
			);
			const ordersResource = resourceProperty?.options?.find(
				(o: any) => o.value === 'orders',
			);
			expect(ordersResource).toBeDefined();
		});

		it('should include portfolio resource', () => {
			const resourceProperty = node.description.properties.find(
				(p) => p.name === 'resource',
			);
			const portfolioResource = resourceProperty?.options?.find(
				(o: any) => o.value === 'portfolio',
			);
			expect(portfolioResource).toBeDefined();
		});

		it('should include marketData resource', () => {
			const resourceProperty = node.description.properties.find(
				(p) => p.name === 'resource',
			);
			const marketDataResource = resourceProperty?.options?.find(
				(o: any) => o.value === 'marketData',
			);
			expect(marketDataResource).toBeDefined();
		});

		it('should include contracts resource', () => {
			const resourceProperty = node.description.properties.find(
				(p) => p.name === 'resource',
			);
			const contractsResource = resourceProperty?.options?.find(
				(o: any) => o.value === 'contracts',
			);
			expect(contractsResource).toBeDefined();
		});

		it('should include trades resource', () => {
			const resourceProperty = node.description.properties.find(
				(p) => p.name === 'resource',
			);
			const tradesResource = resourceProperty?.options?.find(
				(o: any) => o.value === 'trades',
			);
			expect(tradesResource).toBeDefined();
		});

		it('should include scanner resource', () => {
			const resourceProperty = node.description.properties.find(
				(p) => p.name === 'resource',
			);
			const scannerResource = resourceProperty?.options?.find(
				(o: any) => o.value === 'scanner',
			);
			expect(scannerResource).toBeDefined();
		});

		it('should include alerts resource', () => {
			const resourceProperty = node.description.properties.find(
				(p) => p.name === 'resource',
			);
			const alertsResource = resourceProperty?.options?.find(
				(o: any) => o.value === 'alerts',
			);
			expect(alertsResource).toBeDefined();
		});

		it('should include watchlists resource', () => {
			const resourceProperty = node.description.properties.find(
				(p) => p.name === 'resource',
			);
			const watchlistsResource = resourceProperty?.options?.find(
				(o: any) => o.value === 'watchlists',
			);
			expect(watchlistsResource).toBeDefined();
		});
	});
});

describe('InteractiveBrokersTrigger Node', () => {
	let triggerNode: InteractiveBrokersTrigger;

	beforeEach(() => {
		triggerNode = new InteractiveBrokersTrigger();
	});

	describe('Trigger Node Description', () => {
		it('should have correct displayName', () => {
			expect(triggerNode.description.displayName).toBe('Interactive Brokers Trigger');
		});

		it('should have correct name', () => {
			expect(triggerNode.description.name).toBe('interactiveBrokersTrigger');
		});

		it('should be a polling trigger', () => {
			expect(triggerNode.description.polling).toBe(true);
		});

		it('should have no inputs', () => {
			expect(triggerNode.description.inputs).toHaveLength(0);
		});

		it('should have main output', () => {
			expect(triggerNode.description.outputs).toContain('main');
		});
	});

	describe('Trigger Events', () => {
		it('should have all trigger events defined', () => {
			const eventProperty = triggerNode.description.properties.find(
				(p) => p.name === 'event',
			);
			expect(eventProperty).toBeDefined();
			expect(eventProperty?.options?.length).toBeGreaterThanOrEqual(5);
		});

		it('should include newOrder event', () => {
			const eventProperty = triggerNode.description.properties.find(
				(p) => p.name === 'event',
			);
			const newOrderEvent = eventProperty?.options?.find(
				(o: any) => o.value === 'newOrder',
			);
			expect(newOrderEvent).toBeDefined();
		});

		it('should include orderFilled event', () => {
			const eventProperty = triggerNode.description.properties.find(
				(p) => p.name === 'event',
			);
			const orderFilledEvent = eventProperty?.options?.find(
				(o: any) => o.value === 'orderFilled',
			);
			expect(orderFilledEvent).toBeDefined();
		});

		it('should include positionChanged event', () => {
			const eventProperty = triggerNode.description.properties.find(
				(p) => p.name === 'event',
			);
			const positionChangedEvent = eventProperty?.options?.find(
				(o: any) => o.value === 'positionChanged',
			);
			expect(positionChangedEvent).toBeDefined();
		});
	});
});
