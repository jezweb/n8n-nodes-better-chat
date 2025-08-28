import {
	IWebhookFunctions,
	IWebhookResponseData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	NodeConnectionType,
} from 'n8n-workflow';

export class BetterChatSimple implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Better Chat Simple',
		name: 'betterChatSimple',
		icon: 'file:chat.svg',
		group: ['trigger'],
		version: 1,
		description: 'Simple webhook trigger for testing',
		defaults: {
			name: 'Better Chat Simple',
		},
		inputs: [],
		outputs: [NodeConnectionType.Main],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Property Only',
						name: 'propertyOnly',
						type: 'boolean',
						default: false,
						description: 'Whether to return only the webhook property',
					},
				],
			},
		],
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const bodyData = this.getBodyData() as IDataObject;
		const headers = this.getHeaderData() as IDataObject;
		const query = this.getQueryData() as IDataObject;

		const returnData: IDataObject = {
			headers,
			params: query,
			query,
			body: bodyData,
		};

		const options = this.getNodeParameter('options', {}) as IDataObject;

		if (options.propertyOnly === true) {
			return {
				workflowData: [
					this.helpers.returnJsonArray(bodyData),
				],
			};
		}

		return {
			workflowData: [
				this.helpers.returnJsonArray([returnData]),
			],
		};
	}
}