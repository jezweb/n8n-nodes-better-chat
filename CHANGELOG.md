# Changelog

All notable changes to n8n-nodes-better-chat will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0] - 2025-08-29

### Added
- **NEW NODE**: BetterChatTrigger - Fully compatible with Respond to Webhook node
- Cloned from official n8n Chat Trigger for guaranteed compatibility
- All custom UI enhancement features preserved
- Rich theme support (light/dark/auto)
- Markdown rendering and code highlighting
- Message timestamps and copy functionality
- Compact mode for dense interfaces
- Customizable max height

### Changed
- Major version bump due to significant architectural change
- New node type that n8n's Respond to Webhook recognizes
- Improved webhook configuration matching official patterns
- Enhanced HTML chat interface with better styling

### Technical
- Node type: `n8n-nodes-better-chat.betterChatTrigger`
- Follows n8n's official Chat Trigger patterns exactly
- Compatible with all response modes (lastNode, responseNode)
- Maintains backward compatibility with MinimalWebhook node

### Migration Guide
- Existing workflows using MinimalWebhook will continue to work
- For Respond to Webhook compatibility, switch to BetterChatTrigger node
- All features and settings are preserved in the new node

## [0.2.5] - 2025-08-29

### Fixed
- **CRITICAL FIX**: Completely resolved "No Webhook node found" error with Respond to Webhook node
- Webhook configuration now matches n8n's official Chat Trigger pattern
- Response mode moved to options collection parameter following n8n conventions
- Dynamic responseMode evaluation using n8n expression syntax

### Changed
- responseMode parameter moved into 'options' collection for proper expression evaluation
- Response mode values updated: 'lastNode' and 'responseNode' (replacing 'onReceived')
- Simplified response handling - always returns workflowData for workflow continuation
- Default response mode is now 'lastNode' for backward compatibility

### Technical
- Webhook responseMode uses expression: `'={{$parameter.options?.["responseMode"] || "lastNode" }}'`
- This pattern allows n8n to recognize the node as a webhook trigger at registration time
- Response handling unified for both lastNode and responseNode modes

## [0.2.4] - 2025-08-29

### Fixed
- **Critical**: Respond to Webhook node now properly recognizes the Chat UI Trigger
- Changed webhook responseMode from expression to static 'responseNode' value
- Dynamic responseMode handling now occurs at runtime in webhook function
- Both automatic response (onReceived) and manual response (responseNode) modes work correctly

### Technical
- Webhook configuration uses static value for n8n node registration
- Runtime parameter evaluation determines actual response behavior
- Proper workflowData structure returned for Respond to Webhook compatibility

## [0.2.3] - 2025-08-29

### Added
- **Response Mode Parameter**: New configuration option to control webhook response behavior
  - "When Last Node Finishes" (onReceived) - Automatic response when workflow completes
  - "Using Respond to Webhook Node" (responseNode) - Manual response control via Respond to Webhook node
- Response mode now properly supports the Respond to Webhook node for hosted chat

### Fixed
- Hosted chat now works correctly with Respond to Webhook node
- Updated JSON syntax in Response Body field to use single expression format
- Documentation updated with correct expression syntax for Respond to Webhook node

### Changed
- Default response mode set to "onReceived" for backward compatibility
- HOSTED_CHAT_SETUP.md updated with correct JSON expression syntax
- Response Body examples now use proper n8n expression format: `={{ {"response": $json.output} }}`

## [0.2.2] - 2025-08-28

### Fixed
- Simplified HTML response handling for hosted chat mode
- Changed webhookResponse to return HTML string directly
- Testing different response formats to resolve rendering issues

### Added
- HTML_RESPONSE_TESTS.md documentation for troubleshooting

## [0.2.1] - 2025-08-28

### Fixed
- HTML response rendering for hosted chat mode now displays properly
- Webhook response format corrected to serve HTML with proper headers
- Fixed issue where HTML was being serialized as JSON instead of rendered

## [0.2.0] - 2025-08-28

### Added
- **Chat Access Modes**: Three ways to use the chat trigger
  - Webhook Only: Basic webhook endpoint for custom integrations
  - Hosted Chat: Complete chat interface provided by n8n with generated URL
  - Embedded Chat: Compatible with @n8n/chat widget for embedding
- **Hosted Chat Interface**: Built-in HTML chat UI served on GET requests
  - Modern, responsive design with dark mode support
  - Real-time message display and input
  - Auto-generated chat URL based on workflow ID
  - Test mode support with public/private toggle
- **Authentication**: Security options for chat access
  - None: Open access (default)
  - Basic Auth: Username/password protection
- **CORS Configuration**: Control cross-origin access
  - Configurable allowed origins
  - Support for embedded widget scenarios
- **Chat URL Generation**: Automatic URL creation for hosted mode
  - Test URL for workflow development
  - Production URL for active workflows
- **Enhanced Security**: Multiple security layers
  - Public availability toggle
  - Authentication enforcement
  - CORS origin validation
- **Welcome Message**: Customizable initial greeting for hosted chat

### Changed
- HTTP method handling now supports both GET (interface) and POST (messages)
- Node now serves different responses based on chat mode and HTTP method
- Enhanced parameter organization with conditional display
- Improved webhook URL display with mode-specific information

### Technical
- Added inline HTML generation for hosted chat interface
- Implemented multi-method webhook handling (GET/POST)
- Added workflow context extraction for chat URL generation
- Conditional parameter visibility based on chat mode

## [0.1.17] - 2025-08-28

### Added
- **AI Agent Compatibility**: Native `chatInput` field for seamless AI Agent integration
- **Output Format Options**: New parameter to choose between AI-optimized and detailed output
  - "AI Agent Compatible" mode provides simplified structure
  - "Detailed" mode includes all metadata and context
- Automatic session and thread ID generation
- Message count tracking in output

### Changed
- Default output format set to "AI Agent Compatible" for better out-of-box experience
- Improved message processing with feature-based enhancements

## [0.1.16] - 2025-08-28

### Fixed
- **CRITICAL**: Resolved file structure issue causing "ENOENT: no such file or directory" error
- Fixed gulp build process to copy JS files to correct dist/nodes/ directory
- Files now properly located at dist/nodes/MinimalWebhook/MinimalWebhook.node.js

### Changed  
- Updated build process to automatically handle file structure
- ESLint configuration fixed to exclude package.json
- Added ESLint disable for correct "px" unit abbreviation

## [0.1.15] - 2025-08-28

### Fixed
- Reverted incorrect "Px" capitalization back to standard "px"
- Added ESLint disable comment to prevent future false positives

## [0.1.14] - 2025-08-28

### Changed
- **BREAKING**: ESLint "fix" that incorrectly changed "px" to "Px" (caused loading failure)

## [0.1.13] - 2025-08-28

### Changed
- **BREAKTHROUGH**: Upgraded from minimal webhook to full chat functionality
- Changed display name to "Chat UI Trigger" while keeping working node name
- Added comprehensive chat message processing and conversation context
- Added proper session/thread ID handling and message metadata
- Added feature-based message processing (markdown, timestamps, actions)
- Added usableAsTool flag for AI Agent compatibility

### Added
- Full conversation context with previous messages support
- User message extraction from multiple field names (message/text/content)
- Session and thread ID generation and tracking
- Message metadata with source tracking
- Context information (conversation length, user agent, IP)
- Raw data passthrough for debugging
- Feature-driven message enhancement (markdown, code highlighting, copy actions)

## [0.1.8] - 2025-08-28

### Changed
- **DEBUGGING**: Stripped down to absolute minimal webhook trigger
- Single node: MinimalWebhook with no properties, just webhook path
- Removed all other nodes to isolate loading issue
- Testing with simplest possible trigger implementation

## [0.1.7] - 2025-08-28

### Fixed
- **CRITICAL**: Properly fixed file structure with all files in dist/nodes/[NodeName]/
- Version 0.1.6 had files split between dist/ and dist/nodes/ 
- All JS, d.ts, map, and svg files now correctly colocated

## [0.1.6] - 2025-08-28

### Fixed
- **CRITICAL**: Fixed file structure issue where TypeScript compiled files to wrong directory
- JS files were in dist/ but package.json expected them in dist/nodes/
- Moved all compiled files to correct dist/nodes/[NodeName]/ structure
- Icons and JS files now properly colocated in same directories

## [0.1.5] - 2025-08-28

### Added
- New simplified webhook trigger node (BetterChatSimple) for debugging loading issues
- Minimal implementation with basic webhook functionality

### Changed
- Added second node to package to help identify loading problems
- Testing different implementation patterns

### Fixed
- Attempting to resolve persistent "package could not be loaded" error

## [0.1.4] - 2025-01-28

### Changed
- **BREAKING**: Complete architectural redesign from transform to webhook trigger node
- Replaced IExecuteFunctions with IWebhookFunctions for proper webhook handling
- Removed inputs array (triggers don't have inputs)
- Replaced execute() method with webhook() method
- Removed message input field (data now comes from webhook)
- Data flow now initiates from external webhook POST requests

### Added
- Webhook infrastructure with configurable path parameter
- Webhook data processing (body, headers, query parameters)
- Support for multiple message field names (message, text, content)
- Webhook source tracking in message metadata

### Fixed
- **CRITICAL**: Resolved "package could not be loaded" error
- Node now implements proper trigger node infrastructure that n8n expects
- Correct webhook trigger architecture enables proper loading in n8n

## [0.1.3] - 2025-01-28

### Fixed
- **CRITICAL**: Removed root index.js and index.ts files that conflicted with n8n loading mechanism
- Node group changed from 'transform' to 'trigger' for better categorization
- Package structure now matches working n8n community node patterns

### Changed
- Updated TypeScript configuration to exclude root index compilation
- Architectural documentation updated with critical loading mechanism discovery
- No longer exports via root index files (n8n uses only n8n.nodes array paths)

## [0.1.2] - 2025-01-28

### Fixed
- Corrected package.json main entry point from "dist/index.js" to "index.js"
- Added proper root index.js exports structure
- Fixed npm package loading and verification

## [0.1.1] - 2025-01-28

### Fixed
- Added missing index.ts export file for proper node registration
- Updated package.json main entry to point to dist/index.js
- Resolved TypeScript compilation issues with node exports

## [0.1.0] - 2025-01-28

### Added
- Initial project structure from n8n-nodes-starter
- Core Better Chat UI node implementation
- Rich text rendering with Markdown support
- Code syntax highlighting for multiple languages
- Message actions (copy, regenerate, pin)
- File upload handling with validation
- Conversation threading support
- Export functionality (JSON, Markdown formats)
- Search within conversation
- Folder organization for visual categorization
- Comprehensive documentation (README, ARCHITECTURE, CLAUDE)
- TypeScript types and interfaces
- Error handling and validation
- AI Agent compatibility

### Changed
- N/A (Initial release)

### Deprecated
- N/A (Initial release)

### Removed
- N/A (Initial release)

### Fixed
- N/A (Initial release)

### Security
- Input sanitization for all user content
- HTML escaping to prevent XSS attacks
- File type validation for uploads

## [0.1.0] - 2025-08-28

### Added
- Initial release of n8n Better Chat Node
- Basic chat UI functionality
- Integration with n8n AI Agent nodes
- Documentation and examples

[Unreleased]: https://github.com/jezweb/n8n-nodes-better-chat/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/jezweb/n8n-nodes-better-chat/releases/tag/v0.1.0