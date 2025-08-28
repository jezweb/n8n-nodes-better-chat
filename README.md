# n8n Better Chat UI Node

A sophisticated chat UI node for n8n workflows that provides rich text rendering, file handling, and advanced conversation features while respecting n8n's architectural patterns.

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

### 🤖 AI Integration
- **Works with Any AI Agent** - Compatible with all n8n AI nodes
- **System Prompt Override** - Customize AI behavior on the fly
- **Context Management** - Intelligent message history handling
- **Tool Compatible** - Can be used as a tool by AI Agents

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
npm install n8n-nodes-better-chat
n8n start
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

1. **Add the Node**: Drag the "Better Chat UI" node from the nodes panel
2. **Configure Display Mode**:
   - `Simple`: Basic chat interface
   - `Rich`: Markdown and code highlighting enabled
   - `Advanced`: All features including threading and folders

3. **Connect to AI Agent**: Link the output to an AI Agent node

### Example Workflows

#### Simple Chat with OpenAI
```
[Better Chat UI] → [OpenAI Chat Model] → [Response]
```

#### Chat with Memory
```
[Better Chat UI] → [AI Agent] ← [Window Buffer Memory]
        ↑              ↓
        └──────────────┘
```

#### Advanced Setup with Tools
```
[Webhook Trigger] → [Better Chat UI] → [AI Agent] → [Tool Nodes]
                            ↑              ↓            ↓
                            └──────────────┴────────────┘
```

## Configuration Options

### Display Modes
- **Simple**: Clean, minimal interface for basic conversations
- **Rich**: Enhanced with Markdown and code highlighting
- **Advanced**: Full-featured with threading, folders, and search

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
| displayMode | options | Interface complexity level | rich |
| features | multiOptions | Enabled features | markdown, codeHighlight, copy, timestamps |
| message | string | User message input | - |
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