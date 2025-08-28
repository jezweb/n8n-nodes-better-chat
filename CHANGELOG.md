# Changelog

All notable changes to n8n-nodes-better-chat will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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