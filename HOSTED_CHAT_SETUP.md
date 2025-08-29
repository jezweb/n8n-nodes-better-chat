# Hosted Chat Setup Guide

## Quick Setup

To use the Hosted Chat feature with the Better Chat UI node, you need to set up your workflow correctly:

### Workflow Structure
```
[Chat UI Trigger] → [AI Agent] → [Respond to Webhook]
```

## Step-by-Step Setup

### 1. Chat UI Trigger Configuration
- **Chat Access Mode**: Hosted Chat
- **Webhook Path**: Your chosen path (e.g., "chat-demo")
- **Response Mode**: Using Respond to Webhook Node (REQUIRED)
- **Public Available**: Toggle based on testing/production
- **Initial Message**: Customize your welcome message

### 2. AI Agent Configuration
- Connect your preferred AI Agent node (OpenAI, Anthropic, etc.)
- Ensure it outputs to a field (usually `output` or `text`)
- Connect any memory nodes you want to use

### 3. Respond to Webhook Node (REQUIRED)
This is essential for the chat to work properly!

Add a "Respond to Webhook" node at the end and configure:

- **Respond With**: JSON
- **Response Code**: 200
- **Response Body**: Use expression mode and enter one of the following:

For most AI agents (single expression format):
```
={{ {"response": $json.output} }}
```

Or if you just want to return the whole JSON object:
```
={{ $json }}
```

### Common Field Mappings

Depending on your AI Agent, you might need to adjust the field name:

| AI Agent Type | Field Name | Response Body Expression |
|--------------|------------|-------------------------|
| OpenAI Chat Model | output | `={{ {"response": $json.output} }}` |
| Anthropic | text | `={{ {"response": $json.text} }}` |
| Custom Agent | answer | `={{ {"response": $json.answer} }}` |
| AI Agent Node | output | `={{ {"response": $json.output} }}` |

## Troubleshooting

### Chat shows but responses don't appear
- **Issue**: The AI response isn't getting back to the chat interface
- **Solution**: Ensure you have the "Respond to Webhook" node configured correctly

### "Sorry, there was an error processing your message"
- **Issue**: The webhook response format is incorrect
- **Solution**: Check that your Response Body in the Respond to Webhook node matches the field your AI Agent outputs

### Workflow executes but no response
- **Issue**: The workflow might be failing before reaching the Respond to Webhook node
- **Solution**: Check the execution logs and ensure all nodes are executing successfully

## Advanced Configuration

### Custom Response Format
If you need to include additional data in the response:

```
={{ {
  "response": $json.output,
  "metadata": {
    "timestamp": $now.toISO(),
    "tokens": $json.usage?.total_tokens || 0,
    "model": $json.model || "unknown"
  }
} }}
```

### Error Handling
Add an IF node before Respond to Webhook to handle errors:

```
[AI Agent] → [IF: Check for Error] → [Respond to Webhook]
                    ↓
            [Error Response Node]
```

## Testing Your Setup

1. Save and activate your workflow
2. Navigate to your chat URL: `https://your-n8n-instance/webhook/[webhook-id]/[webhook-path]`
3. Send a test message
4. Check the execution log to ensure all nodes execute properly

## Example Workflow JSON

Here's a minimal working example:

```json
{
  "nodes": [
    {
      "name": "Chat UI Trigger",
      "type": "n8n-nodes-better-chat.minimalWebhook",
      "parameters": {
        "chatMode": "hosted",
        "webhookPath": "chat-demo"
      }
    },
    {
      "name": "AI Agent",
      "type": "@n8n/n8n-nodes-langchain.agent",
      "parameters": {
        // Your AI configuration
      }
    },
    {
      "name": "Respond to Webhook",
      "type": "n8n-nodes-base.respondToWebhook",
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ {\"response\": $json.output} }}",
        "responseCode": 200
      }
    }
  ],
  "connections": {
    "Chat UI Trigger": {
      "main": [["AI Agent"]]
    },
    "AI Agent": {
      "main": [["Respond to Webhook"]]
    }
  }
}
```