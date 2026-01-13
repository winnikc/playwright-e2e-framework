# Playwright E2E Test Framework

A comprehensive End-to-End testing framework built with Playwright and TypeScript, featuring Page Object Model, Data-Driven Testing, and enterprise integrations.

## 🚀 Features

- **Page Object Model (POM)** - Clean separation of test logic and page structure
- **Data-Driven Testing (DDT)** - JSON and YAML test data support
- **AAA Pattern** - Arrange, Act, Assert structure in all tests
- **Multi-Environment Support** - Dev, QA, UAT environment switching
- **Custom Logging** - Visual test execution with emoji indicators
- **Email Reports** - Automated HTML reports via SMTP
- **Squash TM Integration** - Test management platform integration
- **API Testing** - Built-in API client for REST testing
- **CI/CD Ready** - Complete GitLab CI/CD pipeline
- **MCP Server** - Playwright MCP for AI assistants
- **AI Code Review** - Gemini Pro powered code review agent

## 📁 Project Structure

```
playwright-e2e-framework/
├── .mcp/                    # MCP server configurations
│   ├── playwright-server/   # Playwright MCP server
│   └── code-review-agent/   # Gemini code review agent
├── envs/                    # Environment configurations
│   ├── .env.example         # Template with all options
│   ├── .env.dev             # Development environment
│   ├── .env.qa              # QA environment
│   └── .env.uat             # UAT environment
├── fixtures/                # Playwright fixtures
│   └── auth.fixture.ts      # Authentication fixture
├── resources/               # Static resources (images, etc.)
├── src/
│   ├── api/                 # API testing utilities
│   │   └── ApiClient.ts     # Base API client
│   ├── config/              # Configuration files
│   │   ├── environments.ts  # Environment definitions
│   │   └── settings.ts      # Global settings
│   ├── integrations/        # External integrations
│   │   └── SquashTM.ts      # Squash TM integration
│   ├── pages/               # Page Object Models
│   │   ├── BasePage.ts      # Base page class
│   │   └── LoginPage.ts     # Login page object
│   └── utils/               # Utility functions
│       ├── Assertions.ts    # Assertion helpers
│       ├── EmailReporter.ts # Email report sender
│       ├── Logger.ts        # Custom logger
│       └── TestDataLoader.ts# Test data loader
├── templates/               # Report templates
│   └── email-report.html    # Email HTML template
├── test-data/               # Test data files
│   ├── json/                # JSON format data
│   └── yaml/                # YAML format data
├── tests/
│   ├── api/                 # API tests
│   └── e2e/                 # E2E tests
├── .gitlab-ci.yml           # GitLab CI/CD pipeline
├── playwright.config.ts     # Playwright configuration
└── tsconfig.json            # TypeScript configuration
```

## ⚡ Quick Start

### Prerequisites

- Node.js 18+ 
- Git
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd playwright-e2e-framework

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Configuration

1. **Copy environment file:**
   ```bash
   cp envs/.env.example envs/.env.qa
   ```

2. **Configure your environment in `envs/.env.qa`:**
   ```env
   TEST_ENV=qa
   BASE_URL=https://www.saucedemo.com
   DATA_FORMAT=json
   ```

3. **(Optional) Configure Squash TM:**
   ```env
   REPORT_TO_SQUASH=true
   SQUASH_TM_URL=https://your-squash-instance.com
   SQUASH_TM_API_TOKEN=your-token
   ```

4. **(Optional) Configure Email Reports:**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   EMAIL_RECIPIENTS=recipient@example.com
   ```

### Running Tests

```bash
# Run all tests
npm test

# Run in headed mode (visible browser)
npm run test:headed

# Run with Playwright UI
npm run test:ui

# Run smoke tests
npm run test:smoke

# Run regression tests
npm run test:regression

# Run on specific environment
npm run test:env:dev
npm run test:env:qa
npm run test:env:uat

# Debug mode
npm run test:debug
```

### Run Tests by Tags

```bash
# Run tests with specific tag
npx playwright test --grep "@smoke"
npx playwright test --grep "@regression"
npx playwright test --grep "@login"
npx playwright test --grep "@api"
npx playwright test --grep "@ui"
npx playwright test --grep "@critical"

# Combine tags
npx playwright test --grep "@regression and @login"
```

## 📊 Viewing Reports

```bash
# Show HTML report
npm run report:show

# Send email report
npm run report:send
```

## 🧪 Writing Tests

### Basic Test Structure (AAA Pattern)

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { createLogger } from '../../src/utils/Logger';

const logger = createLogger('MyTests');

test('descriptive test name @smoke @regression', async ({ page }) => {
  logger.testStart('descriptive test name');

  // ARRANGE - Setup test preconditions
  const loginPage = new LoginPage(page);
  await loginPage.navigate();

  // ACT - Perform the action being tested  
  await loginPage.login({ username: 'standard_user', password: 'secret_sauce' });

  // ASSERT - Verify the expected outcome
  await expect(page).toHaveURL(/inventory/);

  logger.testPass('descriptive test name');
});
```

### Data-Driven Testing

```typescript
import { loadTestDataArray } from '../../src/utils/TestDataLoader';

interface UserData {
  username: string;
  password: string;
  expectedResult: string;
}

const users = loadTestDataArray<UserData>('users', 'validUsers');

test.describe('Login Tests', () => {
  for (const userData of users) {
    test(`Login with ${userData.username}`, async ({ page }) => {
      // Test implementation using userData
    });
  }
});
```

### Squash TM Integration

Link tests to Squash TM test cases:

```typescript
test('My test @squashTM:CAMP-4-TC-101', async ({ page }) => {
  // Test implementation
});
```

## 🔧 Configuration Options

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `TEST_ENV` | Environment (dev/qa/uat) | `qa` |
| `BASE_URL` | Application base URL | `https://www.saucedemo.com` |
| `DATA_FORMAT` | Test data format (json/yaml) | `json` |
| `REPORT_TO_SQUASH` | Enable Squash TM reporting | `false` |
| `CI` | Running in CI environment | `false` |

### Data Format Switching

Toggle between JSON and YAML test data:

```bash
# Use JSON (default)
DATA_FORMAT=json npm test

# Use YAML
DATA_FORMAT=yaml npm test
```

## 🔄 CI/CD Pipeline

The GitLab CI/CD pipeline supports:

| Job | Description | Trigger |
|-----|-------------|---------|
| `test:all` | Run all tests | Manual |
| `test:tagged` | Run tests by tags | When `TEST_TAGS` is set |
| `test:smoke` | Run smoke tests | Manual |
| `test:nightly` | Nightly regression | Scheduled |
| `test:mr` | MR validation | Merge Request |
| `test:dev/qa/uat` | Environment-specific | Manual |

### Running Tagged Tests in CI

Set the `TEST_TAGS` variable:
- `@smoke`
- `@regression and @login`
- `@critical`

## 🤖 AI Code Review Agent

Review your commits with Gemini Pro:

### Setup

1. Add your Gemini API key to environment:
   ```bash
   export GEMINI_API_KEY=your-api-key
   ```

2. Start the review server:
   ```bash
   node .mcp/code-review-agent/server.js
   ```

3. Request a review:
   ```bash
   # Review staged changes
   curl -X POST http://localhost:3847/review

   # Review specific commit
   curl -X POST http://localhost:3847/review \
     -d '{"commitHash": "abc123"}'
   ```

See [Code Review Agent Documentation](.mcp/code-review-agent/README.md) for more details.

## 📝 Code Quality

```bash
# Run ESLint
npm run lint

# Fix lint issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check

# Type check
npm run build
```

## 🏗️ Project Commands Reference

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run test:headed` | Run with visible browser |
| `npm run test:ui` | Playwright UI mode |
| `npm run test:smoke` | Run smoke tests |
| `npm run test:regression` | Run regression tests |
| `npm run test:debug` | Debug mode |
| `npm run test:env:dev` | Run on DEV |
| `npm run test:env:qa` | Run on QA |
| `npm run test:env:uat` | Run on UAT |
| `npm run report:show` | Show HTML report |
| `npm run report:send` | Send email report |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | Fix lint issues |
| `npm run format` | Format code |
| `npm run build` | TypeScript check |
| `npm run clean` | Clean artifacts |

## 📚 Additional Documentation

- [Code Review Agent](.mcp/code-review-agent/README.md)
- [Playwright MCP Server](.mcp/playwright-server/README.md)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run linting and tests
4. Request AI code review
5. Create a merge request

## 📜 License

ISC
