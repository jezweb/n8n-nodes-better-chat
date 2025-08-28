# Chat UI Trigger - Example Workflows

## Quick Start with AI Agent

### 1. Basic AI Chat
The simplest setup for AI-powered chat:

```json
{
  "nodes": [
    {
      "name": "Chat UI Trigger",
      "type": "n8n-nodes-better-chat.minimalWebhook",
      "parameters": {
        "webhookPath": "chat-demo",
        "outputFormat": "aiAgent",
        "displayMode": "rich"
      }
    },
    {
      "name": "AI Agent", 
      "type": "@n8n/n8n-nodes-langchain.agent",
      "parameters": {
        "prompt": "{{ $json.chatInput }}"
      }
    }
  ]
}
```

### 2. Testing the Webhook

Send a test message to your webhook:

```bash
curl -X POST "https://your-n8n-instance/webhook/chat-demo" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, how can you help me today?"
  }'
```

### 3. With Conversation Context

Include previous messages for context:

```bash
curl -X POST "https://your-n8n-instance/webhook/chat-demo" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What was my previous question?",
    "session_id": "user-123",
    "messages": [
      {
        "role": "user",
        "content": "What is the weather like?",
        "timestamp": "2025-08-28T10:00:00Z"
      },
      {
        "role": "assistant",
        "content": "I cannot check real-time weather...",
        "timestamp": "2025-08-28T10:00:30Z"
      }
    ]
  }'
```

## Output Format Examples

### AI Agent Compatible Mode (Default)
Simplified output optimized for AI workflows:

```json
{
  "chatInput": "Hello, how can you help me?",
  "sessionId": "session_123",
  "threadId": "thread_456",
  "messages": [
    {
      "role": "user",
      "content": "Hello, how can you help me?",
      "timestamp": "2025-08-28T12:00:00Z"
    }
  ],
  "messageCount": 1,
  "timestamp": "2025-08-28T12:00:00Z"
}
```

### Detailed Mode
Full output with all metadata:

```json
{
  "chatInput": "Hello, how can you help me?",
  "messages": [...],
  "userMessage": "Hello, how can you help me?",
  "sessionId": "session_123",
  "threadId": "thread_456",
  "displayMode": "rich",
  "features": ["markdown", "timestamps"],
  "uiSettings": {
    "theme": "auto",
    "compactMode": false,
    "maxHeight": 600
  },
  "context": {
    "webhook_path": "chat-demo",
    "conversation_length": 1,
    "last_interaction": "2025-08-28T12:00:00Z",
    "user_agent": "Mozilla/5.0...",
    "ip_address": "192.168.1.1"
  },
  "raw": {
    "headers": {...},
    "query": {},
    "body": {...}
  }
}
```

## Integration Patterns

### With Memory (Conversation History)
```
[Chat UI Trigger] → [AI Agent] ← [Window Buffer Memory]
                        ↓
                  [HTTP Response]
```

### With Tools
```
[Chat UI Trigger] → [AI Agent] → [Calculator Tool]
                        ↓      → [Web Search Tool]
                        ↓      → [Database Query]
                  [HTTP Response]
```

### With Custom Processing
```
[Chat UI Trigger] → [Code Node] → [AI Agent]
                         ↓             ↓
                   [Data Validation] [HTTP Response]
```

## Webhook URL Structure

### Test Environment
```
https://n8n.example.com/webhook-test/UUID/your-webhook-path
```

### Production Environment
```
https://n8n.example.com/webhook/UUID/your-webhook-path
```

## Common Use Cases

1. **Customer Support Bot**: Handle support queries with context
2. **Documentation Assistant**: Answer questions about your docs
3. **Code Helper**: Assist with coding questions
4. **Personal Assistant**: Task management and scheduling
5. **Educational Tutor**: Interactive learning experiences

## Troubleshooting

### AI Agent Can't Find chatInput
- Ensure "Output Format" is set to "AI Agent Compatible"
- Reference the field as `{{ $json.chatInput }}`
- Update to v0.1.17 or later

### Webhook Not Receiving Messages
- Check the webhook URL is correct
- Ensure the workflow is active
- Verify POST method with Content-Type: application/json

### Missing Context
- Include previous messages in the `messages` array
- Use consistent `session_id` across conversations
- Thread IDs help organize conversations

## Advanced Configuration

### Custom Features
```javascript
{
  "features": [
    "markdown",      // Markdown rendering
    "timestamps",    // Message timestamps
    "codeHighlight", // Code syntax highlighting
    "copy"          // Copy button for messages
  ]
}
```

### UI Customization
```javascript
{
  "uiSettings": {
    "theme": "dark",        // light, dark, auto
    "compactMode": true,    // Reduced spacing
    "maxHeight": 800       // Container height in pixels
  }
}
```