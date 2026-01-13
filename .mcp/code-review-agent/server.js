/**
 * Code Review Agent MCP Server
 *
 * MCP server that provides code review capabilities using Gemini Pro.
 * Reviews commits, pull requests, and provides detailed feedback.
 */

const http = require('http');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Configuration
const PORT = process.env.MCP_PORT || 3847;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

/**
 * Code Review Prompt Template
 */
const CODE_REVIEW_PROMPT = `You are an expert code reviewer specializing in test automation frameworks. 
You are reviewing code for a Playwright + TypeScript E2E testing project.

Your review should focus on:

## Code Quality
- Clean code principles
- SOLID principles adherence
- DRY (Don't Repeat Yourself) violations
- Naming conventions and clarity
- Code complexity and readability

## Test Quality
- Test isolation and independence
- Proper use of AAA (Arrange, Act, Assert) pattern
- Adequate assertions and coverage
- Page Object Model best practices
- Data-Driven Testing implementation
- Proper error handling

## Best Practices
- TypeScript type safety
- Async/await usage
- Proper resource cleanup
- Logging practices
- Configuration management

## Security
- No hardcoded credentials
- Sensitive data handling
- Environment variable usage

## Performance
- Efficient selectors
- Unnecessary waits
- Parallel execution considerations

---

Please review the following code changes and provide:
1. **Summary**: Brief overview of the changes
2. **Issues Found**: List issues with severity (Critical/Major/Minor/Suggestion)
3. **Positive Aspects**: What was done well
4. **Recommendations**: Specific suggestions for improvement
5. **Overall Score**: Rate 1-10 with justification

CODE CHANGES TO REVIEW:
`;

/**
 * Get git diff for review
 */
async function getGitDiff(commitHash) {
    try {
        if (commitHash) {
            const { stdout } = await execAsync(\`git show \${commitHash} --format="%H%n%s%n%b" --stat --patch\`);
      return stdout;
    } else {
      // Get diff of staged changes
      const { stdout } = await execAsync('git diff --cached');
      return stdout || (await execAsync('git diff')).stdout;
    }
  } catch (error) {
    throw new Error(\`Failed to get git diff: \${error.message}\`);
  }
}

/**
 * Call Gemini Pro API
 */
async function callGeminiAPI(prompt) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  const response = await fetch(\`\${GEMINI_API_URL}?key=\${GEMINI_API_KEY}\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_NONE',
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_NONE',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_NONE',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_NONE',
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(\`Gemini API error: \${error}\`);
  }

  const data = await response.json();
  return data.candidates[0]?.content?.parts[0]?.text || 'No response generated';
}

/**
 * Perform code review
 */
async function reviewCode(commitHash) {
  console.log(\`🔍 Starting code review\${commitHash ? \` for commit: \${commitHash}\` : ''}\`);

  // Get the diff
  const diff = await getGitDiff(commitHash);
  
  if (!diff.trim()) {
    return {
      success: false,
      message: 'No changes found to review',
    };
  }

  // Build the prompt
  const prompt = CODE_REVIEW_PROMPT + '\\n\\n' + diff;

  // Call Gemini API
  console.log('📤 Sending to Gemini Pro for review...');
  const review = await callGeminiAPI(prompt);

  return {
    success: true,
    review,
    commitHash,
    timestamp: new Date().toISOString(),
  };
}

/**
 * MCP Server handler
 */
const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/review') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { commitHash } = JSON.parse(body || '{}');
        const result = await reviewCode(commitHash);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: false, 
          error: error.message 
        }));
      }
    });
  } else if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'healthy',
      service: 'code-review-agent',
      geminiConfigured: !!GEMINI_API_KEY
    }));
  } else if (req.method === 'GET' && req.url === '/tools') {
    // MCP tools listing
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      tools: [
        {
          name: 'review_commit',
          description: 'Review a specific git commit for code quality issues',
          parameters: {
            commitHash: {
              type: 'string',
              description: 'Git commit hash to review (optional, defaults to staged changes)',
              required: false
            }
          }
        },
        {
          name: 'review_changes',
          description: 'Review current staged or unstaged changes',
          parameters: {}
        }
      ]
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

// Start server
server.listen(PORT, () => {
  console.log(\`🤖 Code Review Agent MCP Server running on port \${PORT}\`);
  console.log(\`   Gemini API: \${GEMINI_API_KEY ? '✅ Configured' : '❌ Not configured'}\`);
  console.log(\`   Endpoints:\`);
  console.log(\`     POST /review - Review commit or changes\`);
  console.log(\`     GET /health  - Health check\`);
  console.log(\`     GET /tools   - List available tools\`);
});
