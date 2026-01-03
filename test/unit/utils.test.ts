/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	validateConid,
	validateAccountId,
	formatPrice,
	formatQuantity,
	parseOrderSide,
	parseOrderType,
	buildQueryString,
	validateOrderParams,
} from '../../nodes/InteractiveBrokers/utils';

describe('Interactive Brokers Utils', () => {
	describe('validateConid', () => {
		it('should return true for valid conid', () => {
			expect(validateConid('265598')).toBe(true);
			expect(validateConid('12345678')).toBe(true);
		});

		it('should return false for invalid conid', () => {
			expect(validateConid('')).toBe(false);
			expect(validateConid('abc')).toBe(false);
			expect(validateConid('-123')).toBe(false);
		});
	});

	describe('validateAccountId', () => {
		it('should return true for valid account IDs', () => {
			expect(validateAccountId('U1234567')).toBe(true);
			expect(validateAccountId('DU1234567')).toBe(true);
			expect(validateAccountId('F1234567')).toBe(true);
		});

		it('should return false for invalid account IDs', () => {
			expect(validateAccountId('')).toBe(false);
			expect(validateAccountId('123')).toBe(false);
			expect(validateAccountId('invalid')).toBe(false);
		});
	});

	describe('formatPrice', () => {
		it('should format price with 2 decimal places by default', () => {
			expect(formatPrice(100)).toBe('100.00');
			expect(formatPrice(99.5)).toBe('99.50');
			expect(formatPrice(123.456)).toBe('123.46');
		});

		it('should format price with custom decimal places', () => {
			expect(formatPrice(100, 4)).toBe('100.0000');
			expect(formatPrice(99.12345, 4)).toBe('99.1235');
		});
	});

	describe('formatQuantity', () => {
		it('should format quantity as integer', () => {
			expect(formatQuantity(100)).toBe('100');
			expect(formatQuantity(100.5)).toBe('101');
			expect(formatQuantity(99.4)).toBe('99');
		});
	});

	describe('parseOrderSide', () => {
		it('should parse BUY side', () => {
			expect(parseOrderSide('BUY')).toBe('BUY');
			expect(parseOrderSide('buy')).toBe('BUY');
			expect(parseOrderSide('Buy')).toBe('BUY');
		});

		it('should parse SELL side', () => {
			expect(parseOrderSide('SELL')).toBe('SELL');
			expect(parseOrderSide('sell')).toBe('SELL');
			expect(parseOrderSide('Sell')).toBe('SELL');
		});

		it('should throw for invalid side', () => {
			expect(() => parseOrderSide('HOLD')).toThrow();
			expect(() => parseOrderSide('')).toThrow();
		});
	});

	describe('parseOrderType', () => {
		it('should parse market order type', () => {
			expect(parseOrderType('MKT')).toBe('MKT');
			expect(parseOrderType('MARKET')).toBe('MKT');
			expect(parseOrderType('market')).toBe('MKT');
		});

		it('should parse limit order type', () => {
			expect(parseOrderType('LMT')).toBe('LMT');
			expect(parseOrderType('LIMIT')).toBe('LMT');
			expect(parseOrderType('limit')).toBe('LMT');
		});

		it('should parse stop order type', () => {
			expect(parseOrderType('STP')).toBe('STP');
			expect(parseOrderType('STOP')).toBe('STP');
		});

		it('should parse stop limit order type', () => {
			expect(parseOrderType('STP_LIMIT')).toBe('STP_LIMIT');
			expect(parseOrderType('STOPLIMIT')).toBe('STP_LIMIT');
		});
	});

	describe('buildQueryString', () => {
		it('should build query string from object', () => {
			const params = { foo: 'bar', baz: 123 };
			expect(buildQueryString(params)).toBe('foo=bar&baz=123');
		});

		it('should handle empty object', () => {
			expect(buildQueryString({})).toBe('');
		});

		it('should skip undefined values', () => {
			const params = { foo: 'bar', baz: undefined };
			expect(buildQueryString(params)).toBe('foo=bar');
		});

		it('should encode special characters', () => {
			const params = { query: 'hello world' };
			expect(buildQueryString(params)).toBe('query=hello%20world');
		});
	});

	describe('validateOrderParams', () => {
		it('should validate market order', () => {
			const params = {
				conid: '265598',
				side: 'BUY',
				orderType: 'MKT',
				quantity: 100,
			};
			expect(() => validateOrderParams(params)).not.toThrow();
		});

		it('should validate limit order with price', () => {
			const params = {
				conid: '265598',
				side: 'BUY',
				orderType: 'LMT',
				quantity: 100,
				price: 150.00,
			};
			expect(() => validateOrderParams(params)).not.toThrow();
		});

		it('should throw for limit order without price', () => {
			const params = {
				conid: '265598',
				side: 'BUY',
				orderType: 'LMT',
				quantity: 100,
			};
			expect(() => validateOrderParams(params)).toThrow();
		});

		it('should throw for missing required fields', () => {
			const params = {
				conid: '265598',
				side: 'BUY',
			};
			expect(() => validateOrderParams(params)).toThrow();
		});

		it('should throw for invalid quantity', () => {
			const params = {
				conid: '265598',
				side: 'BUY',
				orderType: 'MKT',
				quantity: 0,
			};
			expect(() => validateOrderParams(params)).toThrow();
		});
	});
});
