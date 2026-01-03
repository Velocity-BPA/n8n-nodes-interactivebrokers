/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

// Jest setup file
beforeAll(() => {
	// Suppress console.warn for licensing notices during tests
	jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
	jest.restoreAllMocks();
});
