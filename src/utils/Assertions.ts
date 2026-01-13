/**
 * Assertion Helper Classes
 *
 * Domain-specific assertion helpers that wrap Playwright's expect
 * with descriptive logging for better test readability.
 *
 * Strategy:
 * - Simple assertions: Use directly in tests with expect()
 * - Complex/repeated assertions: Use helper classes like LoginAssertions
 * - This hybrid approach keeps tests readable while avoiding duplication
 */

import { expect, Page, Locator } from '@playwright/test';
import { createLogger } from './Logger';

const logger = createLogger('Assertions');

/**
 * Base assertion helper with logging
 */
export class BaseAssertions {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Assert element is visible with logging
     */
    async expectVisible(locator: Locator, description: string): Promise<void> {
        logger.assertion(`Expecting "${description}" to be visible`);
        await expect(locator, `${description} should be visible`).toBeVisible();
    }

    /**
     * Assert element is hidden with logging
     */
    async expectHidden(locator: Locator, description: string): Promise<void> {
        logger.assertion(`Expecting "${description}" to be hidden`);
        await expect(locator, `${description} should be hidden`).toBeHidden();
    }

    /**
     * Assert element contains text with logging
     */
    async expectText(locator: Locator, expectedText: string, description: string): Promise<void> {
        logger.assertion(`Expecting "${description}" to contain: "${expectedText}"`);
        await expect(locator, `${description} should contain "${expectedText}"`).toContainText(expectedText);
    }

    /**
     * Assert element has exact text with logging
     */
    async expectExactText(locator: Locator, expectedText: string, description: string): Promise<void> {
        logger.assertion(`Expecting "${description}" to have exact text: "${expectedText}"`);
        await expect(locator, `${description} should have text "${expectedText}"`).toHaveText(expectedText);
    }

    /**
     * Assert URL contains path with logging
     */
    async expectUrlContains(path: string): Promise<void> {
        logger.assertion(`Expecting URL to contain: "${path}"`);
        await expect(this.page, `URL should contain "${path}"`).toHaveURL(new RegExp(path));
    }

    /**
     * Assert page title with logging
     */
    async expectTitle(title: string | RegExp): Promise<void> {
        logger.assertion(`Expecting page title: "${title}"`);
        await expect(this.page, `Page title should match`).toHaveTitle(title);
    }

    /**
     * Assert element count with logging
     */
    async expectCount(locator: Locator, count: number, description: string): Promise<void> {
        logger.assertion(`Expecting ${count} "${description}" elements`);
        await expect(locator, `Should have ${count} ${description} elements`).toHaveCount(count);
    }

    /**
     * Assert element is enabled with logging
     */
    async expectEnabled(locator: Locator, description: string): Promise<void> {
        logger.assertion(`Expecting "${description}" to be enabled`);
        await expect(locator, `${description} should be enabled`).toBeEnabled();
    }

    /**
     * Assert element is disabled with logging
     */
    async expectDisabled(locator: Locator, description: string): Promise<void> {
        logger.assertion(`Expecting "${description}" to be disabled`);
        await expect(locator, `${description} should be disabled`).toBeDisabled();
    }
}

/**
 * Login-specific assertions for SauceDemo
 */
export class LoginAssertions extends BaseAssertions {
    /**
     * Assert successful login - user is on inventory page
     */
    async expectLoginSuccess(): Promise<void> {
        logger.assertion('Expecting successful login - inventory page visible');
        await this.expectUrlContains('/inventory.html');
        await this.expectVisible(this.page.locator('.inventory_list'), 'Product inventory');
    }

    /**
     * Assert login failed with locked out message
     */
    async expectLockedOutError(): Promise<void> {
        logger.assertion('Expecting locked out error message');
        const errorContainer = this.page.locator('[data-test="error"]');
        await this.expectVisible(errorContainer, 'Error message');
        await this.expectText(
            errorContainer,
            'Sorry, this user has been locked out',
            'Locked out error'
        );
    }

    /**
     * Assert login failed with invalid credentials message
     */
    async expectInvalidCredentialsError(): Promise<void> {
        logger.assertion('Expecting invalid credentials error message');
        const errorContainer = this.page.locator('[data-test="error"]');
        await this.expectVisible(errorContainer, 'Error message');
        await this.expectText(
            errorContainer,
            'Username and password do not match',
            'Invalid credentials error'
        );
    }

    /**
     * Assert login page is displayed
     */
    async expectLoginPageDisplayed(): Promise<void> {
        logger.assertion('Expecting login page to be displayed');
        await this.expectVisible(this.page.locator('[data-test="login-button"]'), 'Login button');
        await this.expectVisible(this.page.locator('[data-test="username"]'), 'Username field');
        await this.expectVisible(this.page.locator('[data-test="password"]'), 'Password field');
    }

    /**
     * Assert error message is visible with custom text
     */
    async expectErrorMessage(expectedMessage: string): Promise<void> {
        logger.assertion(`Expecting error message: "${expectedMessage}"`);
        const errorContainer = this.page.locator('[data-test="error"]');
        await this.expectVisible(errorContainer, 'Error message');
        await this.expectText(errorContainer, expectedMessage, 'Error message');
    }
}

/**
 * Factory function to create page-specific assertions
 */
export function createAssertions(page: Page): BaseAssertions {
    return new BaseAssertions(page);
}

/**
 * Factory function to create login-specific assertions
 */
export function createLoginAssertions(page: Page): LoginAssertions {
    return new LoginAssertions(page);
}
