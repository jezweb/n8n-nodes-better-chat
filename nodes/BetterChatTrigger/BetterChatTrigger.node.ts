/**
 * Better Chat Trigger Node - Modularized Version
 * 
 * A sophisticated chat UI trigger node for n8n workflows with multiple access modes,
 * file handling, rich text rendering, and advanced conversation features.
 * Now fully compatible with n8n's Respond to Webhook node.
 */

import {
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
	NodeConnectionType,
	IDataObject,
} from 'n8n-workflow';

// Import modular components
import { CHAT_TRIGGER_PATH_IDENTIFIER, DEFAULT_CONFIG, FEATURE_OPTIONS, THEME_OPTIONS, BOX_SHADOW_OPTIONS, FONT_FAMILY_OPTIONS, FONT_SIZE_OPTIONS, LINE_HEIGHT_OPTIONS, ANIMATION_SPEED_OPTIONS } from './constants/defaults';
import { ChatConfig, ChatOutput } from './types/interfaces';
import { escapeBraces } from './utils/escaping';
import { processMessages, generateSessionId, generateThreadId, extractUserMessage, extractMessages } from './utils/messageProcessor';
import { processFiles, convertToBinaryFormat, cleanFileDataFromBody, extractFiles } from './utils/fileHandler';
import { generateChatHTML } from './utils/htmlGenerator';

export class BetterChatTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Better Chat Trigger',
		name: 'betterChatTrigger',
		icon: 'file:chat.svg',
		group: ['trigger'],
		version: [1, 1.1, 1.2, 1.3],
		subtitle: '={{$parameter["mode"]}} mode',
		description: 'Enhanced chat trigger with rich UI features and multiple access modes',
		eventTriggerDescription: '',
		activationMessage: 'You can now make calls to your production chat URL.',
		defaults: {
			name: 'Better Chat Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionType.Main],
		webhooks: [
			{
				name: 'setup',
				httpMethod: 'GET',
				responseMode: 'onReceived',
				path: CHAT_TRIGGER_PATH_IDENTIFIER,
			},
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: '={{$parameter.options?.["responseMode"] || "lastNode" }}',
				path: CHAT_TRIGGER_PATH_IDENTIFIER,
			},
		],
		triggerPanel: {
			header: 'Chat',
		},
		properties: [
			// Chat Mode Configuration
			{
				displayName: 'Chat Access Mode',
				name: 'mode',
				type: 'options',
				options: [
					{
						name: 'Webhook Only',
						value: 'webhook',
						description: 'Basic webhook endpoint for custom integrations',
					},
					{
						name: 'Hosted Chat',
						value: 'hostedChat',
						description: 'N8n provides complete chat interface with generated URL',
					},
					{
						name: 'Embedded Chat',
						value: 'embedded',
						description: 'For @n8n/chat widget integration',
					},
				],
				default: 'hostedChat',
				description: 'How users will access the chat interface',
			},

			// Webhook Path
			{
				displayName: 'Webhook Path',
				name: 'path',
				type: 'string',
				default: CHAT_TRIGGER_PATH_IDENTIFIER,
				placeholder: 'webhook-path',
				required: true,
				description: 'The path for the webhook URL',
			},

			// Public Access Toggle
			{
				displayName: 'Make Chat Publicly Available',
				name: 'public',
				type: 'boolean',
				default: false,
				description: 'Whether the chat should be publicly accessible',
				displayOptions: {
					show: {
						mode: ['hostedChat', 'embedded'],
					},
				},
			},

			// Authentication Options
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						name: 'None',
						value: 'none',
					},
					{
						name: 'Basic Auth',
						value: 'basicAuth',
					},
				],
				default: 'none',
				description: 'How to authenticate users',
				displayOptions: {
					show: {
						mode: ['hostedChat', 'embedded'],
					},
				},
			},

			// Basic Auth Username
			{
				displayName: 'Username',
				name: 'authenticationData.username',
				type: 'string',
				default: '',
				required: true,
				description: 'Username for Basic Auth',
				displayOptions: {
					show: {
						authentication: ['basicAuth'],
					},
				},
			},

			// Basic Auth Password
			{
				displayName: 'Password',
				name: 'authenticationData.password',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				required: true,
				description: 'Password for Basic Auth',
				displayOptions: {
					show: {
						authentication: ['basicAuth'],
					},
				},
			},

			// Initial Message
			{
				displayName: 'Initial Message',
				name: 'initialMessage',
				type: 'string',
				default: DEFAULT_CONFIG.INITIAL_MESSAGE,
				description: 'Welcome message shown when chat loads',
				displayOptions: {
					show: {
						mode: ['hostedChat'],
					},
				},
			},

			// Options Collection
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
						options: [
							{
								name: 'When Last Node Finishes',
								value: 'lastNode',
								description: 'Response when the last node of the workflow finished executing',
							},
							{
								name: 'Using Respond to Webhook Node',
								value: 'responseNode',
								description: 'Response defined by Respond to Webhook node',
							},
						],
						default: 'lastNode',
						description: 'When to respond and how',
					},
					{
						displayName: 'Allowed Origins (CORS)',
						name: 'allowedOrigins',
						type: 'string',
						default: '*',
						description: 'Comma-separated list of allowed origins for CORS. Use "*" to allow all.',
						displayOptions: {
							show: {
								'/mode': ['embedded'],
							},
						},
					},
					{
						displayName: 'Allow File Uploads',
						name: 'allowFileUploads',
						type: 'boolean',
						default: false,
						description: 'Whether to allow users to upload files',
					},
					{
						displayName: 'Allowed File Types',
						name: 'allowedFilesMimeTypes',
						type: 'string',
						default: '*',
						placeholder: '.pdf,.txt,.png,.jpg',
						description: 'Comma-separated list of allowed file types/extensions. Use "*" to allow all.',
						displayOptions: {
							show: {
								allowFileUploads: [true],
							},
						},
					},
				],
			},

			// UI Enhancements Collection
			{
				displayName: 'UI Enhancements',
				name: 'uiEnhancements',
				type: 'collection',
				placeholder: 'Add Enhancement',
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
						displayName: 'Theme',
						name: 'theme',
						type: 'options',
						options: THEME_OPTIONS,
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
						options: BOX_SHADOW_OPTIONS,
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
						options: FONT_FAMILY_OPTIONS,
						default: 'system',
						description: 'Font family for the chat interface',
					},
					{
						displayName: 'Font Size',
						name: 'fontSize',
						type: 'options',
						options: FONT_SIZE_OPTIONS,
						default: 'medium',
						description: 'Base font size for the chat interface',
					},
					{
						displayName: 'Line Height',
						name: 'lineHeight',
						type: 'options',
						options: LINE_HEIGHT_OPTIONS,
						default: 'normal',
						description: 'Line height for better readability',
					},
					// Animation Options
					{
						displayName: 'Enable Animations',
						name: 'enableAnimations',
						type: 'boolean',
						default: true,
						description: 'Whether to enable smooth animations and transitions',
					},
					{
						displayName: 'Animation Speed',
						name: 'animationSpeed',
						type: 'options',
						options: ANIMATION_SPEED_OPTIONS,
						default: 'normal',
						description: 'Speed of animations and transitions',
						displayOptions: {
							show: {
								enableAnimations: [true],
							},
						},
					},
					{
						displayName: 'Features',
						name: 'features',
						type: 'multiOptions',
						options: FEATURE_OPTIONS,
						default: ['markdown', 'codeHighlight', 'copy', 'timestamps'],
						description: 'Chat features to enable',
					},
					{
						displayName: 'Compact Mode',
						name: 'compactMode',
						type: 'boolean',
						default: false,
						description: 'Whether to reduce message spacing for more compact display',
					},
					{
						displayName: 'Max Height',
						name: 'maxHeight',
						type: 'string',
						default: '90vh',
						description: 'Maximum height of the chat container (e.g., 600px, 90vh)',
					},
					// Custom Colors
					{
						displayName: 'Custom Colors',
						name: 'customColors',
						type: 'collection',
						placeholder: 'Add Color',
						default: {},
						options: [
							{
								displayName: 'Primary Color',
								name: 'primaryColor',
								type: 'color',
								default: '#667eea',
								description: 'Main accent color for buttons and highlights',
							},
							{
								displayName: 'Background Color',
								name: 'backgroundColor',
								type: 'color',
								default: '',
								placeholder: 'Leave empty for theme default',
								description: 'Page background color',
							},
							{
								displayName: 'Container Background',
								name: 'containerBackground',
								type: 'string',
								default: '',
								placeholder: 'Leave empty for theme default',
								description: 'Chat container background color',
							},
							{
								displayName: 'User Message Color',
								name: 'userMessageColor',
								type: 'color',
								default: '',
								placeholder: 'Leave empty for theme default',
								description: 'Background color for user messages',
							},
							{
								displayName: 'Assistant Message Color',
								name: 'assistantMessageColor',
								type: 'color',
								default: '',
								placeholder: 'Leave empty for theme default',
								description: 'Background color for assistant messages',
							},
							{
								displayName: 'Text Color',
								name: 'textColor',
								type: 'color',
								default: '',
								placeholder: 'Leave empty for theme default',
								description: 'Primary text color',
							},
						],
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
		const initialMessage = this.getNodeParameter('initialMessage', DEFAULT_CONFIG.INITIAL_MESSAGE) as string;
		
		// Get options
		const options = this.getNodeParameter('options', {}) as IDataObject;
		const allowedOrigins = (options.allowedOrigins as string) || '*';
		
		// Get UI enhancements
		const uiEnhancements = this.getNodeParameter('uiEnhancements', {}) as IDataObject;
		const outputFormat = (uiEnhancements.outputFormat as string) || 'aiAgent';
		const displayMode = (uiEnhancements.displayMode as string) || 'rich';
		const features = (uiEnhancements.features as string[]) || ['markdown', 'timestamps'];
		const theme = (uiEnhancements.theme as string) || 'auto';
		const compactMode = (uiEnhancements.compactMode as boolean) || false;
		const maxHeight = (uiEnhancements.maxHeight as string) || '90vh';
		const width = (uiEnhancements.width as string) || '100%';
		const fontSize = (uiEnhancements.fontSize as string) || 'medium';
		const customColors = (uiEnhancements.customColors as IDataObject) || {};
		
		// Get advanced styling options
		const borderRadius = (uiEnhancements.borderRadius as string) || '10px';
		const boxShadow = (uiEnhancements.boxShadow as string) || '0 20px 60px rgba(0,0,0,0.3)';
		const borderStyle = (uiEnhancements.borderStyle as string) || 'none';
		const padding = (uiEnhancements.padding as string) || '0';
		const margin = (uiEnhancements.margin as string) || '20px auto';
		
		// Get typography and animation options
		const fontFamily = (uiEnhancements.fontFamily as string) || 'system';
		const lineHeight = (uiEnhancements.lineHeight as string) || 'normal';
		const enableAnimations = (uiEnhancements.enableAnimations as boolean) !== false;
		const animationSpeed = (uiEnhancements.animationSpeed as string) || 'normal';

		// Generate webhook URL for hosted chat
		let chatUrl = '';
		if (mode === 'hostedChat') {
			chatUrl = this.getNodeWebhookUrl('setup') as string;
		}

		// Handle CORS
		const corsHeaders: IDataObject = {};
		if (allowedOrigins && allowedOrigins !== '*') {
			const requestOrigin = headers.origin as string;
			const allowedOriginsList = allowedOrigins.split(',').map(origin => origin.trim());
			if (allowedOriginsList.includes(requestOrigin)) {
				corsHeaders['Access-Control-Allow-Origin'] = requestOrigin;
			}
		} else {
			corsHeaders['Access-Control-Allow-Origin'] = '*';
		}
		corsHeaders['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
		corsHeaders['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';

		// Handle preflight requests
		if (method === 'OPTIONS') {
			return {
				webhookResponse: {
					status: 200,
					headers: corsHeaders,
					body: '',
				},
			};
		}
		
		// Handle GET request for hosted chat interface (setup webhook)
		if (method === 'GET' && webhookName === 'setup' && mode === 'hostedChat') {
			// Create configuration object for HTML generation
			const chatConfig: ChatConfig = {
				chatMode: mode as 'hostedChat',
				webhookPath: CHAT_TRIGGER_PATH_IDENTIFIER,
				publicAvailable,
				authentication: authentication as 'none' | 'basic',
				allowedOrigins,
				initialMessage,
				outputFormat: outputFormat as 'aiAgent' | 'detailed',
				displayMode: displayMode as 'simple' | 'rich',
				features,
				theme: theme as 'light' | 'dark' | 'auto',
				width,
				maxHeight: 600, // Convert to number if needed
				compactMode,
				borderRadius,
				boxShadow,
				borderStyle,
				padding,
				margin,
				fontFamily,
				fontSize,
				lineHeight,
				enableAnimations,
				animationSpeed,
				primaryColor: customColors.primaryColor as string,
				backgroundColor: customColors.backgroundColor as string,
				containerBackground: customColors.containerBackground as string,
				userMessageColor: customColors.userMessageColor as string,
				assistantMessageColor: customColors.assistantMessageColor as string,
				textColor: customColors.textColor as string,
			};

			// Generate HTML using modular function
			const chatHtml = generateChatHTML(chatConfig);
			
			return {
				webhookResponse: {
					status: 200,
					headers: {
						'Content-Type': 'text/html',
						...corsHeaders,
					},
					body: chatHtml,
				},
			};
		}
		
		// Handle POST request for message processing
		if (method === 'POST') {
			// Get request body
			const bodyData = this.getBodyData();

			// Extract user message and files
			const userMessage = extractUserMessage(bodyData);
			const files = extractFiles(bodyData);
			const messages = extractMessages(bodyData);

			// Generate session and thread IDs if not provided
			const sessionId = (bodyData as any)?.session_id || (bodyData as any)?.sessionId || generateSessionId();
			const threadId = (bodyData as any)?.thread_id || (bodyData as any)?.threadId || generateThreadId();

			// Process messages with selected features
			const processedMessages = processMessages([
				...messages,
				{
					role: 'user',
					content: userMessage,
					timestamp: new Date().toISOString(),
					metadata: {},
				}
			], features);

			// Process files
			const processedFiles = processFiles(files);

			// Build output based on selected format
			let output: ChatOutput;
			
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
				if (processedFiles.length > 0) {
					output.hasFiles = true;
					output.fileCount = processedFiles.length;
					// File names only
					output.fileNames = processedFiles.map(f => f.name);
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
					messageCount: messages.length,
					timestamp: new Date().toISOString(),
					userMessage: userMessage,
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
					maxHeight: parseInt(maxHeight.replace(/\D/g, '')) || 600,
					context: {
						conversation_length: messages.length,
						last_interaction: new Date().toISOString(),
						user_agent: headers['user-agent'],
						ip_address: headers['x-forwarded-for'] || headers['x-real-ip'],
					},
					raw: {
						headers,
						query,
						body: cleanFileDataFromBody(bodyData),
					},
				} as ChatOutput;
			}
			
			// CRITICAL: Escape ALL curly braces in the entire output object
			// This prevents AI Agent template parsing errors from ANY string field
			// Must be done after output is fully constructed but before returning
			output = escapeBraces(output);
			
			// Convert files to n8n binary format if present
			const returnData: any = {
				json: output,
			};
			
			// Add binary data if files are present
			if (processedFiles.length > 0) {
				try {
					const { binary, binaryPropertyNames } = convertToBinaryFormat(processedFiles);
					
					// Only add binary property if we successfully processed at least one file
					if (Object.keys(binary).length > 0) {
						returnData.binary = binary;
						returnData.json.binaryPropertyNames = binaryPropertyNames;
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