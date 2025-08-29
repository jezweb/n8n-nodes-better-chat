/**
 * Default values and constants for Better Chat Trigger node
 */

export const CHAT_TRIGGER_PATH_IDENTIFIER = 'chat';

export const DEFAULT_CONFIG = {
	CHAT_MODE: 'webhook' as const,
	WEBHOOK_PATH: 'webhook',
	PUBLIC_AVAILABLE: false,
	AUTHENTICATION: 'none' as const,
	ALLOWED_ORIGINS: '*',
	INITIAL_MESSAGE: 'Hi! How can I help you today?',
	OUTPUT_FORMAT: 'aiAgent' as const,
	DISPLAY_MODE: 'rich' as const,
	THEME: 'auto' as const,
	WIDTH: '100%',
	MAX_HEIGHT: 600,
	COMPACT_MODE: false,
	// Advanced styling
	BORDER_RADIUS: '10px',
	BOX_SHADOW: '0 20px 60px rgba(0,0,0,0.3)',
	BORDER_STYLE: 'none',
	PADDING: '0',
	MARGIN: '20px auto',
	// Typography
	FONT_FAMILY: 'system',
	FONT_SIZE: 'medium',
	LINE_HEIGHT: 'normal',
	// Animation
	ENABLE_ANIMATIONS: true,
	ANIMATION_SPEED: 'normal',
};

export const DEFAULT_FEATURES = [
	'markdown',
	'codeHighlight', 
	'copy',
	'timestamps'
];

export const FEATURE_OPTIONS = [
	{
		name: 'Markdown Rendering',
		value: 'markdown',
		description: 'Render Markdown formatting in messages',
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
		name: 'Regenerate',
		value: 'regenerate',
		description: 'Allow regenerating AI responses',
	},
	{
		name: 'File Upload',
		value: 'fileUpload',
		description: 'Enable file attachments',
	},
	{
		name: 'Voice Input',
		value: 'voiceInput',
		description: 'Enable voice message recording',
	},
	{
		name: 'Export Chat',
		value: 'exportChat',
		description: 'Allow downloading conversation',
	},
	{
		name: 'Pin Messages',
		value: 'pinMessages',
		description: 'Allow pinning important messages',
	},
	{
		name: 'Search',
		value: 'search',
		description: 'Search within conversation',
	},
	{
		name: 'Timestamps',
		value: 'timestamps',
		description: 'Show message timestamps',
	},
];

export const THEME_OPTIONS = [
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
];

export const BOX_SHADOW_OPTIONS = [
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
];

export const FONT_FAMILY_OPTIONS = [
	{
		name: 'System Font',
		value: 'system',
	},
	{
		name: 'Sans-serif',
		value: 'sans-serif',
	},
	{
		name: 'Serif',
		value: 'serif',
	},
	{
		name: 'Monospace',
		value: 'monospace',
	},
];

export const FONT_SIZE_OPTIONS = [
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
		value: 'extra-large',
	},
];

export const LINE_HEIGHT_OPTIONS = [
	{
		name: 'Compact',
		value: 'compact',
	},
	{
		name: 'Normal',
		value: 'normal',
	},
	{
		name: 'Relaxed',
		value: 'relaxed',
	},
	{
		name: 'Loose',
		value: 'loose',
	},
];

export const ANIMATION_SPEED_OPTIONS = [
	{
		name: 'Fast',
		value: 'fast',
	},
	{
		name: 'Normal',
		value: 'normal',
	},
	{
		name: 'Slow',
		value: 'slow',
	},
];