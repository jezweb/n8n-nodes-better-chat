# n8n Better Chat Node - AI Assistant Instructions

## Project Context
This is the n8n Better Chat Node - a sophisticated chat UI node for n8n workflows that provides rich text rendering, file handling, and advanced conversation features while respecting n8n's architectural patterns.

## Version 0.3.0 - Major Update
The project now includes two nodes:
1. **BetterChatTrigger** - NEW node that is fully compatible with n8n's Respond to Webhook node
2. **MinimalWebhook** - Legacy node for backward compatibility

The BetterChatTrigger follows the official n8n Chat Trigger pattern exactly while preserving all our custom UI enhancements.

## Key Design Principles
1. **Separation of Concerns**: This node handles ONLY the presentation layer. AI logic and memory management are handled by other specialized nodes.
2. **No State Management**: The node does not persist any data. It formats and passes data between the user and AI Agent nodes.
3. **n8n Patterns**: Follow established n8n patterns for node development, including proper TypeScript typing, error handling, and documentation.

## Development Guidelines

### Code Style
- Use TypeScript with strict typing
- Follow n8n's ESLint configuration
- Use descriptive variable names
- Add JSDoc comments for all public methods
- Keep functions small and focused

### Node Properties
- All properties should have clear descriptions for AI agents
- Use `displayOptions` for conditional property visibility
- Set `noDataExpression: true` for properties that shouldn't accept expressions
- Include helpful placeholder text

### Error Handling
- Use try-catch blocks for all async operations
- Provide helpful error messages to users
- Use `this.continueOnFail()` to allow workflows to continue on errors
- Log errors appropriately for debugging

### Testing Requirements
- Test with multiple AI Agent configurations
- Verify file upload handling with various file types
- Test with long conversations (100+ messages)
- Ensure proper sanitization of user input
- Test export functionality with different formats

## Important Files

### Core Implementation (v0.3.0+)
- `nodes/BetterChatTrigger/BetterChatTrigger.node.ts` - NEW Respond to Webhook compatible node
- `nodes/BetterChatTrigger/betterChatTrigger.svg` - BetterChatTrigger icon
- `nodes/MinimalWebhook/MinimalWebhook.node.ts` - Legacy node (backward compatibility)
- `nodes/MinimalWebhook/webhook.svg` - MinimalWebhook icon

### Documentation
- `README.md` - User-facing documentation with migration guide
- `ARCHITECTURE.md` - Technical architecture details (updated for v0.3.0)
- `CHANGELOG.md` - Version history
- `DEPLOYMENT.md` - Deployment and migration instructions
- `scratchpad.md` - Development notes and planning

## Common Tasks

### Adding a New Feature
1. Update the node properties in `BetterChatUI.node.ts`
2. Implement the feature logic
3. Update types and interfaces
4. Add tests
5. Update documentation
6. Add to CHANGELOG.md

### Testing Locally
```bash
npm run build
npm link
cd ~/.n8n/custom
npm link n8n-nodes-better-chat
# Restart n8n
```

### Publishing Updates
```bash
npm version patch/minor/major
npm run build
npm publish
git push --tags
```

## Integration Patterns

### Simple Chat with Respond to Webhook (v0.3.0+)
```
[Better Chat Trigger] → [AI Agent] → [Respond to Webhook]
```

### Chat with Memory
```
[Better Chat Trigger] → [AI Agent] ← [Memory Node]
                              ↓
                    [Respond to Webhook]
```

### Chat with Tools
```
[Better Chat Trigger] → [AI Agent] → [Tool Nodes]
                              ↓
                    [Respond to Webhook]
```

## Current Focus Areas
1. Rich text rendering (Markdown, code highlighting)
2. File upload handling
3. Message actions (copy, regenerate, pin)
4. Export functionality
5. Conversation threading

## Known Limitations
- No built-in persistence (by design)
- Relies on AI Agent for logic
- File size limits for base64 encoding
- BetterChatTrigger requires n8n version that supports dynamic webhook response modes

## Future Enhancements
- Streaming response support
- Voice input/output
- WebSocket support for real-time updates
- Plugin architecture for custom renderers

## Helpful Context for AI Assistants
- This node is part of the n8n ecosystem and must follow n8n's patterns
- The node should be usable as a tool by AI agents (set `usableAsTool: true`)
- All descriptions should be clear and helpful for both humans and AI agents
- The node should work with any AI Agent setup, not just specific ones
- Performance is important - avoid unnecessary re-renders and computations
- BetterChatTrigger follows the official n8n Chat Trigger pattern for compatibility
- When working on this project, understand the difference between the two nodes:
  - BetterChatTrigger: NEW, Respond to Webhook compatible, recommended for new workflows
  - MinimalWebhook: Legacy, kept for backward compatibility