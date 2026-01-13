# Code Review Agent

AI-powered code review agent using Google Gemini Pro for automated code analysis.

## Overview

This MCP server provides automated code review capabilities for the Playwright E2E testing framework. It uses Gemini Pro to analyze git commits and provide detailed feedback on:

- Code quality and clean code principles
- Test quality and best practices
- TypeScript type safety
- Security concerns
- Performance considerations

## Setup

### 1. Configure Gemini API Key

Add your Gemini API key to your environment:

```bash
# In envs/.env.qa (or your preferred environment file)
GEMINI_API_KEY=your-gemini-api-key-here
```

Or set it as an environment variable:

```bash
export GEMINI_API_KEY=your-gemini-api-key-here
```

### 2. Start the Server

```bash
# Start the code review server
node .mcp/code-review-agent/server.js

# Or with the API key inline
GEMINI_API_KEY=your-key node .mcp/code-review-agent/server.js
```

The server starts on port 3847 by default.

## Usage

### Review Current Changes

```bash
# Review staged changes
curl -X POST http://localhost:3847/review \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Review Specific Commit

```bash
# Review a specific commit
curl -X POST http://localhost:3847/review \
  -H "Content-Type: application/json" \
  -d '{"commitHash": "abc123"}'
```

### Check Server Health

```bash
curl http://localhost:3847/health
```

### List Available Tools

```bash
curl http://localhost:3847/tools
```

## Using with AI Assistants

### With Claude Desktop

Add to your Claude Desktop MCP configuration:

```json
{
  "mcpServers": {
    "code-review": {
      "command": "node",
      "args": ["/path/to/playwright-e2e-framework/.mcp/code-review-agent/server.js"],
      "env": {
        "GEMINI_API_KEY": "your-api-key"
      }
    }
  }
}
```

### With Antigravity

The server is pre-configured in `.mcp/mcp.json`. Just ensure your `GEMINI_API_KEY` is set.

## Review Output Format

The code review provides:

1. **Summary**: Brief overview of the changes
2. **Issues Found**: Categorized by severity
   - 🔴 Critical: Must fix before merge
   - 🟠 Major: Should fix, potential bugs
   - 🟡 Minor: Code style or minor improvements
   - 💡 Suggestion: Nice to have improvements
3. **Positive Aspects**: Things done well
4. **Recommendations**: Specific improvement suggestions
5. **Overall Score**: 1-10 rating with justification

## Example Output

```markdown
## Summary
Added new login tests with data-driven approach for multiple user types.

## Issues Found

### 🔴 Critical
- None found

### 🟠 Major
1. **Missing error handling in LoginPage.login()** (line 45)
   - The method doesn't handle timeout scenarios
   - Recommendation: Add try-catch with proper error messages

### 🟡 Minor
1. **Magic string in test data** (users.json, line 12)
   - Password is hardcoded; consider using environment variables

### 💡 Suggestions
1. Consider adding visual regression tests for login page
2. Add explicit waits instead of implicit ones

## Positive Aspects
- Clean Page Object Model implementation
- Good use of TypeScript interfaces
- Comprehensive test data covering all user types

## Recommendations
1. Add JSDoc comments to public methods
2. Consider extracting common test setup to fixtures
3. Add retry logic for flaky network conditions

## Overall Score: 8/10
Solid implementation with good practices. Minor improvements suggested.
```

## Customization

### Modify Review Prompt

Edit the `CODE_REVIEW_PROMPT` constant in `server.js` to customize review criteria:

```javascript
const CODE_REVIEW_PROMPT = `Your custom prompt here...`;
```

### Change Port

```bash
MCP_PORT=4000 node .mcp/code-review-agent/server.js
```

### Adjust Gemini Parameters

Modify the `generationConfig` in `server.js`:

```javascript
generationConfig: {
  temperature: 0.3,  // Lower = more focused, higher = more creative
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 8192,
}
```

## Troubleshooting

### "GEMINI_API_KEY not set"

Ensure the environment variable is set before starting the server.

### "Failed to get git diff"

Make sure you're running the server from within a git repository.

### "Gemini API error"

Check your API key is valid and has available quota.

## Security Notes

- Never commit your `GEMINI_API_KEY` to version control
- The server only runs locally and doesn't expose sensitive data
- Git diffs are sent to Gemini API for processing
