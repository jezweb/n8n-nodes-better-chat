import {
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
	NodeConnectionType,
	IDataObject,
} from 'n8n-workflow';

const CHAT_TRIGGER_PATH_IDENTIFIER = 'chat';

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

export class BetterChatTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Better Chat Trigger',
		name: 'betterChatTrigger',
		icon: 'file:chat.svg',
		group: ['trigger'],
		version: [1, 1.1, 1.2, 1.3],
		defaultVersion: 1.3,
		description: 'Enhanced chat trigger with rich UI features and full Respond to Webhook compatibility',
		defaults: {
			name: 'Better Chat Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'httpBasicAuth',
				required: true,
				displayOptions: {
					show: {
						authentication: ['basicAuth'],
					},
				},
			},
		],
		webhooks: [
			{
				name: 'setup',
				httpMethod: 'GET',
				responseMode: 'onReceived',
				path: CHAT_TRIGGER_PATH_IDENTIFIER,
				ndvHideUrl: true,
			},
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: '={{$parameter.options?.["responseMode"] || "lastNode" }}',
				path: CHAT_TRIGGER_PATH_IDENTIFIER,
				ndvHideMethod: true,
				ndvHideUrl: '={{ !$parameter.public }}',
			},
		],
		eventTriggerDescription: 'Waiting for you to submit the chat',
		activationMessage: 'You can now make calls to your production chat URL.',
		triggerPanel: false,
		properties: [
			{
				displayName: 'Make Chat Publicly Available',
				name: 'public',
				type: 'boolean',
				default: false,
				description: 'Whether the chat should be publicly available or only accessible through the manual chat interface',
			},
			{
				displayName: 'Mode',
				name: 'mode',
				type: 'options',
				options: [
					{
						name: 'Hosted Chat',
						value: 'hostedChat',
						description: 'Chat on a page served by n8n',
					},
					{
						name: 'Embedded Chat',
						value: 'webhook',
						description: 'Chat through a widget embedded in another page, or by calling a webhook',
					},
				],
				default: 'hostedChat',
				displayOptions: {
					show: {
						public: [true],
					},
				},
			},
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				displayOptions: {
					show: {
						public: [true],
					},
				},
				options: [
					{
						name: 'None',
						value: 'none',
						description: 'No authentication required',
					},
					{
						name: 'Basic Auth',
						value: 'basicAuth',
						description: 'Simple username and password (the same one for all users)',
					},
				],
				default: 'none',
			},
			{
				displayName: 'Initial Message',
				name: 'initialMessage',
				type: 'string',
				default: 'Hi! How can I help you today?',
				description: 'Welcome message shown when chat loads',
				displayOptions: {
					show: {
						mode: ['hostedChat'],
					},
				},
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Response Mode',
						name: 'responseMode',
						type: 'options',
						noDataExpression: true,
						options: [
							{
								name: 'When Last Node Finishes',
								value: 'lastNode',
								description: 'Returns data of the last-executed node',
							},
							{
								name: "Using 'Respond to Webhook' Node",
								value: 'responseNode',
								description: 'Response defined in that node',
							},
						],
						default: 'lastNode',
						description: 'When and how to respond to the webhook',
					},
					{
						displayName: 'Allowed Origins (CORS)',
						name: 'allowedOrigins',
						type: 'string',
						default: '*',
						description: 'Comma-separated list of URLs allowed for cross-origin non-preflight requests. Use * (default) to allow all origins.',
					},
					{
						displayName: 'Allow File Uploads',
						name: 'allowFileUploads',
						type: 'boolean',
						default: false,
						description: 'Whether to allow file uploads in the chat',
					},
					{
						displayName: 'Allowed File Mime Types',
						name: 'allowedFilesMimeTypes',
						type: 'string',
						default: '*',
						placeholder: 'e.g. image/*, text/*, application/pdf',
						description: 'Allowed file types for upload. Comma-separated list of MIME types.',
					},
				],
			},
			// Custom UI Enhancement Features
			{
				displayName: 'UI Enhancements',
				name: 'uiEnhancements',
				type: 'collection',
				placeholder: 'Add UI Enhancement',
				default: {},
				options: [
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
		const webhookName = this.getWebhookName();
		
		// Get node parameters
		const publicAvailable = this.getNodeParameter('public', false) as boolean;
		const mode = this.getNodeParameter('mode', 'hostedChat') as string;
		const authentication = this.getNodeParameter('authentication', 'none') as string;
		const initialMessage = this.getNodeParameter('initialMessage', 'Hi! How can I help you today?') as string;
		
		// Get options
		const options = this.getNodeParameter('options', {}) as IDataObject;
		const allowedOrigins = (options.allowedOrigins as string) || '*';
		// const allowFileUploads = (options.allowFileUploads as boolean) || false; // Reserved for future file upload implementation
		
		// Get UI enhancements
		const uiEnhancements = this.getNodeParameter('uiEnhancements', {}) as IDataObject;
		const outputFormat = (uiEnhancements.outputFormat as string) || 'aiAgent';
		const displayMode = (uiEnhancements.displayMode as string) || 'rich';
		const features = (uiEnhancements.features as string[]) || ['markdown', 'timestamps'];
		const theme = (uiEnhancements.theme as string) || 'auto';
		const compactMode = (uiEnhancements.compactMode as boolean) || false;
		const maxHeight = (uiEnhancements.maxHeight as number) || 600;
		
		// Handle authentication
		if (authentication === 'basicAuth') {
			const httpBasicAuth = await this.getCredentials('httpBasicAuth');
			
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
			
			const credentials = Buffer.from(authHeader.slice(6), 'base64').toString();
			const [user, pass] = credentials.split(':');
			if (user !== httpBasicAuth.user || pass !== httpBasicAuth.password) {
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
		
		// Handle GET request for hosted chat interface (setup webhook)
		if (method === 'GET' && webhookName === 'setup' && mode === 'hostedChat') {
			// Generate enhanced chat interface HTML
			const chatHtml = `
<!DOCTYPE html>
<html>
<head>
	<title>Better Chat Interface</title>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<style>
		:root {
			--primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			--bg-color: ${theme === 'dark' ? '#1a1a1a' : '#f5f5f5'};
			--container-bg: ${theme === 'dark' ? '#2d2d2d' : 'white'};
			--text-color: ${theme === 'dark' ? '#e0e0e0' : '#333'};
			--user-msg-bg: ${theme === 'dark' ? '#4a5568' : '#e3f2fd'};
			--assistant-msg-bg: ${theme === 'dark' ? '#553c69' : '#f3e5f5'};
			--border-color: ${theme === 'dark' ? '#444' : '#e0e0e0'};
		}
		
		body { 
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
			margin: 0; 
			padding: 20px;
			background: var(--bg-color);
			height: 100vh;
			display: flex;
			justify-content: center;
			align-items: center;
		}
		
		.chat-container {
			background: var(--container-bg);
			border-radius: 10px;
			box-shadow: 0 20px 60px rgba(0,0,0,0.3);
			width: 100%;
			max-width: 600px;
			height: ${maxHeight}px;
			display: flex;
			flex-direction: column;
			color: var(--text-color);
		}
		
		.chat-header {
			padding: ${compactMode ? '15px' : '20px'};
			background: var(--primary-gradient);
			color: white;
			border-radius: 10px 10px 0 0;
		}
		
		.chat-header h2 {
			margin: 0;
			font-size: ${compactMode ? '18px' : '24px'};
		}
		
		.chat-header p {
			margin: 5px 0 0 0;
			opacity: 0.9;
			font-size: 14px;
		}
		
		.chat-messages {
			flex: 1;
			padding: ${compactMode ? '10px' : '20px'};
			overflow-y: auto;
		}
		
		.message {
			margin-bottom: ${compactMode ? '10px' : '15px'};
			padding: ${compactMode ? '8px 12px' : '10px 15px'};
			border-radius: 10px;
			animation: fadeIn 0.3s ease-in;
		}
		
		.message.user {
			background: var(--user-msg-bg);
			margin-left: 20%;
			text-align: right;
		}
		
		.message.assistant {
			background: var(--assistant-msg-bg);
			margin-right: 20%;
		}
		
		.message-timestamp {
			font-size: 11px;
			opacity: 0.7;
			margin-top: 5px;
		}
		
		.message-actions {
			margin-top: 5px;
		}
		
		.copy-btn {
			background: none;
			border: 1px solid var(--border-color);
			color: var(--text-color);
			padding: 2px 8px;
			border-radius: 4px;
			cursor: pointer;
			font-size: 12px;
		}
		
		.copy-btn:hover {
			background: var(--border-color);
		}
		
		.chat-input {
			display: flex;
			padding: ${compactMode ? '10px' : '20px'};
			border-top: 1px solid var(--border-color);
		}
		
		.chat-input input {
			flex: 1;
			padding: 10px 15px;
			border: 1px solid var(--border-color);
			border-radius: 25px;
			font-size: 16px;
			background: var(--container-bg);
			color: var(--text-color);
		}
		
		.chat-input button {
			margin-left: 10px;
			padding: 10px 20px;
			background: var(--primary-gradient);
			color: white;
			border: none;
			border-radius: 25px;
			cursor: pointer;
			font-size: 16px;
		}
		
		.chat-input button:hover {
			opacity: 0.9;
		}
		
		.chat-input button:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
		
		@keyframes fadeIn {
			from { opacity: 0; transform: translateY(10px); }
			to { opacity: 1; transform: translateY(0); }
		}
		
		/* Markdown styles */
		.message pre {
			background: rgba(0,0,0,0.1);
			padding: 10px;
			border-radius: 5px;
			overflow-x: auto;
		}
		
		.message code {
			background: rgba(0,0,0,0.1);
			padding: 2px 4px;
			border-radius: 3px;
		}
		
		/* Auto theme */
		@media (prefers-color-scheme: dark) {
			${theme === 'auto' ? `
			:root {
				--bg-color: #1a1a1a;
				--container-bg: #2d2d2d;
				--text-color: #e0e0e0;
				--user-msg-bg: #4a5568;
				--assistant-msg-bg: #553c69;
				--border-color: #444;
			}` : ''}
		}
	</style>
</head>
<body>
	<div class="chat-container">
		<div class="chat-header">
			<h2>Better Chat Assistant</h2>
			<p>${publicAvailable ? 'Public Chat' : 'Test Mode'}</p>
		</div>
		<div class="chat-messages" id="messages">
			<div class="message assistant">
				<p>${initialMessage}</p>
				${features.includes('timestamps') ? '<div class="message-timestamp">' + new Date().toLocaleTimeString() + '</div>' : ''}
			</div>
		</div>
		<div class="chat-input">
			<input type="text" id="messageInput" placeholder="Type your message..." autofocus>
			<button id="sendBtn" onclick="sendMessage()">Send</button>
		</div>
	</div>
	<script>
		const webhookUrl = window.location.href.replace('/chat', '/chat');
		const messages = [];
		let sending = false;
		
		function sendMessage() {
			if (sending) return;
			
			const input = document.getElementById('messageInput');
			const message = input.value.trim();
			if (!message) return;
			
			sending = true;
			document.getElementById('sendBtn').disabled = true;
			
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
					messages: messages,
					sessionId: sessionStorage.getItem('chatSessionId') || generateSessionId()
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
			})
			.finally(() => {
				sending = false;
				document.getElementById('sendBtn').disabled = false;
			});
		}
		
		function addMessage(role, content) {
			const messagesDiv = document.getElementById('messages');
			const messageDiv = document.createElement('div');
			messageDiv.className = 'message ' + role;
			
			let html = '';
			${displayMode === 'rich' && features.includes('markdown') ? `
			// Simple markdown processing
			content = content
				.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
				.replace(/\*(.*?)\*/g, '<em>$1</em>')
				.replace(/\`\`\`([\\s\\S]*?)\`\`\`/g, '<pre><code>$1</code></pre>')
				.replace(/\`(.*?)\`/g, '<code>$1</code>');
			` : ''}
			
			html += '<p>' + content + '</p>';
			
			${features.includes('timestamps') ? `
			html += '<div class="message-timestamp">' + new Date().toLocaleTimeString() + '</div>';
			` : ''}
			
			${features.includes('copy') ? `
			if (role === 'assistant') {
				html += '<div class="message-actions"><button class="copy-btn" onclick="copyMessage(this)">Copy</button></div>';
			}
			` : ''}
			
			messageDiv.innerHTML = html;
			messagesDiv.appendChild(messageDiv);
			messagesDiv.scrollTop = messagesDiv.scrollHeight;
		}
		
		function copyMessage(btn) {
			const messageText = btn.parentElement.parentElement.querySelector('p').innerText;
			navigator.clipboard.writeText(messageText).then(() => {
				btn.innerText = 'Copied!';
				setTimeout(() => { btn.innerText = 'Copy'; }, 2000);
			});
		}
		
		function generateSessionId() {
			const id = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
			sessionStorage.setItem('chatSessionId', id);
			return id;
		}
		
		document.getElementById('messageInput').addEventListener('keypress', function(e) {
			if (e.key === 'Enter' && !sending) {
				sendMessage();
			}
		});
	</script>
</body>
</html>`;
			
			return {
				webhookResponse: chatHtml,
			};
		}
		
		// Handle POST request (default webhook)
		if (method === 'POST') {
			const bodyData = this.getBodyData() as any;
			
			// Process incoming message
			const userMessage = bodyData.message || bodyData.text || bodyData.content || '';
			const previousMessages = bodyData.messages || [];
			const sessionId = bodyData.sessionId || bodyData.session_id || `session_${Date.now()}`;
			const threadId = bodyData.threadId || bodyData.thread_id || `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
			
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
						source: 'better_chat',
					},
				});
			}
			
			// Process messages with enabled features
			const processedMessages = processMessages(messages, features);
			
			// Generate chat URL for hosted mode
			let chatUrl = '';
			if (mode === 'hostedChat') {
				try {
					const workflowId = this.getWorkflow().id;
					const webhookUrl = this.getNodeWebhookUrl('default') as string;
					const urlParts = new URL(webhookUrl);
					const baseUrl = `${urlParts.protocol}//${urlParts.host}`;
					
					if (publicAvailable) {
						chatUrl = `${baseUrl}/chat/${workflowId}`;
					} else {
						chatUrl = `${baseUrl}/chat/${workflowId}/test`;
					}
				} catch (error) {
					chatUrl = 'Chat URL will be available when workflow is saved';
				}
			}
			
			// Build output based on selected format
			let output: any;
			
			if (outputFormat === 'aiAgent') {
				// Simplified output for AI Agent compatibility
				output = {
					chatInput: userMessage,
					sessionId,
					threadId,
					messages: processedMessages,
					messageCount: messages.length,
					timestamp: new Date().toISOString(),
				};
				
				if (chatUrl) {
					output.chatUrl = chatUrl;
				}
			} else {
				// Detailed output with all metadata
				output = {
					chatInput: userMessage,
					messages: processedMessages,
					userMessage,
					sessionId,
					threadId,
					chatMode: mode,
					chatUrl: chatUrl || undefined,
					publicAvailable,
					authentication,
					allowedOrigins,
					initialMessage,
					displayMode,
					features,
					theme,
					compactMode,
					maxHeight,
					context: {
						conversation_length: messages.length,
						last_interaction: new Date().toISOString(),
						user_agent: headers['user-agent'],
						ip_address: headers['x-forwarded-for'] || headers['x-real-ip'],
					},
					raw: {
						headers,
						query,
						body: bodyData,
					},
				};
			}
			
			// Always return workflowData to let the workflow continue
			// This ensures compatibility with both lastNode and responseNode modes
			return {
				workflowData: [
					this.helpers.returnJsonArray([output]),
				],
			};
		}
		
		// Default response for other methods
		return {
			webhookResponse: {
				status: 405,
				body: 'Method not allowed',
			},
		};
	}
}