/**
 * Type definitions for Better Chat Trigger node
 */

export interface ChatConfig {
	chatMode: 'webhook' | 'hosted' | 'embedded' | 'hostedChat';
	webhookPath: string;
	publicAvailable: boolean;
	authentication: 'none' | 'basic';
	authUsername?: string;
	authPassword?: string;
	allowedOrigins: string;
	initialMessage: string;
	outputFormat: 'aiAgent' | 'detailed';
	displayMode: 'simple' | 'rich';
	features: string[];
	theme: 'light' | 'dark' | 'auto';
	width: string;
	maxWidth?: string;
	minWidth?: string;
	height?: string;
	maxHeight: number;
	compactMode: boolean;
	allowFileUploads?: boolean;
	allowedFilesMimeTypes?: string;
	// Advanced styling
	borderRadius: string;
	boxShadow: string;
	borderStyle: string;
	padding: string;
	margin: string;
	// Typography
	fontFamily: string;
	fontSize: string;
	lineHeight: string;
	// Animation
	enableAnimations: boolean;
	animationSpeed: string;
	// Colors
	primaryColor?: string;
	backgroundColor?: string;
	containerBackground?: string;
	userMessageColor?: string;
	assistantMessageColor?: string;
	textColor?: string;
}

export interface MessageData {
	role: 'user' | 'assistant' | 'system';
	content: string;
	timestamp: string;
	metadata?: {
		thread_id?: string;
		message_id?: string;
		folder?: string;
		pinned?: boolean;
		files?: FileData[];
		renderMarkdown?: boolean;
		highlightCode?: boolean;
	};
}

export interface FileData {
	name: string;
	type: string;
	data?: string; // base64
	size?: number;
}

export interface ChatWebhookInput {
	message: string;
	messages?: MessageData[];
	session_id?: string;
	thread_id?: string;
	files?: FileData[];
}

export interface ChatOutput {
	chatInput: string;
	sessionId: string;
	threadId: string;
	messages: MessageData[];
	messageCount: number;
	timestamp: string;
	chatMode?: string;
	chatUrl?: string;
	publicAvailable?: boolean;
	authentication?: string;
	allowedOrigins?: string;
	initialMessage?: string;
	displayMode?: string;
	features?: string[];
	theme?: string;
	compactMode?: boolean;
	hasFiles?: boolean;
	fileCount?: number;
	fileNames?: string[];
	_chatAccess?: string;
	[key: string]: any;
}

export interface ProcessedFile {
	name: string;
	type: string;
	size: number;
	data: string; // base64
}