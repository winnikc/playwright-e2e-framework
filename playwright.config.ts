import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment-specific configuration
const testEnv = process.env.TEST_ENV || 'qa';
const envPath = path.resolve(__dirname, `envs/.env.${testEnv}`);
dotenv.config({ path: envPath });

// Fallback to example if specific env file doesn't exist
dotenv.config({ path: path.resolve(__dirname, 'envs/.env.example') });

/**
 * Playwright Test Configuration
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    // Test directory
    testDir: './tests',

    // Test file patterns
    testMatch: ['**/*.spec.ts'],

    // Run tests in parallel
    fullyParallel: true,

    // Fail the build on CI if you accidentally left test.only in the source code
    forbidOnly: !!process.env.CI,

    // Retry on CI only
    retries: process.env.CI ? 2 : 0,

    // Limit parallel workers on CI
    workers: process.env.CI ? 1 : undefined,

    // Reporter configuration
    reporter: [
        ['html', { open: 'never', outputFolder: 'playwright-report' }],
        ['list'],
        ['json', { outputFile: 'reports/test-results.json' }],
    ],

    // Shared settings for all projects
    use: {
        // Base URL from environment config
        baseURL: process.env.BASE_URL || 'https://www.saucedemo.com',

        // Collect trace when retrying the failed test
        trace: 'on-first-retry',

        // Screenshot on failure
        screenshot: 'only-on-failure',

        // Video on failure
        video: 'on-first-retry',

        // Viewport size
        viewport: { width: 1280, height: 720 },

        // Action timeout
        actionTimeout: 15000,

        // Navigation timeout
        navigationTimeout: 30000,
    },

    // Timeout for each test
    timeout: 60000,

    // Expect timeout
    expect: {
        timeout: 10000,
    },

    // Output directory for test artifacts
    outputDir: 'test-results',

    // Configure projects for major browsers
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
        // Mobile viewports
        {
            name: 'mobile-chrome',
            use: { ...devices['Pixel 5'] },
        },
        {
            name: 'mobile-safari',
            use: { ...devices['iPhone 12'] },
        },
    ],

    // Global setup/teardown
    // globalSetup: require.resolve('./src/config/globalSetup.ts'),
    // globalTeardown: require.resolve('./src/config/globalTeardown.ts'),
});
