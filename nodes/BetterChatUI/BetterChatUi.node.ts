import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	NodeOperationError,
	NodeConnectionType,
	ApplicationError,
} from 'n8n-workflow';

export class BetterChatUI implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Better Chat UI',
		name: 'betterChatUi',
		icon: 'file:chat.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["displayMode"]}}',
		description: 'A sophisticated chat UI node for n8n workflows with rich text rendering, file handling, and advanced conversation features. Use this to create beautiful chat interfaces for AI agents.',
		defaults: {
			name: 'Better Chat UI',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		properties: [
			// Display Mode
			{
				displayName: 'Display Mode',
				name: 'displayMode',
				type: 'options',
				options: [
					{
						name: 'Simple',
						value: 'simple',
						description: 'Basic chat interface with message display',
					},
					{
						name: 'Rich',
						value: 'rich',
						description: 'Enhanced interface with Markdown and code highlighting',
					},
					{
						name: 'Advanced',
						value: 'advanced',
						description: 'Full-featured interface with threading, folders, and search',
					},
				],
				default: 'rich',
				noDataExpression: true,
			},
			// Features
			{
				displayName: 'Features',
				name: 'features',
				type: 'multiOptions',
				options: [
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
						name: 'Export Chat',
						value: 'export',
						description: 'Enable conversation export functionality',
					},
					{
						name: 'File Upload',
						value: 'files',
						description: 'Enable file upload functionality',
					},
					{
						name: 'Markdown Rendering',
						value: 'markdown',
						description: 'Render Markdown formatted text in messages',
					},
					{
						name: 'Pin Messages',
						value: 'pin',
						description: 'Allow pinning important messages',
					},
					{
						name: 'Regenerate',
						value: 'regenerate',
						description: 'Allow regenerating AI responses',
					},
					{
						name: 'Search',
						value: 'search',
						description: 'Enable search within conversation',
					},
					{
						name: 'Timestamps',
						value: 'timestamps',
						description: 'Show message timestamps',
					},
					{
						name: 'Voice Input',
						value: 'voice',
						description: 'Allow voice input for messages',
					},
				],
				default: ['markdown', 'codeHighlight', 'copy', 'timestamps'],
				displayOptions: {
					show: {
						displayMode: ['rich', 'advanced'],
					},
				},
			},
			// Message Input
			{
				displayName: 'Message',
				name: 'message',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				placeholder: 'Enter your message here...',
				description: 'The message to send in the chat',
			},
			// System Prompt Override
			{
				displayName: 'System Prompt',
				name: 'systemPrompt',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				placeholder: 'Optional system prompt override...',
				description: 'Override the system prompt for the AI agent',
				displayOptions: {
					show: {
						displayMode: ['rich', 'advanced'],
					},
				},
			},
			// Thread Management
			{
				displayName: 'Thread Options',
				name: 'threadOptions',
				type: 'collection',
				placeholder: 'Add Thread Option',
				default: {},
				displayOptions: {
					show: {
						displayMode: ['advanced'],
					},
				},
				options: [
					{
						displayName: 'Thread ID',
						name: 'threadId',
						type: 'string',
						default: '',
						description: 'Unique identifier for the conversation thread',
					},
					{
						displayName: 'Folder',
						name: 'folder',
						type: 'string',
						default: '',
						description: 'Folder name for organizing conversations',
					},
					{
						displayName: 'Max Messages',
						name: 'maxMessages',
						type: 'number',
						default: 50,
						description: 'Maximum number of messages to display',
					},
				],
			},
			// UI Settings
			{
				displayName: 'UI Settings',
				name: 'uiSettings',
				type: 'collection',
				placeholder: 'Add UI Setting',
				default: {},
				options: [
					{
						displayName: 'Compact Mode',
						name: 'compactMode',
						type: 'boolean',
						default: false,
						description: 'Whether to use compact message spacing',
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
						],
						default: 'medium',
						description: 'Text size in the chat interface',
					},
					{
						displayName: 'Max Height (Px)',
						name: 'maxHeight',
						type: 'number',
						default: 600,
						description: 'Maximum height of the chat container in pixels',
					},
					{
						displayName: 'Show Avatars',
						name: 'showAvatars',
						type: 'boolean',
						default: true,
						description: 'Whether to show user and assistant avatars',
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
				],
			},
			// File Upload Settings
			{
				displayName: 'File Settings',
				name: 'fileSettings',
				type: 'collection',
				placeholder: 'Add File Setting',
				default: {},
				displayOptions: {
					show: {
						features: ['files'],
					},
				},
				options: [
					{
						displayName: 'Allowed Types',
						name: 'allowedTypes',
						type: 'string',
						default: '.pdf,.txt,.doc,.docx,.png,.jpg,.jpeg',
						description: 'Comma-separated list of allowed file extensions',
					},
					{
						displayName: 'Max File Size (MB)',
						name: 'maxFileSize',
						type: 'number',
						default: 10,
						description: 'Maximum file size in megabytes',
					},
					{
						displayName: 'Storage Mode',
						name: 'storageMode',
						type: 'options',
						options: [
							{
								name: 'Base64',
								value: 'base64',
								description: 'Encode files as base64 (suitable for small files)',
							},
							{
								name: 'URL Reference',
								value: 'url',
								description: 'Store as URL reference (requires external storage)',
							},
						],
						default: 'base64',
						description: 'How to handle uploaded files',
					},
				],
			},
			// Export Settings
			{
				displayName: 'Export Settings',
				name: 'exportSettings',
				type: 'collection',
				placeholder: 'Add Export Setting',
				default: {},
				displayOptions: {
					show: {
						features: ['export'],
					},
				},
				options: [
					{
						displayName: 'Export Formats',
						name: 'exportFormats',
						type: 'multiOptions',
						options: [
							{
								name: 'JSON',
								value: 'json',
							},
							{
								name: 'Markdown',
								value: 'markdown',
							},
							{
								name: 'Plain Text',
								value: 'text',
							},
							{
								name: 'HTML',
								value: 'html',
							},
						],
						default: ['json', 'markdown'],
						description: 'Available export formats for conversations',
					},
					{
						displayName: 'Include Metadata',
						name: 'includeMetadata',
						type: 'boolean',
						default: true,
						description: 'Whether to include metadata in exports',
					},
				],
			},
		],
		// This allows the node to be used as a tool by AI Agents
		usableAsTool: true,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const nodeInstance = new BetterChatUI();

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				// Get parameters
				const displayMode = this.getNodeParameter('displayMode', itemIndex) as string;
				const features = this.getNodeParameter('features', itemIndex, []) as string[];
				const message = this.getNodeParameter('message', itemIndex, '') as string;
				const systemPrompt = this.getNodeParameter('systemPrompt', itemIndex, '') as string;
				const threadOptions = this.getNodeParameter('threadOptions', itemIndex, {}) as IDataObject;
				const uiSettings = this.getNodeParameter('uiSettings', itemIndex, {}) as IDataObject;
				const fileSettings = this.getNodeParameter('fileSettings', itemIndex, {}) as IDataObject;
				const exportSettings = this.getNodeParameter('exportSettings', itemIndex, {}) as IDataObject;

				// Get input data
				const inputData = items[itemIndex].json;

				// Initialize messages array
				let messages: any[] = [];

				// Check if we have previous messages from input
				if (inputData.messages && Array.isArray(inputData.messages)) {
					messages = inputData.messages;
				}

				// Generate thread ID if not provided
				const threadId = threadOptions.threadId || `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

				// Add current message if provided
				if (message) {
					messages.push({
						role: 'user',
						content: message,
						timestamp: new Date().toISOString(),
						metadata: {
							thread_id: threadId,
							folder: threadOptions.folder || 'default',
						},
					});
				}

				// Handle system prompt if provided
				if (systemPrompt && messages.length > 0) {
					// Insert system prompt at the beginning if not already present
					const hasSystemMessage = messages.some(m => m.role === 'system');
					if (!hasSystemMessage) {
						messages.unshift({
							role: 'system',
							content: systemPrompt,
							timestamp: new Date().toISOString(),
						});
					}
				}

				// Apply max messages limit if set
				const maxMessages = threadOptions.maxMessages as number;
				if (maxMessages && messages.length > maxMessages) {
					// Keep system message if present, then slice from the end
					const systemMessages = messages.filter(m => m.role === 'system');
					const nonSystemMessages = messages.filter(m => m.role !== 'system');
					const limitedMessages = nonSystemMessages.slice(-(maxMessages - systemMessages.length));
					messages = [...systemMessages, ...limitedMessages];
				}

				// Process features
				const processedMessages = nodeInstance.processMessages(messages, features);

				// Prepare output
				const output: IDataObject = {
					messages: processedMessages,
					action: inputData.action || 'send',
					displayMode,
					features,
					uiState: {
						...uiSettings,
						lastInteraction: new Date().toISOString(),
					},
					context: {
						thread_id: threadId,
						session_id: this.getExecutionId(),
						folder: threadOptions.folder || 'default',
					},
				};

				// Add file settings if files feature is enabled
				if (features.includes('files')) {
					output.fileSettings = fileSettings;
				}

				// Add export settings if export feature is enabled
				if (features.includes('export')) {
					output.exportSettings = exportSettings;
				}

				// Handle any files from input
				if (inputData.files && Array.isArray(inputData.files)) {
					try {
						output.files = nodeInstance.processFiles(inputData.files, fileSettings);
					} catch (error) {
						if (this.continueOnFail()) {
							output.fileError = error.message;
						} else {
							throw new NodeOperationError(this.getNode(), error.message);
						}
					}
				}

				returnData.push({
					json: output,
					pairedItem: itemIndex,
				});

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
						},
						pairedItem: itemIndex,
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), error);
			}
		}

		return [returnData];
	}

	// Helper method to process messages based on features
	private processMessages(messages: any[], features: string[]): any[] {
		return messages.map(message => {
			const processed = { ...message };

			// Add timestamps if enabled
			if (features.includes('timestamps') && !processed.timestamp) {
				processed.timestamp = new Date().toISOString();
			}

			// Process markdown if enabled
			if (features.includes('markdown')) {
				processed.markdown = true;
			}

			// Add code highlighting flag if enabled
			if (features.includes('codeHighlight')) {
				processed.codeHighlight = true;
			}

			// Add action flags
			if (features.includes('copy')) {
				processed.actions = processed.actions || [];
				processed.actions.push('copy');
			}

			if (features.includes('pin')) {
				processed.actions = processed.actions || [];
				processed.actions.push('pin');
			}

			if (features.includes('regenerate') && message.role === 'assistant') {
				processed.actions = processed.actions || [];
				processed.actions.push('regenerate');
			}

			return processed;
		});
	}

	// Helper method to process files
	private processFiles(files: any[], settings: IDataObject): any[] {
		const allowedTypes = (settings.allowedTypes as string || '.pdf,.txt,.doc,.docx,.png,.jpg,.jpeg').split(',');
		const maxFileSize = (settings.maxFileSize as number || 10) * 1024 * 1024; // Convert MB to bytes
		const storageMode = settings.storageMode as string || 'base64';

		return files.map(file => {
			// Validate file type
			const extension = '.' + file.name.split('.').pop()?.toLowerCase();
			if (!allowedTypes.includes(extension)) {
				throw new ApplicationError(`File type ${extension} is not allowed`);
			}

			// Validate file size (if provided)
			if (file.size && file.size > maxFileSize) {
				throw new ApplicationError(`File ${file.name} exceeds maximum size of ${settings.maxFileSize}MB`);
			}

			// Process based on storage mode
			if (storageMode === 'base64' && file.data) {
				return {
					name: file.name,
					type: file.type,
					data: file.data,
					encoding: 'base64',
				};
			} else if (storageMode === 'url' && file.url) {
				return {
					name: file.name,
					type: file.type,
					url: file.url,
				};
			}

			return file;
		});
	}
}