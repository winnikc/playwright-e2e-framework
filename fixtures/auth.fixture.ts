/**
 * Authentication Fixture
 *
 * Provides pre-authenticated page states for tests that require login.
 * Uses Playwright's fixtures system for reusable test setup.
 */

import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage';
import { createLogger } from '../src/utils/Logger';

const logger = createLogger('AuthFixture');

/**
 * User credentials type
 */
interface UserCredentials {
    username: string;
    password: string;
}

/**
 * Default credentials for standard user
 */
const DEFAULT_USER: UserCredentials = {
    username: 'standard_user',
    password: 'secret_sauce',
};

/**
 * Extended test fixtures
 */
export interface AuthFixtures {
    /** Login page object */
    loginPage: LoginPage;
    /** Page with logged-in standard user */
    authenticatedPage: Page;
    /** Function to login with specific credentials */
    loginAs: (credentials: UserCredentials) => Promise<void>;
}

/**
 * Test with authentication fixtures
 */
export const test = base.extend<AuthFixtures>({
    /**
     * Login page fixture - provides initialized LoginPage
     */
    loginPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);
        await loginPage.navigate();
        await use(loginPage);
    },

    /**
     * Authenticated page fixture - provides a page already logged in
     */
    authenticatedPage: async ({ page }, use) => {
        logger.info('Setting up authenticated page');
        const loginPage = new LoginPage(page);
        await loginPage.navigate();
        await loginPage.login(DEFAULT_USER);

        // Wait for successful login
        await page.waitForURL(/inventory/);
        logger.info('Authentication successful');

        await use(page);
    },

    /**
     * Login helper function fixture
     */
    loginAs: async ({ page }, use) => {
        const loginAsFunction = async (credentials: UserCredentials): Promise<void> => {
            logger.info(`Logging in as: ${credentials.username}`);
            const loginPage = new LoginPage(page);
            await loginPage.navigate();
            await loginPage.login(credentials);
        };

        await use(loginAsFunction);
    },
});

/**
 * Re-export expect from Playwright
 */
export { expect } from '@playwright/test';

/**
 * Re-export Page type
 */
export type { Page };
