/**
 * Base Page Object Model
 *
 * Abstract base class for all page objects.
 * Provides common functionality and enforces consistent structure.
 */

import { Page, Locator } from '@playwright/test';
import { createLogger, Logger } from '../utils/Logger';

/**
 * Base Page class that all page objects should extend
 */
export abstract class BasePage {
    /** Playwright Page instance */
    protected readonly page: Page;
    /** Logger instance for this page */
    protected readonly logger: Logger;
    /** Page name for logging */
    protected readonly pageName: string;

    /**
     * Constructor
     * @param page - Playwright Page instance
     * @param pageName - Name of the page for logging
     */
    constructor(page: Page, pageName: string) {
        this.page = page;
        this.pageName = pageName;
        this.logger = createLogger(pageName);
    }

    /**
     * Abstract method to get the page URL path
     * Must be implemented by each page object
     */
    abstract get url(): string;

    /**
     * Navigate to this page
     */
    async navigate(): Promise<void> {
        this.logger.action(`Navigating to ${this.pageName}`);
        await this.page.goto(this.url);
        await this.waitForPageLoad();
    }

    /**
     * Wait for the page to fully load
     * Override in child classes for page-specific load conditions
     */
    async waitForPageLoad(): Promise<void> {
        await this.page.waitForLoadState('domcontentloaded');
    }

    /**
     * Get the current page title
     */
    async getTitle(): Promise<string> {
        return await this.page.title();
    }

    /**
     * Get the current page URL
     */
    getCurrentUrl(): string {
        return this.page.url();
    }

    /**
     * Check if an element is visible
     */
    async isVisible(locator: Locator): Promise<boolean> {
        return await locator.isVisible();
    }

    /**
     * Wait for an element to be visible
     */
    async waitForElement(locator: Locator, timeout?: number): Promise<void> {
        await locator.waitFor({ state: 'visible', timeout });
    }

    /**
     * Click an element with logging
     */
    protected async click(locator: Locator, elementName: string): Promise<void> {
        this.logger.action(`Clicking "${elementName}"`);
        await locator.click();
    }

    /**
     * Fill an input field with logging
     */
    protected async fill(locator: Locator, value: string, fieldName: string): Promise<void> {
        this.logger.action(`Filling "${fieldName}" with value`);
        await locator.fill(value);
    }

    /**
     * Clear an input field
     */
    protected async clear(locator: Locator, fieldName: string): Promise<void> {
        this.logger.action(`Clearing "${fieldName}"`);
        await locator.clear();
    }

    /**
     * Get text from an element
     */
    protected async getText(locator: Locator): Promise<string> {
        const text = await locator.textContent();
        return text || '';
    }

    /**
     * Get input value
     */
    protected async getValue(locator: Locator): Promise<string> {
        return await locator.inputValue();
    }

    /**
     * Select option from dropdown
     */
    protected async selectOption(
        locator: Locator,
        value: string,
        dropdownName: string
    ): Promise<void> {
        this.logger.action(`Selecting "${value}" from "${dropdownName}"`);
        await locator.selectOption(value);
    }

    /**
     * Take a screenshot of the current page
     */
    async takeScreenshot(name: string): Promise<Buffer> {
        this.logger.action(`Taking screenshot: ${name}`);
        return await this.page.screenshot({
            path: `reports/screenshots/${name}.png`,
            fullPage: true,
        });
    }

    /**
     * Scroll to element
     */
    protected async scrollToElement(locator: Locator): Promise<void> {
        await locator.scrollIntoViewIfNeeded();
    }

    /**
     * Hover over element
     */
    protected async hover(locator: Locator, elementName: string): Promise<void> {
        this.logger.action(`Hovering over "${elementName}"`);
        await locator.hover();
    }

    /**
     * Get the Playwright Page instance
     * Use sparingly - prefer adding methods to page objects
     */
    getPage(): Page {
        return this.page;
    }
}
