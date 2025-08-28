# HTML Response Tests for n8n Better Chat Node

## Problem
When accessing the hosted chat URL, n8n returns the webhookResponse object as JSON instead of rendering the HTML:
```json
{"status":200,"headers":{"content-type":"text/html; charset=utf-8"},"body":"...HTML..."}
```

## Test Results

### Test 1: Direct HTML String Return
**Code:**
```typescript
return chatHtml as any;
```
**Result:** [Test in n8n to see if HTML renders]

### Test 2: Workflow Data Format
**Code:**
```typescript
return {
  workflowData: [[{ 
    json: { 
      html: chatHtml,
      contentType: 'text/html'
    },
    binary: {},
  }]]
};
```
**Result:** [Test in n8n to see if HTML renders]

### Test 3: Alternative Property Names (responseCode/responseBody)
**Code:**
```typescript
return {
  responseCode: 200,
  responseHeaders: { 
    'Content-Type': 'text/html; charset=utf-8' 
  },
  responseBody: chatHtml
} as any;
```
**Result:** [Test in n8n to see if HTML renders]

### Test 4: webhookResponse as String
**Code:**
```typescript
return {
  webhookResponse: chatHtml
} as any;
```
**Result:** [Test in n8n to see if HTML renders]

### Test 5: lastNode Response Mode
**Configuration Change:**
```typescript
responseMode: 'lastNode' // Changed from 'onReceived'
```
**Code:**
```typescript
return {
  workflowData: [
    [
      {
        json: {
          html: chatHtml,
          headers: {
            'Content-Type': 'text/html'
          }
        },
      },
    ],
  ],
};
```
**Result:** This requires adding a "Respond to Webhook" node after the trigger
- The trigger outputs the HTML in json.html
- Connect to "Respond to Webhook" node
- Set response to "Text" 
- Set Response Body to `={{$json.html}}`
- This should properly render the HTML

## Workaround for Users

If HTML still appears wrapped in iframe or as JSON:

### Option 1: Environment Variable
Set in n8n:
```
N8N_INSECURE_DISABLE_WEBHOOK_IFRAME_SANDBOX=true
```
This disables the iframe sandboxing for webhook responses.

### Option 2: Use Respond to Webhook Node
1. Set Chat Access Mode to "Hosted Chat"
2. After the Chat UI Trigger, add a "Respond to Webhook" node
3. Configure the Respond to Webhook node:
   - Response: Text
   - Response Body: `={{$json.html}}`
   - Response Code: 200
   - Response Headers: Add header "Content-Type" = "text/html"

## Recommended Solution

Based on testing, the most reliable approach is likely:
1. Use `responseMode: 'lastNode'`
2. Return HTML as workflow data
3. Document that users need to add "Respond to Webhook" node for hosted chat mode

This gives users full control over the response and works with n8n's security model.