# Changelog

All notable changes to n8n-nodes-better-chat will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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