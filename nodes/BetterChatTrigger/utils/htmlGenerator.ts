/**
 * HTML template generation for Better Chat Trigger hosted interface
 */

import { ChatConfig } from '../types/interfaces';

/**
 * Generate the complete HTML for the hosted chat interface
 */
export function generateChatHTML(config: ChatConfig): string {
	const {
		theme,
		fontSize,
		width,
		maxWidth,
		minWidth,
		height,
		maxHeight,
		borderRadius,
		boxShadow,
		borderStyle,
		padding,
		margin,
		fontFamily,
		lineHeight,
		compactMode,
		features,
		primaryColor,
		backgroundColor,
		containerBackground,
		userMessageColor,
		assistantMessageColor,
		textColor,
		enableAnimations,
		animationSpeed,
	} = config;

	// Generate CSS variables
	const cssVariables = `
		:root {
			--primary-color: ${primaryColor || '#667eea'};
			--primary-gradient: linear-gradient(135deg, ${primaryColor || '#667eea'} 0%, ${primaryColor || '#764ba2'} 100%);
			--bg-color: ${backgroundColor || (theme === 'dark' ? '#1a1a1a' : '#f5f5f5')};
			--container-bg: ${containerBackground || (theme === 'dark' ? '#2d2d2d' : 'white')};
			--text-color: ${textColor || (theme === 'dark' ? '#e0e0e0' : '#333')};
			--user-msg-bg: ${userMessageColor || (theme === 'dark' ? '#4a5568' : '#e3f2fd')};
			--assistant-msg-bg: ${assistantMessageColor || (theme === 'dark' ? '#553c69' : '#f3e5f5')};
			--border-color: ${theme === 'dark' ? '#444' : '#e0e0e0'};
			--font-size-base: ${getFontSize(fontSize)};
			--line-height: ${getLineHeight(lineHeight)};
			--font-family: ${getFontFamily(fontFamily)};
		}`;

	const animationCSS = enableAnimations ? getAnimationCSS(animationSpeed) : '';
	
	return `<!DOCTYPE html>
<html>
<head>
	<title>Better Chat Interface</title>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" rel="stylesheet" />
	<style>
		${cssVariables}
		
		body { 
			font-family: var(--font-family);
			margin: 0; 
			padding: 20px;
			background: var(--bg-color);
			height: 100vh;
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: var(--font-size-base);
			line-height: var(--line-height);
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
			overflow: hidden;
			color: var(--text-color);
		}
		
		${getMessagesCSS(compactMode)}
		${getInputCSS()}
		${getButtonCSS()}
		${getFileUploadCSS(features.includes('fileUpload'))}
		${getMessageActionsCSS(features)}
		${getMarkdownCSS(features.includes('markdown'))}
		${getCodeHighlightCSS(features.includes('codeHighlight'), config.theme)}
		${getTimestampsCSS(features.includes('timestamps'))}
		${animationCSS}
		${getResponsiveCSS()}
	</style>
</head>
<body>
	<div class="chat-container">
		<div id="messages" class="messages"></div>
		<div class="input-container">
			${generateFileUploadHTML(features.includes('fileUpload'), config.allowedFilesMimeTypes || '*')}
			<input 
				type="text" 
				id="messageInput" 
				placeholder="Type your message..." 
				class="message-input"
				onkeypress="if(event.key==='Enter') sendMessage()"
			/>
			<button onclick="sendMessage()" class="send-button">Send</button>
		</div>
	</div>
	
	${generateScriptIncludes(features)}
	<script>
		${generateJavaScript(config)}
	</script>
</body>
</html>`;
}

function getFontSize(fontSize: string): string {
	switch (fontSize) {
		case 'small': return '12px';
		case 'medium': return '14px';
		case 'large': return '16px';
		case 'extra-large': return '18px';
		default: return '14px';
	}
}

function getLineHeight(lineHeight: string): string {
	switch (lineHeight) {
		case 'compact': return '1.2';
		case 'normal': return '1.5';
		case 'relaxed': return '1.6';
		case 'loose': return '1.8';
		default: return '1.5';
	}
}

function getFontFamily(fontFamily: string): string {
	switch (fontFamily) {
		case 'system': return '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
		case 'sans-serif': return 'Arial, Helvetica, sans-serif';
		case 'serif': return 'Georgia, "Times New Roman", serif';
		case 'monospace': return '"Courier New", Consolas, monospace';
		default: return '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
	}
}

function getAnimationCSS(speed: string): string {
	const duration = speed === 'fast' ? '0.15s' : speed === 'slow' ? '0.5s' : '0.3s';
	
	return `
		.message {
			animation: fadeIn ${duration} ease-out;
		}
		
		.send-button:hover {
			transform: scale(1.05);
			transition: transform ${duration} ease;
		}
		
		.copy-btn:hover, .file-btn:hover {
			transform: scale(1.1);
			transition: transform ${duration} ease;
		}
		
		@keyframes fadeIn {
			from { opacity: 0; transform: translateY(10px); }
			to { opacity: 1; transform: translateY(0); }
		}
	`;
}

function getMessagesCSS(compactMode: boolean): string {
	const messageSpacing = compactMode ? '8px' : '16px';
	
	return `
		.messages {
			flex: 1;
			overflow-y: auto;
			padding: 20px;
			display: flex;
			flex-direction: column;
			gap: ${messageSpacing};
		}
		
		.message {
			padding: ${compactMode ? '8px 12px' : '12px 16px'};
			border-radius: 12px;
			margin-bottom: ${messageSpacing};
			word-wrap: break-word;
			position: relative;
		}
		
		.message.user {
			background: var(--user-msg-bg);
			align-self: flex-end;
			max-width: 80%;
		}
		
		.message.assistant {
			background: var(--assistant-msg-bg);
			align-self: flex-start;
			max-width: 85%;
		}
		
		.message.system {
			background: var(--border-color);
			align-self: center;
			font-style: italic;
			opacity: 0.8;
			max-width: 90%;
		}
	`;
}

function getInputCSS(): string {
	return `
		.input-container {
			display: flex;
			padding: 20px;
			gap: 12px;
			border-top: 1px solid var(--border-color);
			align-items: flex-end;
		}
		
		.message-input {
			flex: 1;
			padding: 12px 16px;
			border: 2px solid var(--border-color);
			border-radius: 25px;
			font-size: var(--font-size-base);
			background: var(--container-bg);
			color: var(--text-color);
			resize: none;
			min-height: 20px;
			max-height: 120px;
		}
		
		.message-input:focus {
			outline: none;
			border-color: var(--primary-color);
		}
	`;
}

function getButtonCSS(): string {
	return `
		.send-button {
			background: var(--primary-gradient);
			color: white;
			border: none;
			border-radius: 50%;
			width: 48px;
			height: 48px;
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
			font-weight: 600;
			transition: all 0.3s ease;
		}
		
		.send-button:hover {
			transform: scale(1.05);
			box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
		}
		
		.send-button:disabled {
			opacity: 0.5;
			cursor: not-allowed;
			transform: none;
		}
	`;
}

function getFileUploadCSS(enabled: boolean): string {
	if (!enabled) return '';
	
	return `
		.file-upload-container {
			position: relative;
			display: flex;
			align-items: center;
		}
		
		.file-upload-input {
			display: none;
		}
		
		.file-upload-button {
			background: none;
			border: none;
			cursor: pointer;
			padding: 8px;
			border-radius: 50%;
			transition: background-color 0.2s ease;
			color: var(--text-color);
		}
		
		.file-upload-button:hover {
			background-color: var(--border-color);
		}
		
		.file-indicator {
			position: absolute;
			top: -8px;
			right: -8px;
			background: var(--primary-color);
			color: white;
			border-radius: 50%;
			width: 20px;
			height: 20px;
			display: none;
			align-items: center;
			justify-content: center;
			font-size: 12px;
			font-weight: bold;
		}
		
		.file-indicator.show {
			display: flex;
		}
	`;
}

function getMessageActionsCSS(features: string[]): string {
	if (!features.some(f => ['copy', 'regenerate', 'pinMessages'].includes(f))) {
		return '';
	}
	
	return `
		.message-actions {
			position: absolute;
			top: 8px;
			right: 8px;
			display: none;
			gap: 4px;
		}
		
		.message:hover .message-actions {
			display: flex;
		}
		
		.action-btn {
			background: rgba(0, 0, 0, 0.1);
			border: none;
			border-radius: 4px;
			padding: 4px 8px;
			cursor: pointer;
			font-size: 12px;
			color: var(--text-color);
			transition: background-color 0.2s ease;
		}
		
		.action-btn:hover {
			background: rgba(0, 0, 0, 0.2);
		}
	`;
}

function getMarkdownCSS(enabled: boolean): string {
	if (!enabled) return '';
	
	return `
		.markdown h1, .markdown h2, .markdown h3 {
			margin: 0.5em 0;
		}
		
		.markdown p {
			margin: 0.5em 0;
		}
		
		.markdown ul, .markdown ol {
			padding-left: 1.5em;
		}
		
		.markdown blockquote {
			border-left: 4px solid var(--primary-color);
			padding-left: 1em;
			margin: 1em 0;
			opacity: 0.8;
		}
	`;
}

function getCodeHighlightCSS(enabled: boolean, theme: string = 'light'): string {
	if (!enabled) return '';
	
	return `
		.markdown pre {
			background: ${theme === 'dark' ? '#1e1e1e' : '#f8f8f8'};
			padding: 1em;
			border-radius: 8px;
			overflow-x: auto;
			margin: 1em 0;
		}
		
		.markdown code {
			background: ${theme === 'dark' ? '#2d2d2d' : '#f0f0f0'};
			padding: 2px 4px;
			border-radius: 4px;
			font-family: 'Courier New', monospace;
		}
		
		.markdown pre code {
			background: none;
			padding: 0;
		}
	`;
}

function getTimestampsCSS(enabled: boolean): string {
	if (!enabled) return '';
	
	return `
		.message-timestamp {
			font-size: 11px;
			opacity: 0.6;
			margin-top: 4px;
		}
	`;
}

function getResponsiveCSS(): string {
	return `
		@media (max-width: 768px) {
			body {
				padding: 0;
			}
			
			.chat-container {
				width: 100%;
				height: 100vh;
				border-radius: 0;
				margin: 0;
			}
			
			.messages {
				padding: 16px;
			}
			
			.input-container {
				padding: 16px;
			}
		}
	`;
}

function generateFileUploadHTML(enabled: boolean, allowedMimeTypes: string): string {
	if (!enabled) return '';
	
	return `
		<div class="file-upload-container">
			<input 
				type="file" 
				id="fileInput" 
				class="file-upload-input"
				accept="${allowedMimeTypes || '*'}"
				onchange="handleFileSelect(event)"
			/>
			<button 
				type="button" 
				class="file-upload-button" 
				onclick="document.getElementById('fileInput').click()"
				title="Attach file"
			>
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 1.2em; height: 1.2em;">
					<path d="M19.8278 11.2437L12.7074 18.3641C10.7548 20.3167 7.58896 20.3167 5.63634 18.3641C3.68372 16.4114 3.68372 13.2456 5.63634 11.293L12.4717 4.45763C13.7735 3.15589 15.884 3.15589 17.1858 4.45763C18.4875 5.75938 18.4875 7.86993 17.1858 9.17168L10.3614 15.9961C9.71048 16.647 8.6552 16.647 8.00433 15.9961C7.35345 15.3452 7.35345 14.2899 8.00433 13.6391L14.2258 7.41762" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</button>
			<div id="fileIndicator" class="file-indicator"></div>
		</div>
	`;
}

function generateScriptIncludes(features: string[]): string {
	let scripts = '';
	
	if (features.includes('markdown')) {
		scripts += '<script src="https://cdnjs.cloudflare.com/ajax/libs/marked/4.3.0/marked.min.js"></script>';
	}
	
	if (features.includes('codeHighlight')) {
		scripts += '<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js"></script>';
		scripts += '<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>';
	}
	
	return scripts;
}

function generateJavaScript(config: ChatConfig): string {
	return `
		const chatConfig = ${JSON.stringify({
			features: config.features,
			displayMode: config.displayMode,
			theme: config.theme,
			enableAnimations: config.enableAnimations,
		})};
		
		let selectedFiles = [];
		
		// Initialize chat
		document.addEventListener('DOMContentLoaded', function() {
			addMessage('system', '${config.initialMessage}');
			document.getElementById('messageInput').focus();
		});
		
		function addMessage(role, content, timestamp) {
			const messagesDiv = document.getElementById('messages');
			const messageDiv = document.createElement('div');
			messageDiv.className = 'message ' + role;
			
			let messageHTML = '';
			
			// Process content based on features
			if (chatConfig.features.includes('markdown') && typeof marked !== 'undefined') {
				messageHTML = marked.parse(content);
				messageDiv.innerHTML = '<div class="markdown">' + messageHTML + '</div>';
			} else {
				messageDiv.textContent = content;
			}
			
			// Add timestamp if enabled
			if (chatConfig.features.includes('timestamps') && timestamp) {
				const timestampDiv = document.createElement('div');
				timestampDiv.className = 'message-timestamp';
				timestampDiv.textContent = new Date(timestamp).toLocaleTimeString();
				messageDiv.appendChild(timestampDiv);
			}
			
			// Add message actions if enabled
			if (chatConfig.features.some(f => ['copy', 'regenerate', 'pinMessages'].includes(f))) {
				const actionsDiv = document.createElement('div');
				actionsDiv.className = 'message-actions';
				
				if (chatConfig.features.includes('copy')) {
					const copyBtn = document.createElement('button');
					copyBtn.className = 'action-btn copy-btn';
					copyBtn.textContent = '📋';
					copyBtn.onclick = () => copyMessage(content);
					actionsDiv.appendChild(copyBtn);
				}
				
				messageDiv.appendChild(actionsDiv);
			}
			
			messagesDiv.appendChild(messageDiv);
			messagesDiv.scrollTop = messagesDiv.scrollHeight;
			
			// Trigger syntax highlighting if enabled
			if (chatConfig.features.includes('codeHighlight') && typeof Prism !== 'undefined') {
				Prism.highlightAllUnder(messageDiv);
			}
		}
		
		async function sendMessage() {
			const input = document.getElementById('messageInput');
			const message = input.value.trim();
			
			if (!message && selectedFiles.length === 0) return;
			
			// Disable send button
			const sendButton = document.querySelector('.send-button');
			sendButton.disabled = true;
			sendButton.textContent = '...';
			
			// Add user message to chat
			if (message) {
				addMessage('user', message, new Date().toISOString());
			}
			
			// Add file indicator if files selected
			if (selectedFiles.length > 0) {
				addMessage('system', \`📎 \${selectedFiles.length} file(s) attached\`, new Date().toISOString());
			}
			
			// Clear input and files
			input.value = '';
			clearFiles();
			
			try {
				// Prepare request data
				const requestData = {
					message: message,
					files: selectedFiles.map(file => ({
						name: file.name,
						type: file.type,
						size: file.size,
						data: file.data
					}))
				};
				
				// Send to webhook
				const response = await fetch(window.location.href, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(requestData)
				});
				
				if (response.ok) {
					const result = await response.text();
					addMessage('assistant', result, new Date().toISOString());
				} else {
					addMessage('system', 'Error: Failed to send message', new Date().toISOString());
				}
			} catch (error) {
				console.error('Error sending message:', error);
				addMessage('system', 'Error: Connection failed', new Date().toISOString());
			} finally {
				// Re-enable send button
				sendButton.disabled = false;
				sendButton.textContent = 'Send';
				input.focus();
			}
		}
		
		function copyMessage(content) {
			navigator.clipboard.writeText(content).then(() => {
				// Show feedback
				console.log('Message copied to clipboard');
			}).catch(err => {
				console.error('Failed to copy message:', err);
			});
		}
		
		function handleFileSelect(event) {
			const files = Array.from(event.target.files);
			
			files.forEach(file => {
				const reader = new FileReader();
				reader.onload = (e) => {
					const dataUrl = e.target.result;
					const base64 = dataUrl.split(',')[1]; // Extract pure base64
					
					selectedFiles.push({
						name: file.name,
						type: file.type,
						size: file.size,
						data: base64
					});
					
					updateFileIndicator();
				};
				reader.readAsDataURL(file);
			});
		}
		
		function updateFileIndicator() {
			const indicator = document.getElementById('fileIndicator');
			if (selectedFiles.length > 0) {
				indicator.textContent = selectedFiles.length;
				indicator.classList.add('show');
				indicator.title = selectedFiles.map(f => f.name).join(', ');
			} else {
				indicator.classList.remove('show');
			}
		}
		
		function clearFiles() {
			selectedFiles = [];
			updateFileIndicator();
			document.getElementById('fileInput').value = '';
		}
		
		// Auto-resize input
		document.getElementById('messageInput').addEventListener('input', function() {
			this.style.height = 'auto';
			this.style.height = Math.min(this.scrollHeight, 120) + 'px';
		});
	`;
}