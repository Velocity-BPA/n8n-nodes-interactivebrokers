/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export interface IDataObject {
	[key: string]: any;
}

export interface INodeExecutionData {
	json: IDataObject;
	binary?: any;
}

export interface INodeType {
	description: INodeTypeDescription;
	execute?: any;
	poll?: any;
}

export interface INodeTypeDescription {
	displayName: string;
	name: string;
	icon?: string;
	group: string[];
	version: number;
	subtitle?: string;
	description: string;
	defaults: { name: string };
	inputs: string[];
	outputs: string[];
	credentials?: any[];
	properties: any[];
	polling?: boolean;
}

export interface INodeProperties {
	displayName: string;
	name: string;
	type: string;
	default?: any;
	description?: string;
	options?: any[];
	displayOptions?: any;
	noDataExpression?: boolean;
}

export interface ICredentialType {
	name: string;
	displayName: string;
	documentationUrl?: string;
	properties: INodeProperties[];
	authenticate?: any;
}

export interface IExecuteFunctions {
	getInputData: () => INodeExecutionData[];
	getNodeParameter: (name: string, index: number, defaultValue?: any) => any;
	getCredentials: (name: string) => Promise<IDataObject>;
	helpers: {
		request: (options: any) => Promise<any>;
		requestWithAuthentication: (name: string, options: any) => Promise<any>;
		constructExecutionMetaData: (data: any, options: any) => any;
		returnJsonArray: (data: any) => INodeExecutionData[];
	};
	getNode: () => any;
	continueOnFail: () => boolean;
}

export interface IPollFunctions {
	getNodeParameter: (name: string, defaultValue?: any) => any;
	getCredentials: (name: string) => Promise<IDataObject>;
	getWorkflowStaticData: (type: string) => IDataObject;
	helpers: {
		request: (options: any) => Promise<any>;
	};
}

export interface IHttpRequestOptions {
	method: string;
	url: string;
	headers?: IDataObject;
	body?: any;
	qs?: IDataObject;
	json?: boolean;
}

export class NodeOperationError extends Error {
	constructor(node: any, message: string) {
		super(message);
		this.name = 'NodeOperationError';
	}
}

export class NodeApiError extends Error {
	constructor(node: any, error: any, options?: any) {
		super(error.message || 'API Error');
		this.name = 'NodeApiError';
	}
}
