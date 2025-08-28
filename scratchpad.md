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
- [ ] Advanced UI features (actual rendering logic)
- [ ] Testing with AI Agent nodes
- [ ] Example workflows
- [ ] npm publishing

## Design Decisions

### 1. Separation of Concerns
- **Better Chat UI Node**: Handles ONLY presentation and user interaction
- **AI Agent**: Handles AI logic and memory management
- **Memory Nodes**: Handle conversation persistence (existing n8n pattern)

### 2. Core Features to Implement
- Rich text display (Markdown, code highlighting)
- Conversation threading
- File upload handling
- Message actions (copy, regenerate, pin)
- Export functionality
- Search within conversation
- Folder organization (visual only, not persistence)

### 3. Data Flow
```
User Input → [Better Chat UI] → Format Message → [AI Agent]
                    ↑                                 ↓
            Format Response ← ← ← ← ← ← ← ← ← AI Response
```

## Technical Notes

### Node Properties Structure
```typescript
{
  displayMode: 'simple' | 'rich' | 'advanced',
  features: ['markdown', 'codeHighlight', 'copy', 'regenerate', 'files', 'voice', 'export', 'pin'],
  uiSettings: {
    theme: 'light' | 'dark' | 'auto',
    fontSize: 'small' | 'medium' | 'large',
    maxHeight: number,
    showTimestamps: boolean
  }
}
```

### Output Schema
```typescript
{
  messages: [
    {
      role: 'user' | 'assistant',
      content: string,
      timestamp: Date,
      metadata: {
        thread_id?: string,
        folder?: string,
        pinned?: boolean,
        files?: Array<{url: string, name: string, type: string}>
      }
    }
  ],
  action?: 'send' | 'regenerate' | 'export',
  context?: {
    thread_id: string,
    session_id: string,
    user_preferences: object
  }
}
```

## Implementation Plan

### Phase 1: Core Structure (Current)
1. Set up project from n8n-nodes-starter
2. Create documentation framework
3. Define node properties and schema

### Phase 2: Basic Chat UI
1. Implement simple message display
2. Add input handling
3. Create output formatting

### Phase 3: Rich Features
1. Add Markdown rendering
2. Implement code highlighting
3. Add copy/regenerate buttons
4. File upload handling

### Phase 4: Advanced Features
1. Threading support
2. Search functionality
3. Export capabilities
4. Pinning messages

### Phase 5: Polish & Publish
1. Testing with various AI Agent setups
2. Example workflows
3. Documentation
4. npm publishing

## Questions to Address
1. How to handle file uploads without persistence? (Base64 encoding vs URLs)
2. Should we include a webhook trigger variant?
3. How to handle streaming responses from AI?
4. Should we support custom CSS injection?

## Dependencies to Consider
- marked (Markdown parsing)
- prismjs or highlight.js (code highlighting)
- sanitize-html (security)
- file-type (file validation)

## Testing Scenarios
1. Simple chat with OpenAI node
2. Complex workflow with memory nodes
3. File upload handling
4. Multi-turn conversations
5. Export functionality
6. Performance with large conversations

## Notes for npm Publishing
- Package name: n8n-nodes-better-chat
- Keywords: n8n-community-node-package, chat, ai, conversation, ui
- License: MIT
- Repository: github.com/jezweb/n8n-nodes-better-chat

## Analysis: Working Node vs Broken Node

### Key Discovery from Cloudflare AutoRAG Comparison
- **Working node has NO root index.js file** despite `"main": "index.js"` in package.json
- n8n **ignores the main field** and only uses `n8n.nodes` array paths
- Our root index.js file might be **causing conflicts** in n8n's loading process

### Current Issues (v0.1.2)
- Package loads correctly in isolation but fails in n8n
- "The specified package could not be loaded" error persists
- Architecture mismatch: Chat UI should be trigger, not transform

### Solution Plan
1. **Remove conflicting files**: Delete root index.js and index.ts
2. **Follow working pattern**: Match exactly what works in AutoRAG node  
3. **Rethink architecture**: Consider trigger vs transform node type
4. **Test systematically**: Build, publish, test installation

## Current Blockers
Root index.js file conflicts with n8n's community node loading mechanism

## Next Steps
1. Remove root index files to match working node pattern
2. Change node group from 'transform' to 'trigger' for better fit
3. Test build and publish v0.1.3
4. Update documentation with architectural decisions