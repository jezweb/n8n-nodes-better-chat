# n8n Better Chat Node - Deployment Guide

## Prerequisites

- Node.js >= 20.15
- npm or yarn
- n8n instance (local, cloud, or self-hosted)
- Git (for development)

## Installation Methods

### Method 1: Install from npm (Recommended for Users)

#### For n8n Cloud or Self-Hosted with UI Access
1. Navigate to **Settings** → **Community Nodes**
2. Click **Install Community Node**
3. Enter: `n8n-nodes-better-chat`
4. Click **Install**
5. Restart n8n if prompted

#### For Self-Hosted via Command Line
```bash
# Navigate to your n8n installation
cd /path/to/n8n

# Install the node package
npm install n8n-nodes-better-chat

# Restart n8n
n8n start
```

### Method 2: Install from Source (For Development)

```bash
# Clone the repository
git clone https://github.com/jezweb/n8n-nodes-better-chat.git
cd n8n-nodes-better-chat

# Install dependencies
npm install

# Build the node
npm run build

# Link for local development
npm link

# Navigate to n8n custom folder
cd ~/.n8n/custom

# Link the package
npm link n8n-nodes-better-chat

# Restart n8n
n8n start
```

## Configuration

### Environment Variables

No specific environment variables are required for the Better Chat UI node itself. However, ensure your n8n instance has:

```bash
# If using community nodes
N8N_COMMUNITY_PACKAGES_ENABLED=true

# For development
N8N_CUSTOM_EXTENSIONS="/path/to/custom/nodes"
```

### Node Configuration

The Better Chat UI node can be configured directly in the n8n workflow editor:

1. **Display Mode**
   - Simple: Basic chat interface
   - Rich: Markdown and code highlighting
   - Advanced: All features including folders and threading

2. **Features**
   - Enable/disable specific features as needed
   - Configure UI settings (theme, font size, etc.)

## Deployment Scenarios

### Scenario 1: Local Development

```bash
# Start n8n with custom folder
n8n start --tunnel
```

### Scenario 2: Docker Deployment

```dockerfile
FROM n8nio/n8n:latest

# Install Better Chat Node
RUN npm install -g n8n-nodes-better-chat

# Set environment variables
ENV N8N_COMMUNITY_PACKAGES_ENABLED=true

EXPOSE 5678
```

### Scenario 3: Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: n8n-deployment
spec:
  replicas: 1
  template:
    spec:
      containers:
      - name: n8n
        image: n8nio/n8n:latest
        env:
        - name: N8N_COMMUNITY_PACKAGES_ENABLED
          value: "true"
        volumeMounts:
        - name: n8n-data
          mountPath: /home/node/.n8n
      initContainers:
      - name: install-nodes
        image: n8nio/n8n:latest
        command: ['sh', '-c', 'npm install -g n8n-nodes-better-chat']
```

## Verification

### Check Installation

1. Open n8n workflow editor
2. Search for "Better Chat" in the nodes panel
3. The node should appear with its icon
4. Drag it to the canvas to verify it loads properly

### Test Basic Functionality

Create a test workflow:

```json
{
  "nodes": [
    {
      "name": "Better Chat UI",
      "type": "n8n-nodes-better-chat.BetterChatUI",
      "position": [250, 300],
      "parameters": {
        "displayMode": "rich",
        "features": ["markdown", "codeHighlight", "copy"]
      }
    }
  ]
}
```

## Updating

### Update via npm

```bash
# Check current version
npm list n8n-nodes-better-chat

# Update to latest
npm update n8n-nodes-better-chat

# Or install specific version
npm install n8n-nodes-better-chat@0.2.0

# Restart n8n
n8n start
```

### Update from Source

```bash
cd n8n-nodes-better-chat
git pull
npm install
npm run build
# Restart n8n
```

## Troubleshooting

### Node Not Appearing

1. Check n8n logs for errors:
   ```bash
   n8n start --tunnel 2>&1 | grep -i "better"
   ```

2. Verify installation:
   ```bash
   ls ~/.n8n/nodes/node_modules/ | grep better-chat
   ```

3. Check community nodes are enabled:
   ```bash
   echo $N8N_COMMUNITY_PACKAGES_ENABLED
   ```

### Build Errors

```bash
# Clear node_modules and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Permission Issues

```bash
# Fix permissions for n8n folder
sudo chown -R $(whoami) ~/.n8n
```

## Performance Optimization

### Memory Usage

The Better Chat UI node is designed to be lightweight:
- Base memory: ~10MB
- Per conversation: ~1KB per message
- File handling: Streamed, not loaded into memory

### Scaling Considerations

- The node is stateless and scales horizontally
- No database connections required
- All processing is client-side

## Security Considerations

### Content Security

- All user input is sanitized
- HTML content is escaped
- File uploads are validated

### Network Security

- No external API calls from the node itself
- All data stays within your n8n instance
- HTTPS recommended for production

## Monitoring

### Health Checks

```javascript
// Example health check workflow
{
  "nodes": [
    {
      "name": "Schedule",
      "type": "n8n-nodes-base.schedule",
      "parameters": {
        "rule": {
          "interval": [{ "field": "hours", "hoursInterval": 1 }]
        }
      }
    },
    {
      "name": "Better Chat UI",
      "type": "n8n-nodes-better-chat.BetterChatUI",
      "parameters": {
        "displayMode": "simple"
      }
    }
  ]
}
```

### Logging

Enable debug logging for troubleshooting:

```bash
export N8N_LOG_LEVEL=debug
n8n start
```

## Support

### Getting Help

1. Check the [README](README.md) for usage instructions
2. Review [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
3. Search existing [GitHub Issues](https://github.com/jezweb/n8n-nodes-better-chat/issues)
4. Create a new issue with:
   - n8n version
   - Node version
   - Error messages
   - Workflow JSON

### Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## Version Compatibility

| Better Chat Version | n8n Version | Node.js Version |
|-------------------|-------------|-----------------|
| 0.1.x            | >= 1.0.0    | >= 20.15        |

## Migration Guide

### From Standard Chat Trigger

1. Export your existing workflow
2. Replace chat trigger nodes with Better Chat UI
3. Update connections to AI Agent nodes
4. Test thoroughly before deploying to production