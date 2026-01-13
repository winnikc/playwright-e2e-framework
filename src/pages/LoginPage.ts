/**
 * Login Page Object Model
 *
 * Page object for the SauceDemo login page.
 * Contains locators and actions for login functionality.
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Login credentials interface
 */
export interface LoginCredentials {
    username: string;
    password: string;
}

/**
 * Login Page class for SauceDemo
 */
export class LoginPage extends BasePage {
    // ============================================
    // LOCATORS
    // ============================================

    /** Username input field */
    readonly usernameInput: Locator;

    /** Password input field */
    readonly passwordInput: Locator;

    /** Login button */
    readonly loginButton: Locator;

    /** Error message container */
    readonly errorMessage: Locator;

    /** Error button (close error) */
    readonly errorButton: Locator;

    /** Logo */
    readonly logo: Locator;

    // ============================================
    // CONSTRUCTOR
    // ============================================

    constructor(page: Page) {
        super(page, 'LoginPage');

        // Initialize locators using data-test attributes for stability
        this.usernameInput = page.locator('[data-test="username"]');
        this.passwordInput = page.locator('[data-test="password"]');
        this.loginButton = page.locator('[data-test="login-button"]');
        this.errorMessage = page.locator('[data-test="error"]');
        this.errorButton = page.locator('.error-button');
        this.logo = page.locator('.login_logo');
    }

    // ============================================
    // PAGE URL
    // ============================================

    /**
     * Get the login page URL path
     */
    get url(): string {
        return '/';
    }

    // ============================================
    // ACTIONS
    // ============================================

    /**
     * Wait for page to be ready
     */
    async waitForPageLoad(): Promise<void> {
        await super.waitForPageLoad();
        await this.loginButton.waitFor({ state: 'visible' });
    }

    /**
     * Enter username
     */
    async enterUsername(username: string): Promise<void> {
        await this.fill(this.usernameInput, username, 'Username');
    }

    /**
     * Enter password
     */
    async enterPassword(password: string): Promise<void> {
        await this.fill(this.passwordInput, password, 'Password');
    }

    /**
     * Click login button
     */
    async clickLogin(): Promise<void> {
        await this.click(this.loginButton, 'Login Button');
    }

    /**
     * Perform complete login action
     * Follows AAA pattern - this is the "Act" phase helper
     */
    async login(credentials: LoginCredentials): Promise<void> {
        this.logger.info(`Logging in as: ${credentials.username}`);
        await this.enterUsername(credentials.username);
        await this.enterPassword(credentials.password);
        await this.clickLogin();
    }

    /**
     * Login with username and password directly
     */
    async loginWith(username: string, password: string): Promise<void> {
        await this.login({ username, password });
    }

    /**
     * Clear login form
     */
    async clearForm(): Promise<void> {
        await this.clear(this.usernameInput, 'Username');
        await this.clear(this.passwordInput, 'Password');
    }

    /**
     * Close error message
     */
    async closeError(): Promise<void> {
        if (await this.errorButton.isVisible()) {
            await this.click(this.errorButton, 'Error Close Button');
        }
    }

    // ============================================
    // GETTERS (for assertions in tests)
    // ============================================

    /**
     * Get error message text
     */
    async getErrorMessageText(): Promise<string> {
        if (await this.errorMessage.isVisible()) {
            return await this.getText(this.errorMessage);
        }
        return '';
    }

    /**
     * Check if error message is displayed
     */
    async isErrorDisplayed(): Promise<boolean> {
        return await this.errorMessage.isVisible();
    }

    /**
     * Check if login page is displayed
     */
    async isDisplayed(): Promise<boolean> {
        return await this.loginButton.isVisible();
    }

    /**
     * Get accepted usernames from the page
     */
    async getAcceptedUsernames(): Promise<string[]> {
        const loginCredentials = this.page.locator('#login_credentials');
        const text = await loginCredentials.textContent();
        if (!text) {
            return [];
        }
        // Parse usernames from the text
        const lines = text.split('\n').filter((line) => line.trim() && !line.includes('Accepted'));
        return lines.map((line) => line.trim());
    }
}
