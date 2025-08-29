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
		version: 1,
		defaultVersion: 1,
		description: 'Enhanced chat trigger with rich UI features and full Respond to Webhook compatibility',
		defaults: {
			name: 'Better Chat Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'httpBasicAuthApi',
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
		triggerPanel: true,
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
								description: 'Response defined in Respond to Webhook node',
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
				// eslint-disable-next-line n8n-nodes-base/node-param-collection-type-unsorted-items
				options: [
					{
						displayName: 'Compact Mode',
						name: 'compactMode',
						type: 'boolean',
						default: false,
						description: 'Whether to use compact message spacing',
					},
					{
						displayName: 'Custom Colors',
						name: 'customColors',
						type: 'collection',
						placeholder: 'Add Color',
						default: {},
						description: 'Customize chat interface colors',
						options: [
							{
								displayName: 'Assistant Message Color',
								name: 'assistantMessageColor',
								type: 'color',
								default: '#f3e5f5',
								description: 'Background color for assistant messages',
							},
							{
								displayName: 'Background Color',
								name: 'backgroundColor',
								type: 'color',
								default: '#f5f5f5',
								description: 'Page background color',
							},
							{
								displayName: 'Container Background',
								name: 'containerBackground',
								type: 'color',
								default: '#ffffff',
								description: 'Chat container background',
							},
							{
								displayName: 'Primary Color',
								name: 'primaryColor',
								type: 'color',
								default: '#667eea',
								description: 'Primary accent color',
							},
							{
								displayName: 'Text Color',
								name: 'textColor',
								type: 'color',
								default: '#333333',
								description: 'Main text color',
							},
							{
								displayName: 'User Message Color',
								name: 'userMessageColor',
								type: 'color',
								default: '#e3f2fd',
								description: 'Background color for user messages',
							},
						],
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
						displayName: 'Font Size',
						name: 'fontSize',
						type: 'options',
						options: [
							{
								name: 'Small',
								value: 'small',
							},
							{
								name: 'Medium',
								value: 'medium',
							},
							{
								name: 'Large',
								value: 'large',
							},
							{
								name: 'Extra Large',
								value: 'xlarge',
							},
						],
						default: 'medium',
						description: 'Base font size for chat interface',
					},
					{
						displayName: 'Height',
						name: 'height',
						type: 'string',
						default: '600px',
						description: 'Height of the chat container (e.g., 600px, 80vh, 100%)',
					},
					{
						displayName: 'Max Height',
						name: 'maxHeight',
						type: 'string',
						default: '90vh',
						description: 'Maximum height of the chat container (e.g., 600px, 90vh)',
					},
					{
						displayName: 'Max Width',
						name: 'maxWidth',
						type: 'string',
						default: '800px',
						description: 'Maximum width on large screens (e.g., 800px, 90%)',
					},
					{
						displayName: 'Min Width',
						name: 'minWidth',
						type: 'string',
						default: '320px',
						description: 'Minimum width to maintain usability (e.g., 320px)',
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
						displayName: 'Width',
						name: 'width',
						type: 'string',
						default: '100%',
						description: 'Width of the chat container (e.g., 600px, 80%, 100vw)',
					},
					// Advanced Styling Options
					{
						displayName: 'Border Radius',
						name: 'borderRadius',
						type: 'string',
						default: '10px',
						description: 'Roundness of corners (e.g., 10px, 20px, 50%)',
					},
					{
						displayName: 'Box Shadow',
						name: 'boxShadow',
						type: 'options',
						options: [
							{
								name: 'Glow',
								value: '0 0 30px rgba(102,126,234,0.3)',
							},
							{
								name: 'Large',
								value: '0 20px 60px rgba(0,0,0,0.3)',
							},
							{
								name: 'Medium',
								value: '0 10px 30px rgba(0,0,0,0.2)',
							},
							{
								name: 'None',
								value: 'none',
							},
							{
								name: 'Small',
								value: '0 2px 4px rgba(0,0,0,0.1)',
							},
						],
						default: '0 20px 60px rgba(0,0,0,0.3)',
						description: 'Shadow effect for the chat container',
					},
					{
						displayName: 'Border Style',
						name: 'borderStyle',
						type: 'string',
						default: 'none',
						description: 'Border style (e.g., none, 1px solid #ddd, 2px dashed #999)',
					},
					{
						displayName: 'Padding',
						name: 'padding',
						type: 'string',
						default: '0',
						description: 'Internal spacing (e.g., 20px, 1rem, 10px 20px)',
					},
					{
						displayName: 'Margin',
						name: 'margin',
						type: 'string',
						default: '20px auto',
						description: 'External spacing (e.g., 20px, auto, 10px 20px)',
					},
					// Typography Options
					{
						displayName: 'Font Family',
						name: 'fontFamily',
						type: 'options',
						options: [
							{
								name: 'System',
								value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
							},
							{
								name: 'Sans-Serif',
								value: '"Inter", "Helvetica Neue", Arial, sans-serif',
							},
							{
								name: 'Serif',
								value: 'Georgia, "Times New Roman", Times, serif',
							},
							{
								name: 'Monospace',
								value: '"JetBrains Mono", "Fira Code", Monaco, Consolas, monospace',
							},
						],
						default: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
						description: 'Font family for the chat interface',
					},
					{
						displayName: 'Line Height',
						name: 'lineHeight',
						type: 'options',
						options: [
							{
								name: 'Compact',
								value: '1.2',
							},
							{
								name: 'Normal',
								value: '1.5',
							},
							{
								name: 'Relaxed',
								value: '1.8',
							},
							{
								name: 'Loose',
								value: '2',
							},
						],
						default: '1.5',
						description: 'Line spacing for message text',
					},
					// Animation Options
					{
						displayName: 'Enable Animations',
						name: 'enableAnimations',
						type: 'boolean',
						default: true,
						description: 'Whether to enable smooth transitions and animations',
					},
					{
						displayName: 'Animation Speed',
						name: 'animationSpeed',
						type: 'options',
						options: [
							{
								name: 'Fast',
								value: '150ms',
							},
							{
								name: 'Normal',
								value: '300ms',
							},
							{
								name: 'Slow',
								value: '500ms',
							},
						],
						default: '300ms',
						description: 'Speed of transitions and animations',
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
		const allowFileUploads = (options.allowFileUploads as boolean) || false;
		const allowedFilesMimeTypes = (options.allowedFilesMimeTypes as string) || '*';
		
		// Get UI enhancements
		const uiEnhancements = this.getNodeParameter('uiEnhancements', {}) as IDataObject;
		const outputFormat = (uiEnhancements.outputFormat as string) || 'aiAgent';
		const displayMode = (uiEnhancements.displayMode as string) || 'rich';
		const features = (uiEnhancements.features as string[]) || ['markdown', 'timestamps'];
		const theme = (uiEnhancements.theme as string) || 'auto';
		const compactMode = (uiEnhancements.compactMode as boolean) || false;
		const height = (uiEnhancements.height as string) || '600px';
		const maxHeight = (uiEnhancements.maxHeight as string) || '90vh';
		const width = (uiEnhancements.width as string) || '100%';
		const maxWidth = (uiEnhancements.maxWidth as string) || '800px';
		const minWidth = (uiEnhancements.minWidth as string) || '320px';
		const fontSize = (uiEnhancements.fontSize as string) || 'medium';
		const customColors = (uiEnhancements.customColors as IDataObject) || {};
		
		// Get advanced styling options
		const borderRadius = (uiEnhancements.borderRadius as string) || '10px';
		const boxShadow = (uiEnhancements.boxShadow as string) || '0 20px 60px rgba(0,0,0,0.3)';
		const borderStyle = (uiEnhancements.borderStyle as string) || 'none';
		const padding = (uiEnhancements.padding as string) || '0';
		const margin = (uiEnhancements.margin as string) || '20px auto';
		
		// Get typography options
		const fontFamily = (uiEnhancements.fontFamily as string) || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
		const lineHeight = (uiEnhancements.lineHeight as string) || '1.5';
		
		// Get animation options
		const enableAnimations = (uiEnhancements.enableAnimations as boolean) !== false;
		const animationSpeed = (uiEnhancements.animationSpeed as string) || '300ms';
		
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
	<link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" rel="stylesheet" />
	<style>
		:root {
			--primary-color: ${customColors.primaryColor || '#667eea'};
			--primary-gradient: linear-gradient(135deg, ${customColors.primaryColor || '#667eea'} 0%, ${customColors.primaryColor || '#764ba2'} 100%);
			--bg-color: ${customColors.backgroundColor || (theme === 'dark' ? '#1a1a1a' : '#f5f5f5')};
			--container-bg: ${customColors.containerBackground || (theme === 'dark' ? '#2d2d2d' : 'white')};
			--text-color: ${customColors.textColor || (theme === 'dark' ? '#e0e0e0' : '#333')};
			--user-msg-bg: ${customColors.userMessageColor || (theme === 'dark' ? '#4a5568' : '#e3f2fd')};
			--assistant-msg-bg: ${customColors.assistantMessageColor || (theme === 'dark' ? '#553c69' : '#f3e5f5')};
			--border-color: ${theme === 'dark' ? '#444' : '#e0e0e0'};
			--font-size-base: ${fontSize === 'small' ? '12px' : fontSize === 'medium' ? '14px' : fontSize === 'large' ? '16px' : '18px'};
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
			font-size: var(--font-size-base);
		}
		
		.chat-container {
			background: var(--container-bg);
			border-radius: ${borderRadius};
			box-shadow: ${boxShadow};
			border: ${borderStyle};
			padding: ${padding};
			margin: ${margin};
			width: ${width};
			max-width: ${maxWidth};
			min-width: ${minWidth};
			height: ${height};
			max-height: ${maxHeight};
			display: flex;
			flex-direction: column;
			color: var(--text-color);
			font-family: ${fontFamily};
			line-height: ${lineHeight};
			${enableAnimations ? `
				transition: all ${animationSpeed} ease;
			` : ''}
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
			position: relative;
			${enableAnimations ? `
				animation: fadeIn ${animationSpeed} ease-in;
				transition: transform ${animationSpeed} ease, box-shadow ${animationSpeed} ease;
			` : ''}
		}
		
		${enableAnimations ? `
		.message:hover {
			transform: translateY(-1px);
			box-shadow: 0 4px 12px rgba(0,0,0,0.1);
		}
		` : ''}
		
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
		
		.chat-input button {
			${enableAnimations ? `
				transition: all ${animationSpeed} ease;
			` : ''}
		}
		
		.chat-input button:hover {
			opacity: 0.9;
			${enableAnimations ? `
				transform: scale(1.05);
			` : ''}
		}
		
		.chat-input button:disabled {
			opacity: 0.5;
			cursor: not-allowed;
			transform: none;
		}
		
		/* File upload styles */
		.file-upload {
			margin-left: 10px;
			position: relative;
			display: inline-block;
		}
		
		.file-upload input[type="file"] {
			display: none;
		}
		
		.file-upload label {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			padding: 0.5em;
			background: var(--primary-color);
			color: white;
			border-radius: 50%;
			cursor: pointer;
			width: 2.5em;
			height: 2.5em;
			font-size: 1em;
			transition: opacity 0.3s;
		}
		
		.file-upload label:hover {
			opacity: 0.8;
		}
		
		.file-indicator {
			position: absolute;
			top: -0.25em;
			right: -0.25em;
			background: #4CAF50;
			color: white;
			border-radius: 50%;
			width: 1.2em;
			height: 1.2em;
			font-size: 0.75em;
			display: flex;
			align-items: center;
			justify-content: center;
			font-weight: bold;
		}
		
		/* Copy button styles */
		.copy-button {
			position: absolute;
			top: 5px;
			right: 5px;
			background: rgba(0,0,0,0.1);
			border: none;
			border-radius: 3px;
			padding: 5px 8px;
			cursor: pointer;
			font-size: 12px;
			opacity: 0;
			transition: opacity 0.3s;
		}
		
		.message:hover .copy-button {
			opacity: 1;
		}
		
		.copy-button:hover {
			background: rgba(0,0,0,0.2);
		}
		
		.copy-button.copied {
			background: #4CAF50;
			color: white;
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
		
		/* Responsive Design */
		@media (max-width: 768px) {
			body {
				padding: 10px;
			}
			
			.chat-container {
				width: 100%;
				max-width: 100%;
				height: 100vh;
				max-height: 100vh;
				border-radius: 0;
			}
			
			.chat-header {
				padding: 15px;
			}
			
			.message {
				max-width: 85%;
			}
			
			.input-container {
				padding: 10px;
			}
		}
		
		@media (max-width: 480px) {
			:root {
				--font-size-base: 14px;
			}
			
			.message {
				max-width: 90%;
			}
			
			.send-btn, .file-upload label {
				width: 2em;
				height: 2em;
			}
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
			${allowFileUploads ? `
			<div class="file-upload">
				<input type="file" id="fileInput" accept="${allowedFilesMimeTypes}" onchange="handleFileSelect(event)">
				<label for="fileInput" title="Attach file">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 1.2em; height: 1.2em;">
						<path d="M19.8278 11.2437L12.7074 18.3641C10.7548 20.3167 7.58896 20.3167 5.63634 18.3641C3.68372 16.4114 3.68372 13.2456 5.63634 11.293L12.4717 4.45763C13.7735 3.15589 15.884 3.15589 17.1858 4.45763C18.4875 5.75938 18.4875 7.86993 17.1858 9.17168L10.3614 15.9961C9.71048 16.647 8.6552 16.647 8.00433 15.9961C7.35345 15.3452 7.35345 14.2899 8.00433 13.6391L14.2258 7.41762" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</label>
				<span class="file-indicator" id="fileIndicator" style="display: none;">1</span>
			</div>
			` : ''}
			<button id="sendBtn" onclick="sendMessage()">Send</button>
		</div>
	</div>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-javascript.min.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-python.min.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-json.min.js"></script>
	<script>
		const webhookUrl = window.location.href.replace('/chat', '/chat');
		const messages = [];
		let sending = false;
		let selectedFile = null;
		
		// Runtime configuration
		const chatConfig = {
			features: ${JSON.stringify(features)},
			displayMode: '${displayMode}',
			theme: '${theme}'
		};
		
		function handleFileSelect(event) {
			const file = event.target.files[0];
			if (file) {
				selectedFile = file;
				const indicator = document.getElementById('fileIndicator');
				const label = document.querySelector('.file-upload label');
				
				// Show indicator
				indicator.style.display = 'flex';
				indicator.textContent = '1';
				
				// Update tooltip with file name
				label.title = 'File: ' + file.name;
			}
		}
		
		function fileToBase64(file) {
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => {
					// Extract pure base64 from data URL to avoid special characters
					const dataUrl = reader.result;
					const base64 = dataUrl.split(',')[1];
					resolve(base64);
				};
				reader.onerror = reject;
				reader.readAsDataURL(file);
			});
		}
		
		async function sendMessage() {
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
			
			// Handle file if selected
			let fileData = null;
			if (selectedFile) {
				try {
					const base64 = await fileToBase64(selectedFile);
					fileData = {
						name: selectedFile.name,
						type: selectedFile.type,
						size: selectedFile.size,
						data: base64
					};
					// Clear file selection
					selectedFile = null;
					document.getElementById('fileInput').value = '';
					document.getElementById('fileIndicator').style.display = 'none';
					document.querySelector('.file-upload label').title = 'Attach file';
				} catch (error) {
					console.error('Error reading file:', error);
				}
			}
			
			// Send to webhook
			const payload = {
				message: message,
				messages: messages,
				sessionId: sessionStorage.getItem('chatSessionId') || generateSessionId()
			};
			
			if (fileData) {
				payload.files = [fileData];
			}
			
			fetch(webhookUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload)
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
			let processedContent = content;
			
			// Process content based on display mode
			if (chatConfig.displayMode === 'rich' && chatConfig.features.includes('markdown')) {
				processedContent = processedContent
					.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
					.replace(/\*(.*?)\*/g, '<em>$1</em>')
					.replace(/\`\`\`([\s\S]*?)\`\`\`/g, '<pre><code>$1</code></pre>')
					.replace(/\`(.*?)\`/g, '<code>$1</code>');
			}
			
			html += '<p>' + processedContent + '</p>';
			
			// Add timestamp if enabled
			if (chatConfig.features.includes('timestamps')) {
				html += '<div class="message-timestamp">' + new Date().toLocaleTimeString() + '</div>';
			}
			
			// Add copy button if enabled
			if (chatConfig.features.includes('copy')) {
				html += '<button class="copy-button" data-message-content="">📋</button>';
			}
			
			messageDiv.innerHTML = html;
			messagesDiv.appendChild(messageDiv);
			messagesDiv.scrollTop = messagesDiv.scrollHeight;
			
			// Store content in data attribute after HTML is set
			if (chatConfig.features.includes('copy')) {
				const copyBtn = messageDiv.querySelector('.copy-button');
				if (copyBtn) {
					// Encode the content to safely store in attribute
					copyBtn.setAttribute('data-message-content', btoa(encodeURIComponent(content)));
				}
			}
			
			// Apply syntax highlighting if needed
			if (chatConfig.features.includes('codeHighlight')) {
				if (messageDiv.querySelectorAll('pre code').length > 0) {
					if (typeof Prism !== 'undefined') {
						Prism.highlightAllUnder(messageDiv);
					}
				}
			}
		}
		
		function copyToClipboard(button) {
			// Get text from data attribute and decode it
			const encodedText = button.getAttribute('data-message-content') || '';
			let text = '';
			
			try {
				// Decode from base64 and URI encoding
				text = decodeURIComponent(atob(encodedText));
			} catch (e) {
				// Fallback to raw text if decoding fails
				text = encodedText;
			}
			
			// Create a temporary textarea to copy from
			const temp = document.createElement('textarea');
			temp.value = text.replace(/<[^>]*>/g, ''); // Strip HTML tags
			document.body.appendChild(temp);
			temp.select();
			document.execCommand('copy');
			document.body.removeChild(temp);
			
			// Update button to show copied
			const originalText = button.textContent;
			button.textContent = '✓';
			button.classList.add('copied');
			setTimeout(() => {
				button.textContent = originalText;
				button.classList.remove('copied');
			}, 2000);
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
		
		// Event delegation for copy buttons
		document.getElementById('messagesDiv').addEventListener('click', function(e) {
			if (e.target && e.target.classList.contains('copy-button')) {
				copyToClipboard(e.target);
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
			
			// Extract files from request
			const files = bodyData.files || [];
			
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
				
				// Don't include file data in JSON output - it's in binary format
				// This prevents template parsing issues in AI Agent
				// Files are available via the binary data property instead
				if (files.length > 0) {
					output.hasFiles = true;
					output.fileCount = files.length;
					// File names only, no data
					output.fileNames = files.map((f: any) => f.name);
				}
				
				// Always add chat URL for hosted mode - make it prominent
				if (mode === 'hostedChat' && chatUrl) {
					output.chatUrl = chatUrl;
					output._chatAccess = `🔗 Open Chat: ${chatUrl}`;
				}
			} else {
				// Detailed output with all metadata
				output = {
					chatInput: userMessage,
					messages: processedMessages,
					userMessage,
					sessionId,
					threadId,
					// files: files.length > 0 ? files : undefined, // Files are in binary data, not JSON
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
						body: (() => {
							// Clean body data to remove file content that breaks templates
							const cleanBody = { ...bodyData };
							if (cleanBody.files && Array.isArray(cleanBody.files)) {
								// Keep file metadata but remove actual data
								cleanBody.files = cleanBody.files.map((f: any) => ({
									name: f.name,
									type: f.type,
									size: f.size,
									// data field removed to prevent template errors
								}));
							}
							return cleanBody;
						})(),
					},
				};
			}
			
			// Convert files to n8n binary format if present
			const returnData: any = {
				json: output,
			};
			
			// Add binary data if files are present
			if (files.length > 0) {
				try {
					const binary: any = {};
					
					files.forEach((file: any, index: number) => {
						try {
							const binaryPropertyName = `data${index}`;
							
							// Validate file object structure
							if (!file || !file.data) {
								console.error(`Invalid file object at index ${index}:`, file);
								return; // Skip this file
							}
							
							// File data should already be pure base64 from frontend
							// But handle both cases for compatibility
							let base64Data = file.data;
							if (typeof file.data === 'string' && file.data.startsWith('data:')) {
								// Legacy: Extract base64 from data URL if needed
								const parts = file.data.split(',');
								base64Data = parts[1] || file.data;
							}
							
							// Validate base64 data
							if (!base64Data || typeof base64Data !== 'string') {
								console.error(`Invalid base64 data for file ${file.name}`);
								return; // Skip this file
							}
							
							// Convert base64 to Buffer with error handling
							let buffer: Buffer;
							try {
								buffer = Buffer.from(base64Data, 'base64');
							} catch (bufferError) {
								console.error(`Error converting base64 to buffer for file ${file.name}:`, bufferError);
								return; // Skip this file
							}
							
							// Add to binary object in n8n standard format
							binary[binaryPropertyName] = {
								data: buffer,
								fileName: file.name || `file_${index}`,
								mimeType: file.type || 'application/octet-stream',
								fileSize: buffer.length,
							};
							
							// Also keep reference in JSON for backward compatibility
							if (!returnData.json.binaryPropertyNames) {
								returnData.json.binaryPropertyNames = [];
							}
							returnData.json.binaryPropertyNames.push(binaryPropertyName);
						} catch (fileError) {
							console.error(`Error processing file at index ${index}:`, fileError);
							// Continue with next file
						}
					});
					
					// Only add binary property if we successfully processed at least one file
					if (Object.keys(binary).length > 0) {
						returnData.binary = binary;
					}
				} catch (error) {
					console.error('Error processing files:', error);
					// Continue without binary data rather than crashing
				}
			}
			
			// Always return workflowData to let the workflow continue
			// This ensures compatibility with both lastNode and responseNode modes
			// n8n expects array of arrays for proper item iteration
			return {
				workflowData: [
					[returnData],  // Always double-nested for consistency
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