import {
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
	NodeConnectionType,
} from 'n8n-workflow';

function processMessages(messages: any[], features: string[]): any[] {
	return messages.map(message => {
		const processed = { ...message };
		
		// Add timestamps if enabled
		if (features.includes('timestamps') && !processed.timestamp) {
			processed.timestamp = new Date().toISOString();
		}
		
		// Mark for markdown processing if enabled
		if (features.includes('markdown')) {
			processed.markdown = true;
		}
		
		// Mark for code highlighting if enabled
		if (features.includes('codeHighlight')) {
			processed.codeHighlight = true;
		}
		
		// Add available actions based on features
		processed.actions = [];
		if (features.includes('copy')) {
			processed.actions.push('copy');
		}
		
		return processed;
	});
}

export class MinimalWebhook implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Chat UI Trigger',
		name: 'minimalWebhook',
		icon: 'file:webhook.svg',
		group: ['trigger'],
		version: 1,
		description: 'Chat interface trigger for AI workflows with message processing and conversation context',
		defaults: {
			name: 'Chat UI Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionType.Main],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: '={{$parameter["webhookPath"]}}',
			},
		],
		properties: [
			{
				displayName: 'Webhook Path',
				name: 'webhookPath',
				type: 'string',
				default: 'webhook',
				required: true,
				description: 'The path to listen for webhook requests',
			},
			{
				displayName: 'Display Mode',
				name: 'displayMode',
				type: 'options',
				options: [
					{
						name: 'Simple',
						value: 'simple',
						description: 'Basic chat interface',
					},
					{
						name: 'Rich',
						value: 'rich',
						description: 'Enhanced interface with Markdown',
					},
				],
				default: 'rich',
				description: 'Chat interface display mode',
			},
			{
				displayName: 'Features',
				name: 'features',
				type: 'multiOptions',
				options: [
					{
						name: 'Markdown Rendering',
						value: 'markdown',
						description: 'Render Markdown formatted text',
					},
					{
						name: 'Code Highlighting',
						value: 'codeHighlight',
						description: 'Syntax highlighting for code blocks',
					},
					{
						name: 'Copy Button',
						value: 'copy',
						description: 'Add copy button to messages',
					},
					{
						name: 'Timestamps',
						value: 'timestamps',
						description: 'Show message timestamps',
					},
				],
				default: ['markdown', 'timestamps'],
				description: 'Chat interface features to enable',
			},
			{
				displayName: 'UI Settings',
				name: 'uiSettings',
				type: 'collection',
				placeholder: 'Add UI Setting',
				default: {},
				options: [
					{
						displayName: 'Theme',
						name: 'theme',
						type: 'options',
						options: [
							{
								name: 'Light',
								value: 'light',
							},
							{
								name: 'Dark',
								value: 'dark',
							},
							{
								name: 'Auto',
								value: 'auto',
							},
						],
						default: 'auto',
						description: 'Color theme for the chat interface',
					},
					{
						displayName: 'Compact Mode',
						name: 'compactMode',
						type: 'boolean',
						default: false,
						description: 'Whether to use compact message spacing',
					},
					{
						// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
						displayName: 'Max Height (px)',
						name: 'maxHeight',
						type: 'number',
						default: 600,
						description: 'Maximum height of the chat container',
					},
				],
			},
		],
		usableAsTool: true,
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const bodyData = this.getBodyData() as any;
		const headers = this.getHeaderData();
		const query = this.getQueryData();
		
		// Get node parameters
		const displayMode = this.getNodeParameter('displayMode') as string;
		const webhookPath = this.getNodeParameter('webhookPath') as string;
		const features = this.getNodeParameter('features') as string[];
		const uiSettings = this.getNodeParameter('uiSettings') as object;
		
		// Process incoming message
		const userMessage = bodyData.message || bodyData.text || bodyData.content || '';
		const previousMessages = bodyData.messages || [];
		const sessionId = bodyData.session_id || bodyData.sessionId || `session_${Date.now()}`;
		const threadId = bodyData.thread_id || bodyData.threadId || `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		
		// Build conversation context
		let messages = [...previousMessages];
		
		// Add new user message if present
		if (userMessage) {
			messages.push({
				role: 'user',
				content: userMessage,
				timestamp: new Date().toISOString(),
				metadata: {
					session_id: sessionId,
					thread_id: threadId,
					source: 'chat_ui',
				},
			});
		}
		
		// Process messages with enabled features
		const processedMessages = processMessages(messages, features);
		
		// Build output for AI Agent
		const output = {
			// Main chat data
			messages: processedMessages,
			userMessage,
			sessionId,
			threadId,
			
			// UI Configuration
			displayMode,
			features,
			uiSettings,
			
			// Context
			context: {
				webhook_path: webhookPath,
				conversation_length: messages.length,
				last_interaction: new Date().toISOString(),
				user_agent: headers['user-agent'],
				ip_address: headers['x-forwarded-for'] || headers['x-real-ip'],
			},
			
			// Raw data for debugging
			raw: {
				headers,
				query,
				body: bodyData,
			},
		};
		
		return {
			workflowData: [
				this.helpers.returnJsonArray([output]),
			],
		};
	}
}