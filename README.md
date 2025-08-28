# n8n Better Chat UI Node

[![npm version](https://badge.fury.io/js/n8n-nodes-better-chat.svg)](https://www.npmjs.com/package/n8n-nodes-better-chat)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A powerful webhook-based chat trigger node for n8n workflows with native AI Agent support. This node receives chat messages via webhook and provides seamless integration with n8n's AI Agent nodes while supporting rich text rendering, conversation threading, and advanced UI features.

## Features

### 🎨 Rich User Interface
- **Markdown Rendering** - Full Markdown support for formatted messages
- **Code Highlighting** - Syntax highlighting for multiple programming languages
- **Theme Support** - Light, dark, and auto themes
- **Responsive Design** - Adapts to different screen sizes

### 💬 Advanced Chat Features
- **Conversation Threading** - Organize chats into threads
- **Folder Organization** - Categorize conversations visually
- **Message Actions** - Copy, regenerate, pin important messages
- **File Uploads** - Handle documents, images, and other files
- **Voice Input** - Support for voice messages (when enabled)
- **Search** - Find messages within conversations
- **Export** - Download conversations in JSON, Markdown, or HTML

### 🤖 AI Agent Integration (New in v0.1.17!)
- **Native AI Agent Support** - Direct `chatInput` field for seamless integration
- **Output Format Options** - Choose between AI-optimized or detailed output
- **Works with Any AI Agent** - Compatible with all n8n AI nodes
- **System Prompt Override** - Customize AI behavior on the fly
- **Context Management** - Intelligent message history handling
- **Tool Compatible** - Can be used as a tool by AI Agents
- **Session & Thread Tracking** - Automatic conversation management

### 🏗️ Architecture
- **Separation of Concerns** - UI only, no state management
- **n8n Native** - Follows established n8n patterns
- **No External Dependencies** - Self-contained node
- **Performance Optimized** - Efficient rendering and data handling

## Installation

### Via n8n UI (Recommended)
1. Navigate to **Settings** → **Community Nodes**
2. Search for `n8n-nodes-better-chat`
3. Click **Install**
4. Restart n8n if prompted

### Via Command Line
```bash
cd /path/to/n8n
npm install n8n-nodes-better-chat@latest
n8n start
```

### Update to Latest Version
```bash
npm update n8n-nodes-better-chat
# or specific version
npm install n8n-nodes-better-chat@0.1.17
```

### From Source (Development)
```bash
git clone https://github.com/jezweb/n8n-nodes-better-chat.git
cd n8n-nodes-better-chat
npm install
npm run build
npm link
cd ~/.n8n/custom
npm link n8n-nodes-better-chat
n8n start
```

## Usage

### Basic Setup

1. **Add the Node**: Drag the "Chat UI Trigger" node from the trigger nodes panel
2. **Configure Webhook Path**: Set the path for receiving chat messages (default: `webhook`)
3. **Choose Output Format** (v0.1.17+):
   - `AI Agent Compatible`: Optimized for AI Agent nodes (default)
   - `Detailed`: Full output with all metadata
4. **Configure Display Mode**:
   - `Simple`: Basic chat interface
   - `Rich`: Markdown and code highlighting enabled (default)
5. **Connect to AI Agent**: Link the output to an AI Agent node
6. **Get Webhook URL**: Click "Webhook URLs" to reveal Test and Production URLs

### Example Workflows

#### Simple Chat with AI Agent (v0.1.17+)
```
[Chat UI Trigger] → [AI Agent] → [Respond to Webhook]
     ↓                   ↑
  chatInput         {{ $json.chatInput }}
```

#### Chat with Memory
```
[Chat UI Trigger] → [AI Agent] ← [Window Buffer Memory]
                        ↓
                  [Respond to Webhook]
```

#### Advanced Setup with Tools
```
[Chat UI Trigger] → [AI Agent] → [Tool Nodes]
                        ↓            ↓
                  [Respond to Webhook]
```

## Configuration Options

### Output Format (v0.1.17+)
- **AI Agent Compatible** (default): Simplified output with `chatInput` field for AI Agent nodes
  ```json
  {
    "chatInput": "user message",
    "sessionId": "session_123",
    "threadId": "thread_456",
    "messages": [...],
    "messageCount": 2,
    "timestamp": "2025-08-28T12:00:00Z"
  }
  ```
- **Detailed**: Full output with all metadata, context, and raw webhook data

### Display Modes
- **Simple**: Clean, minimal interface for basic conversations
- **Rich** (default): Enhanced with Markdown and code highlighting

### Features (Multi-select)
- `Markdown Rendering` - Format text with Markdown
- `Code Highlighting` - Syntax highlighting for code blocks
- `Copy Button` - Easy message copying
- `Regenerate` - Allow AI response regeneration
- `File Upload` - Enable file attachments
- `Voice Input` - Voice message support
- `Export Chat` - Download conversations
- `Pin Messages` - Mark important messages
- `Search` - Search within conversation
- `Timestamps` - Show message timestamps

### UI Settings
- **Theme**: Light, Dark, or Auto
- **Font Size**: Small, Medium, or Large
- **Max Height**: Container height in pixels
- **Show Avatars**: Display user/assistant avatars
- **Compact Mode**: Reduced message spacing

### File Settings
- **Allowed Types**: Comma-separated extensions (e.g., `.pdf,.txt,.png`)
- **Max File Size**: Maximum size in MB
- **Storage Mode**: Base64 (small files) or URL reference

## Node Properties

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| webhookPath | string | Path for webhook endpoint | webhook |
| outputFormat | options | Output structure (aiAgent/detailed) | aiAgent |
| displayMode | options | Interface complexity level | rich |
| features | multiOptions | Enabled features | markdown, timestamps |
| systemPrompt | string | Override AI system prompt | - |
| threadOptions | collection | Thread management settings | - |
| uiSettings | collection | Interface customization | - |
| fileSettings | collection | File handling configuration | - |
| exportSettings | collection | Export format options | - |

## Output Format

The node outputs a structured object that AI Agents can process:

```javascript
{
  messages: [
    {
      role: 'user' | 'assistant' | 'system',
      content: string,
      timestamp: string,
      metadata: {
        thread_id: string,
        folder: string,
        pinned: boolean,
        files: Array
      }
    }
  ],
  action: 'send' | 'regenerate' | 'export',
  displayMode: string,
  features: Array,
  uiState: Object,
  context: {
    thread_id: string,
    session_id: string,
    folder: string
  }
}
```

## Webhook Integration

### Sending Messages to the Webhook

The node expects a POST request with the following structure:

```javascript
// Basic message
{
  "message": "Hello, how can you help me?",
  "thread_id": "optional-thread-id",
  "session_id": "optional-session-id"
}

// With previous messages
{
  "message": "What about this?",
  "messages": [
    { "role": "user", "content": "Previous question" },
    { "role": "assistant", "content": "Previous answer" }
  ]
}

// With files
{
  "message": "Check this document",
  "files": [
    { "name": "document.pdf", "type": "application/pdf", "data": "base64..." }
  ]
}
```

### Webhook URLs

n8n provides two webhook URLs:
- **Test URL**: Use while building workflows (includes test listener)
- **Production URL**: Use when workflow is active

### Example curl Request

```bash
curl -X POST https://your-n8n.com/webhook/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello from curl!"}'
```

## Best Practices

### Memory Management
- The node doesn't store conversations - use Memory nodes for persistence
- Configure `maxMessages` in thread options to limit context size
- Use pinned messages for important context that should always be included

### Performance
- Enable only the features you need
- Set reasonable file size limits
- Use URL storage mode for large files

### Integration
- Always connect to an AI Agent node for logic
- Use Memory nodes for conversation persistence
- Add Tool nodes for extended functionality

## Troubleshooting

### Node Not Appearing
- Ensure community nodes are enabled: `N8N_COMMUNITY_PACKAGES_ENABLED=true`
- Check n8n logs for installation errors
- Verify the package is installed: `npm list n8n-nodes-better-chat`

### Build Errors (Development)
```bash
rm -rf node_modules dist
npm install
npm run build
```

### File Upload Issues
- Check allowed file types in settings
- Verify file size limits
- Ensure proper storage mode for your use case

## Examples

### Customer Service Bot
```javascript
// Connect: Webhook → Better Chat UI → AI Agent → CRM Tool
{
  displayMode: 'rich',
  features: ['markdown', 'files', 'export'],
  systemPrompt: 'You are a helpful customer service agent...'
}
```

### Technical Assistant
```javascript
// Connect: Better Chat UI → AI Agent → Code Execution Tool
{
  displayMode: 'advanced',
  features: ['codeHighlight', 'copy', 'search'],
  systemPrompt: 'You are a technical assistant specializing in...'
}
```

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

- **Issues**: [GitHub Issues](https://github.com/jezweb/n8n-nodes-better-chat/issues)
- **Discussions**: [GitHub Discussions](https://github.com/jezweb/n8n-nodes-better-chat/discussions)
- **Documentation**: See [ARCHITECTURE.md](ARCHITECTURE.md) for technical details

## License

MIT - See [LICENSE.md](LICENSE.md) for details

## Author

Jeremy Dawes - [Jezweb](https://www.jezweb.com.au)

## Acknowledgments

- n8n team for the excellent workflow automation platform
- The n8n community for inspiration and feedback

---

Made with ❤️ for the n8n community