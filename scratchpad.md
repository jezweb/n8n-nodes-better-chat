# n8n Better Chat Node - Feature Enhancement Scratchpad

## Current Status
- Version: 0.1.17
- Working webhook trigger with AI Agent compatibility
- Basic chat message processing
- Output format options (AI Agent / Detailed)

## Goal
Add n8n Chat Trigger features:
1. Built-in test chat interface
2. Hosted chat URL
3. Authentication options
4. CORS configuration
5. Session management

## Research Findings

### n8n Chat Trigger Features
1. **Chat Access Modes**:
   - Webhook Only (current)
   - Hosted Chat (n8n provides interface)
   - Embedded Chat (@n8n/chat widget)

2. **Key Properties**:
   - `publicAvailable`: Toggle public access
   - `authentication`: None/Basic Auth
   - `allowedOrigins`: CORS configuration
   - `initialMessage`: Welcome message
   - `sessionManagement`: Load previous messages

3. **Response Handling**:
   - Expects `output` or `text` field from AI Agent
   - Supports streaming responses
   - Works with Respond to Chat node

4. **Chat URL Structure**:
   ```
   Test: https://n8n.example.com/chat/[workflow-id]/test
   Production: https://n8n.example.com/chat/[workflow-id]
   ```

## Implementation Plan

### Phase 1: Add Chat Mode Parameter
- [ ] Add `chatMode` parameter: webhook/hosted/embedded
- [ ] Add conditional display for mode-specific options
- [ ] Update description to explain each mode

### Phase 2: Hosted Chat Features
- [ ] Add `publicAvailable` boolean parameter
- [ ] Generate chat URL endpoint
- [ ] Add chat URL to node output
- [ ] Support GET method for chat interface

### Phase 3: Authentication
- [ ] Add `authentication` parameter
- [ ] Implement Basic Auth option
- [ ] Add username/password fields (conditional)

### Phase 4: CORS & Security
- [ ] Add `allowedOrigins` parameter
- [ ] Default to * (all origins)
- [ ] Validate origin headers in webhook

### Phase 5: Enhanced Features
- [ ] Add `initialMessage` for welcome text
- [ ] Add `sessionManagement` options
- [ ] Support for memory node integration

### Phase 6: Response Handling
- [ ] Look for `output` or `text` fields
- [ ] Support streaming if configured
- [ ] Handle Respond to Chat node

## Technical Considerations

### 1. Chat URL Generation
```typescript
// Generate unique chat URL based on workflow ID and instance URL
const workflowId = this.getWorkflow().id;
const instanceUrl = this.getInstanceUrl();
const chatUrl = `${instanceUrl}/chat/${workflowId}`;
```

### 2. Response Mode
- Current: `onReceived` (immediate response)
- Need: Support for `lastNode` (wait for workflow completion)

### 3. HTTP Methods
- Current: POST only
- Need: GET for chat interface, POST for messages

### 4. CORS Headers
```typescript
const allowedOrigins = this.getNodeParameter('allowedOrigins', '*') as string;
// Set response headers for CORS
```

## Testing Plan
1. Test basic webhook mode (current functionality)
2. Test hosted chat URL generation
3. Test authentication modes
4. Test CORS with different origins
5. Test with AI Agent connection
6. Test with Respond to Chat node

## Migration Notes
- Maintain backward compatibility
- Default to webhook mode for existing workflows
- Version bump to 0.2.0 (minor version for new features)

## Code Structure
```
nodes/MinimalWebhook/
  ├── MinimalWebhook.node.ts  # Main implementation
  ├── webhook.svg              # Icon
  └── types.ts                 # Type definitions (new)
```

## Parameter Structure
```typescript
properties: [
  // Existing
  webhookPath,
  outputFormat,
  displayMode,
  features,
  uiSettings,
  
  // New
  chatMode,           // webhook/hosted/embedded
  publicAvailable,    // boolean (for hosted mode)
  authentication: {   // collection
    type,            // none/basic
    username,        // for basic auth
    password,        // for basic auth
  },
  allowedOrigins,    // string (comma-separated)
  initialMessage,    // string (for hosted mode)
  sessionManagement, // options: off/memory
]
```

## Response Format Updates
```typescript
// Add chat URL to output when in hosted mode
if (chatMode === 'hosted') {
  output.chatUrl = generateChatUrl();
}

// Handle AI Agent response format
const agentResponse = input.output || input.text || input.response;
```

## Version History
- 0.1.17: Current version with AI Agent compatibility
- 0.2.0: Add Chat Trigger features (planned)
- 0.2.1: Fixed HTML rendering issue
- 0.2.2: Simplified HTML response handling
- 0.2.3: Added responseMode parameter (current issue)

## Current Issue: Respond to Webhook Not Recognizing Node

### Problem Analysis
1. **Error**: "No Webhook node found in the workflow"
2. **Cause**: The Respond to Webhook node doesn't recognize our Chat UI Trigger as a valid webhook node
3. **Root Issue**: The webhook configuration with expression `'={{$parameter["responseMode"]}}'` isn't evaluated at node registration time

### Solution Approach
1. **Static webhook configuration**: Use a fixed responseMode in webhook definition
2. **Dynamic handling**: Check responseMode parameter in webhook function
3. **Different responses based on mode**:
   - GET requests: Always return immediately (HTML interface)
   - POST requests with responseMode='onReceived': Return workflowData
   - POST requests with responseMode='responseNode': Return workflowData for Respond to Webhook

### Implementation Plan
1. Change webhook responseMode from expression to static value 'responseNode'
2. In webhook function, check the actual parameter value
3. Handle response accordingly:
   ```typescript
   const responseMode = this.getNodeParameter('responseMode', 'onReceived') as string;
   
   // For GET requests (HTML interface), always respond immediately
   if (method === 'GET' && chatMode === 'hosted') {
     return { webhookResponse: chatHtml };
   }
   
   // For POST requests, check responseMode
   if (responseMode === 'onReceived') {
     // Return immediately with workflowData
     return {
       webhookResponse: {
         status: 200,
         body: output
       }
     };
   } else {
     // responseMode === 'responseNode'
     // Return workflowData for Respond to Webhook to handle
     return {
       workflowData: [this.helpers.returnJsonArray([output])]
     };
   }
   ```

## Next Steps
1. Fix webhook responseMode configuration
2. Test with Respond to Webhook node
3. Update documentation
4. Git commit after successful fix