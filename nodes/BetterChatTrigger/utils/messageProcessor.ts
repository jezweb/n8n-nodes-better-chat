/**
 * Message processing utilities for Better Chat Trigger
 */

import { MessageData } from '../types/interfaces';

/**
 * Process messages with features like markdown rendering, code highlighting, etc.
 */
export function processMessages(messages: MessageData[], features: string[]): MessageData[] {
	return messages.map(message => {
		const processed = { ...message };

		// Add processing timestamps
		if (features.includes('timestamps') && !processed.timestamp) {
			processed.timestamp = new Date().toISOString();
		}

		// Add metadata if missing
		if (!processed.metadata) {
			processed.metadata = {};
		}

		// Process content based on features
		if (features.includes('markdown')) {
			// Markdown processing would happen here
			// For now, just flag that it should be rendered as markdown
			processed.metadata!.renderMarkdown = true;
		}

		if (features.includes('codeHighlight')) {
			// Code highlighting processing would happen here
			processed.metadata!.highlightCode = true;
		}

		return processed;
	});
}

/**
 * Validate and sanitize message content
 */
export function sanitizeMessage(message: string): string {
	if (!message || typeof message !== 'string') {
		return '';
	}

	// Basic sanitization - remove potentially harmful content
	return message
		.trim()
		.replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
		.replace(/<iframe[^>]*>.*?<\/iframe>/gi, '') // Remove iframe tags
		.replace(/javascript:/gi, '') // Remove javascript: protocol
		.replace(/on\w+\s*=/gi, ''); // Remove event handlers
}

/**
 * Generate unique session ID
 */
export function generateSessionId(): string {
	return 'session_' + Math.random().toString(36).substring(2) + '_' + Date.now();
}

/**
 * Generate unique thread ID
 */
export function generateThreadId(): string {
	return 'thread_' + Math.random().toString(36).substring(2) + '_' + Date.now();
}

/**
 * Extract user message from request body
 */
export function extractUserMessage(bodyData: any): string {
	// Handle different message formats
	if (typeof bodyData === 'string') {
		try {
			bodyData = JSON.parse(bodyData);
		} catch {
			return bodyData.trim();
		}
	}

	if (bodyData && typeof bodyData === 'object') {
		// Standard format
		if (bodyData.message) {
			return sanitizeMessage(bodyData.message);
		}
		
		// Alternative formats
		if (bodyData.text) {
			return sanitizeMessage(bodyData.text);
		}
		
		if (bodyData.content) {
			return sanitizeMessage(bodyData.content);
		}
		
		// Chat widget format
		if (bodyData.chatInput) {
			return sanitizeMessage(bodyData.chatInput);
		}
	}

	return '';
}

/**
 * Extract conversation messages from request body
 */
export function extractMessages(bodyData: any): MessageData[] {
	if (!bodyData || !bodyData.messages || !Array.isArray(bodyData.messages)) {
		return [];
	}

	return bodyData.messages.map((msg: any) => ({
		role: msg.role || 'user',
		content: sanitizeMessage(msg.content || msg.message || ''),
		timestamp: msg.timestamp || new Date().toISOString(),
		metadata: msg.metadata || {},
	}));
}