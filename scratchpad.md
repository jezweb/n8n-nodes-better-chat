# n8n Better Chat Node - Development Scratchpad

## Project Overview
Creating a sophisticated chat UI node for n8n that provides a rich user interface while respecting n8n's architectural patterns. The node focuses on presentation layer only, letting AI Agent nodes handle memory and logic.

## Current Status
- [x] Project initialized from n8n-nodes-starter
- [x] Documentation structure created (ARCHITECTURE.md, CLAUDE.md, DEPLOYMENT.md, CHANGELOG.md)
- [x] Core node implementation (BetterChatUI.node.ts)
- [x] Basic UI features implemented (properties and schema)
- [x] Comprehensive README documentation
- [x] Git repository initialized and GitHub repo created
- [x] npm published (v0.1.0 - v0.1.3)
- [x] Removed conflicting root index files
- [x] Changed node group to 'trigger'
- [ ] Convert to proper webhook trigger implementation
- [ ] Testing with AI Agent nodes
- [ ] Example workflows

## CRITICAL DISCOVERY: Webhook Trigger Architecture Required

### Problem Analysis (v0.1.0 - v0.1.3)
1. **Node Loading Failure**: "The specified package could not be loaded" error persists
2. **Root Cause**: Our node is labeled as 'trigger' but lacks webhook infrastructure
3. **Missing Components**:
   - No `IWebhookFunctions` interface
   - No `webhooks` array in description
   - No `webhook()` method implementation
   - Has `inputs` which triggers shouldn't have

### Solution: Implement Proper Webhook Trigger

#### Required Changes:
1. **Import Webhook Interfaces**:
   ```typescript
   import {
     IWebhookFunctions,
     IWebhookResponseData,
     // ... existing imports
   } from 'n8n-workflow';
   ```

2. **Remove Inputs, Add Webhooks**:
   ```typescript
   // Remove this:
   inputs: [NodeConnectionType.Main],
   
   // Keep this:
   outputs: [NodeConnectionType.Main],
   
   // Add this:
   webhooks: [{
     name: 'default',
     httpMethod: 'POST',
     responseMode: 'onReceived',
     path: '={{$parameter["webhookPath"]}}',
   }],
   ```

3. **Implement Webhook Method**:
   ```typescript
   async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
     const body = this.getBodyData();
     const headers = this.getHeaderData();
     const query = this.getQueryData();
     
     // Process incoming chat message
     // Apply our rich features
     // Return formatted response
   }
   ```

4. **Update Properties**:
   - Add webhook path parameter
   - Add response mode options
   - Keep all rich UI features

### Reference Implementation Pattern
Based on analysis of:
- GitHub Trigger node (complex webhook with lifecycle management)
- Simple webhook template from n8n-node-dev
- Chat Trigger node documentation

### Workflow Pattern After Fix:
```
[Better Chat Webhook] → [AI Agent] → [Memory/Tools]
         ↑                    ↓
    Chat Interface      Response Back
```

## Implementation Plan v2

### Phase 1: Webhook Infrastructure (CURRENT)
1. Update imports to include webhook interfaces ✓
2. Remove inputs array (triggers don't have inputs)
3. Add webhooks configuration
4. Implement webhook() method
5. Add webhook path parameter

### Phase 2: Rich Message Processing
1. Process incoming chat messages in webhook
2. Apply markdown formatting flags
3. Handle file uploads
4. Add message metadata

### Phase 3: Response Handling
1. Format responses for chat display
2. Handle streaming if possible
3. Support different response modes

### Phase 4: Testing & Publishing
1. Test build locally
2. Version bump to 0.1.4
3. Publish to npm
4. Test installation on n8n

## Technical Architecture

### Webhook Trigger Structure
```typescript
export class BetterChatUI implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Better Chat UI',
    name: 'betterChatUi',
    icon: 'file:chat.svg',
    group: ['trigger'],
    version: 1,
    description: '...',
    defaults: { name: 'Better Chat UI' },
    inputs: [],  // No inputs for triggers!
    outputs: [NodeConnectionType.Main],
    webhooks: [
      {
        name: 'default',
        httpMethod: 'POST',
        responseMode: 'onReceived',
        path: '={{$parameter["webhookPath"]}}',
      }
    ],
    properties: [
      // Webhook configuration
      // Rich UI features
      // Response options
    ]
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    // Handle incoming webhook
    // Process chat message
    // Return formatted data
  }
}
```

### Data Flow with Webhook
1. External chat interface sends POST to webhook URL
2. Better Chat webhook receives and processes message
3. Applies rich formatting and metadata
4. Outputs to connected AI Agent node
5. AI Agent processes and responds
6. Response flows back through workflow

## Key Differences: Transform vs Trigger

### Transform Node (WRONG for our use case):
- Has inputs and outputs
- Processes data from previous nodes
- Cannot initiate workflows
- No webhook endpoint

### Trigger Node (CORRECT for chat):
- No inputs, only outputs
- Initiates workflows
- Has webhook endpoint
- Can receive external data

## Testing Scenarios
1. Create webhook trigger
2. Test with curl/Postman
3. Connect to AI Agent
4. Verify rich features work
5. Test file uploads
6. Check response handling

## Notes for v0.1.4
- Complete webhook implementation
- Remove any remaining transform node artifacts
- Ensure proper trigger node structure
- Test thoroughly before publishing

## Current Task Breakdown
1. ✅ Analyze webhook implementation requirements
2. ⏳ Update imports and interfaces
3. ⏳ Restructure node with webhooks
4. ⏳ Implement webhook method
5. ⏳ Test and debug
6. ⏳ Update all documentation
7. ⏳ Version bump and publish