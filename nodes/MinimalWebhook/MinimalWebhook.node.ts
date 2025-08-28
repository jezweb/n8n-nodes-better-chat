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
				httpMethod: ['GET', 'POST'] as any, // Multiple methods for hosted chat
				responseMode: 'onReceived',
				path: '={{$parameter["webhookPath"]}}',
			},
		],
		properties: [
			{
				displayName: 'Chat Access Mode',
				name: 'chatMode',
				type: 'options',
				options: [
					{
						name: 'Webhook Only',
						value: 'webhook',
						description: 'Basic webhook endpoint for custom integrations',
					},
					{
						name: 'Hosted Chat',
						value: 'hosted',
						description: 'N8n provides a hosted chat interface with URL',
					},
					{
						name: 'Embedded Chat',
						value: 'embedded',
						description: 'For use with @n8n/chat widget',
					},
				],
				default: 'webhook',
				description: 'Choose how users will access the chat interface',
			},
			{
				displayName: 'Webhook Path',
				name: 'webhookPath',
				type: 'string',
				default: 'webhook',
				required: true,
				description: 'The path to listen for webhook requests',
			},
			{
				displayName: 'Public Available',
				name: 'publicAvailable',
				type: 'boolean',
				default: false,
				description: 'Whether the chat is publicly accessible. Keep off while building, turn on when ready for users.',
				displayOptions: {
					show: {
						chatMode: ['hosted'],
					},
				},
			},
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						name: 'None',
						value: 'none',
						description: 'No authentication required',
					},
					{
						name: 'Basic Auth',
						value: 'basic',
						description: 'Require username and password',
					},
				],
				default: 'none',
				description: 'How to restrict access to the chat',
				displayOptions: {
					show: {
						chatMode: ['hosted', 'embedded'],
					},
				},
			},
			{
				displayName: 'Username',
				name: 'authUsername',
				type: 'string',
				default: '',
				description: 'Username for Basic Authentication',
				displayOptions: {
					show: {
						authentication: ['basic'],
					},
				},
			},
			{
				displayName: 'Password',
				name: 'authPassword',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				description: 'Password for Basic Authentication',
				displayOptions: {
					show: {
						authentication: ['basic'],
					},
				},
			},
			{
				displayName: 'Allowed Origins (CORS)',
				name: 'allowedOrigins',
				type: 'string',
				default: '*',
				description: 'Comma-separated list of allowed origins for cross-origin requests. Use * to allow all.',
				displayOptions: {
					show: {
						chatMode: ['hosted', 'embedded'],
					},
				},
			},
			{
				displayName: 'Initial Message',
				name: 'initialMessage',
				type: 'string',
				default: 'Hi! How can I help you today?',
				description: 'Welcome message shown when chat loads',
				displayOptions: {
					show: {
						chatMode: ['hosted'],
					},
				},
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
				displayName: 'Output Format',
				name: 'outputFormat',
				type: 'options',
				options: [
					{
						name: 'AI Agent Compatible',
						value: 'aiAgent',
						description: 'Simplified output with chatInput field for AI Agent nodes',
					},
					{
						name: 'Detailed',
						value: 'detailed',
						description: 'Full output with all metadata and context',
					},
				],
				default: 'aiAgent',
				description: 'Choose output structure format',
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
		const req = this.getRequestObject();
		const headers = this.getHeaderData();
		const query = this.getQueryData();
		const method = req.method;
		
		// Get node parameters
		const chatMode = this.getNodeParameter('chatMode') as string;
		const displayMode = this.getNodeParameter('displayMode') as string;
		const outputFormat = this.getNodeParameter('outputFormat') as string;
		const webhookPath = this.getNodeParameter('webhookPath') as string;
		const features = this.getNodeParameter('features') as string[];
		const uiSettings = this.getNodeParameter('uiSettings') as object;
		
		// Get hosted/embedded mode parameters
		const publicAvailable = chatMode === 'hosted' ? this.getNodeParameter('publicAvailable', false) as boolean : false;
		const authentication = ['hosted', 'embedded'].includes(chatMode) ? 
			this.getNodeParameter('authentication', 'none') as string : 'none';
		const allowedOrigins = ['hosted', 'embedded'].includes(chatMode) ? 
			this.getNodeParameter('allowedOrigins', '*') as string : '*';
		const initialMessage = chatMode === 'hosted' ? 
			this.getNodeParameter('initialMessage', 'Hi! How can I help you today?') as string : '';
		
		// Handle GET request for hosted chat interface
		if (method === 'GET' && chatMode === 'hosted') {
			// Generate chat interface HTML
			const chatHtml = `
<!DOCTYPE html>
<html>
<head>
	<title>Chat Interface</title>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<style>
		body { 
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
			margin: 0; 
			padding: 20px;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			height: 100vh;
			display: flex;
			justify-content: center;
			align-items: center;
		}
		.chat-container {
			background: white;
			border-radius: 10px;
			box-shadow: 0 20px 60px rgba(0,0,0,0.3);
			width: 100%;
			max-width: 600px;
			height: 600px;
			display: flex;
			flex-direction: column;
		}
		.chat-header {
			padding: 20px;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			color: white;
			border-radius: 10px 10px 0 0;
		}
		.chat-messages {
			flex: 1;
			padding: 20px;
			overflow-y: auto;
		}
		.message {
			margin-bottom: 15px;
			padding: 10px 15px;
			border-radius: 10px;
		}
		.message.user {
			background: #e3f2fd;
			margin-left: 20%;
			text-align: right;
		}
		.message.assistant {
			background: #f3e5f5;
			margin-right: 20%;
		}
		.chat-input {
			display: flex;
			padding: 20px;
			border-top: 1px solid #e0e0e0;
		}
		.chat-input input {
			flex: 1;
			padding: 10px 15px;
			border: 1px solid #ddd;
			border-radius: 25px;
			font-size: 16px;
		}
		.chat-input button {
			margin-left: 10px;
			padding: 10px 20px;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			color: white;
			border: none;
			border-radius: 25px;
			cursor: pointer;
			font-size: 16px;
		}
		.chat-input button:hover {
			opacity: 0.9;
		}
	</style>
</head>
<body>
	<div class="chat-container">
		<div class="chat-header">
			<h2 style="margin: 0;">Chat Assistant</h2>
			<p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">${publicAvailable ? 'Public Chat' : 'Test Mode'}</p>
		</div>
		<div class="chat-messages" id="messages">
			<div class="message assistant">
				<p>${initialMessage}</p>
			</div>
		</div>
		<div class="chat-input">
			<input type="text" id="messageInput" placeholder="Type your message..." autofocus>
			<button onclick="sendMessage()">Send</button>
		</div>
	</div>
	<script>
		const webhookUrl = window.location.href;
		const messages = [];
		
		function sendMessage() {
			const input = document.getElementById('messageInput');
			const message = input.value.trim();
			if (!message) return;
			
			// Add user message to UI
			addMessage('user', message);
			messages.push({ role: 'user', content: message });
			
			// Clear input
			input.value = '';
			
			// Send to webhook
			fetch(webhookUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					message: message,
					messages: messages
				})
			})
			.then(response => response.json())
			.then(data => {
				// Add assistant response
				const response = data.response || data.output || data.text || 'Processing...';
				addMessage('assistant', response);
				messages.push({ role: 'assistant', content: response });
			})
			.catch(error => {
				console.error('Error:', error);
				addMessage('assistant', 'Sorry, there was an error processing your message.');
			});
		}
		
		function addMessage(role, content) {
			const messagesDiv = document.getElementById('messages');
			const messageDiv = document.createElement('div');
			messageDiv.className = 'message ' + role;
			messageDiv.innerHTML = '<p>' + content + '</p>';
			messagesDiv.appendChild(messageDiv);
			messagesDiv.scrollTop = messagesDiv.scrollHeight;
		}
		
		document.getElementById('messageInput').addEventListener('keypress', function(e) {
			if (e.key === 'Enter') {
				sendMessage();
			}
		});
	</script>
</body>
</html>`;
			
			return {
				webhookResponse: {
					headers: {
						'Content-Type': 'text/html',
					},
					body: chatHtml,
				},
			};
		}
		
		// For POST requests, get body data
		const bodyData = method === 'POST' ? this.getBodyData() as any : {};
		
		// Handle authentication
		if (authentication === 'basic') {
			const authUsername = this.getNodeParameter('authUsername', '') as string;
			const authPassword = this.getNodeParameter('authPassword', '') as string;
			
			// Check Basic Auth header
			const authHeader = headers.authorization || '';
			if (!authHeader.startsWith('Basic ')) {
				return {
					webhookResponse: {
						status: 401,
						headers: {
							'WWW-Authenticate': 'Basic realm="Chat Access"',
						},
						body: 'Authentication required',
					},
				};
			}
			
			// Validate credentials
			const credentials = Buffer.from(authHeader.slice(6), 'base64').toString();
			const [user, pass] = credentials.split(':');
			if (user !== authUsername || pass !== authPassword) {
				return {
					webhookResponse: {
						status: 403,
						body: 'Invalid credentials',
					},
				};
			}
		}
		
		// Handle CORS
		const origin = headers.origin || '';
		if (allowedOrigins !== '*' && origin) {
			const allowedList = allowedOrigins.split(',').map(o => o.trim());
			if (!allowedList.includes(origin)) {
				return {
					webhookResponse: {
						status: 403,
						body: 'Origin not allowed',
					},
				};
			}
		}
		
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
		
		// Generate chat URL for hosted mode
		let chatUrl = '';
		if (chatMode === 'hosted') {
			try {
				// Get workflow ID and instance URL
				const workflowId = this.getWorkflow().id;
				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				
				// Parse instance URL from webhook URL
				const urlParts = new URL(webhookUrl);
				const baseUrl = `${urlParts.protocol}//${urlParts.host}`;
				
				// Generate chat URL
				if (publicAvailable) {
					chatUrl = `${baseUrl}/chat/${workflowId}`;
				} else {
					chatUrl = `${baseUrl}/chat/${workflowId}/test`;
				}
			} catch (error) {
				// Fallback if URL generation fails
				chatUrl = 'Chat URL will be available when workflow is saved';
			}
		}
		
		// Build output based on selected format
		let output: any;
		
		if (outputFormat === 'aiAgent') {
			// Simplified output for AI Agent compatibility
			output = {
				chatInput: userMessage,  // Primary field for AI Agent
				sessionId,
				threadId,
				messages: processedMessages,  // Include for context if needed
				messageCount: messages.length,
				timestamp: new Date().toISOString(),
			};
			
			// Add chat URL if in hosted mode
			if (chatUrl) {
				output.chatUrl = chatUrl;
			}
		} else {
			// Detailed output with all metadata
			output = {
				// AI Agent compatibility field still included
				chatInput: userMessage,
				
				// Main chat data
				messages: processedMessages,
				userMessage,
				sessionId,
				threadId,
				
				// Chat configuration
				chatMode,
				chatUrl: chatUrl || undefined,
				publicAvailable: chatMode === 'hosted' ? publicAvailable : undefined,
				authentication: ['hosted', 'embedded'].includes(chatMode) ? authentication : undefined,
				allowedOrigins: ['hosted', 'embedded'].includes(chatMode) ? allowedOrigins : undefined,
				initialMessage: chatMode === 'hosted' ? initialMessage : undefined,
				
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
		}
		
		return {
			workflowData: [
				this.helpers.returnJsonArray([output]),
			],
		};
	}
}