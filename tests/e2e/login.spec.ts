/**
 * Login Tests - Data-Driven Testing Example
 *
 * Demonstrates:
 * - Page Object Model usage
 * - Data-Driven Testing with JSON/YAML data
 * - AAA Pattern (Arrange, Act, Assert)
 * - Squash TM integration tags
 * - Custom logging
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { createLoginAssertions } from '../../src/utils/Assertions';
import { loadTestDataArray } from '../../src/utils/TestDataLoader';
import { createLogger } from '../../src/utils/Logger';

// Initialize logger for this test file
const logger = createLogger('LoginTests');

/**
 * Test data interface for user login
 */
interface UserTestData {
    id: string;
    name: string;
    username: string;
    password: string;
    expectedResult: 'success' | 'locked' | 'error';
    expectedError?: string;
    description: string;
    tags: string[];
    squashId: string;
}

// Load test data from configured source (JSON or YAML based on settings)
const validUsers = loadTestDataArray<UserTestData>('users', 'validUsers');
const lockedUsers = loadTestDataArray<UserTestData>('users', 'lockedUsers');
const invalidCredentials = loadTestDataArray<UserTestData>('users', 'invalidCredentials');

/**
 * Login Test Suite
 */
test.describe('Login Functionality @login @ui', () => {
    let loginPage: LoginPage;

    /**
     * Before each test: Navigate to login page
     */
    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.navigate();
    });

    /**
     * Valid Users - Data-Driven Tests
     * Tests login with all valid user types
     */
    test.describe('Valid User Login @smoke @regression', () => {
        for (const userData of validUsers) {
            test(`${userData.name} @squashTM:${userData.squashId}`, async ({ page }) => {
                // Log test start
                logger.testStart(userData.name);
                const startTime = Date.now();

                try {
                    // ============================================
                    // ARRANGE - Setup test preconditions
                    // ============================================
                    logger.step(1, 'Verify login page is displayed');
                    const assertions = createLoginAssertions(page);
                    await assertions.expectLoginPageDisplayed();

                    // ============================================
                    // ACT - Perform the action being tested
                    // ============================================
                    logger.step(2, `Login with user: ${userData.username}`);
                    await loginPage.login({
                        username: userData.username,
                        password: userData.password,
                    });

                    // ============================================
                    // ASSERT - Verify the expected outcome
                    // ============================================
                    logger.step(3, 'Verify successful login');
                    await assertions.expectLoginSuccess();

                    // Log test pass
                    const duration = Date.now() - startTime;
                    logger.testPass(userData.name, duration);
                } catch (error) {
                    // Log test fail
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    logger.testFail(userData.name, errorMessage);
                    throw error;
                }
            });
        }
    });

    /**
     * Locked User - Data-Driven Tests
     * Tests that locked users cannot login
     */
    test.describe('Locked User Login @regression', () => {
        for (const userData of lockedUsers) {
            test(`${userData.name} @squashTM:${userData.squashId}`, async ({ page }) => {
                logger.testStart(userData.name);
                const startTime = Date.now();

                try {
                    // ARRANGE
                    logger.step(1, 'Verify login page is displayed');
                    const assertions = createLoginAssertions(page);
                    await assertions.expectLoginPageDisplayed();

                    // ACT
                    logger.step(2, `Attempt login with locked user: ${userData.username}`);
                    await loginPage.login({
                        username: userData.username,
                        password: userData.password,
                    });

                    // ASSERT
                    logger.step(3, 'Verify locked out error message');
                    await assertions.expectLockedOutError();

                    const duration = Date.now() - startTime;
                    logger.testPass(userData.name, duration);
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    logger.testFail(userData.name, errorMessage);
                    throw error;
                }
            });
        }
    });

    /**
     * Invalid Credentials - Data-Driven Tests
     * Tests various invalid credential scenarios
     */
    test.describe('Invalid Credentials @regression', () => {
        for (const userData of invalidCredentials) {
            test(`${userData.name} @squashTM:${userData.squashId}`, async ({ page }) => {
                logger.testStart(userData.name);
                const startTime = Date.now();

                try {
                    // ARRANGE
                    logger.step(1, 'Verify login page is displayed');
                    const assertions = createLoginAssertions(page);
                    await assertions.expectLoginPageDisplayed();

                    // ACT
                    logger.step(2, `Attempt login with: ${userData.username || '(empty)'}`);
                    await loginPage.login({
                        username: userData.username,
                        password: userData.password,
                    });

                    // ASSERT
                    logger.step(3, `Verify error message: "${userData.expectedError}"`);
                    if (userData.expectedError) {
                        await assertions.expectErrorMessage(userData.expectedError);
                    }

                    const duration = Date.now() - startTime;
                    logger.testPass(userData.name, duration);
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    logger.testFail(userData.name, errorMessage);
                    throw error;
                }
            });
        }
    });

    /**
     * UI Elements Verification
     */
    test('Login page UI elements are displayed @smoke @ui', async ({ page }) => {
        logger.testStart('Login page UI elements verification');
        const startTime = Date.now();

        try {
            // ARRANGE - Page already loaded in beforeEach
            const assertions = createLoginAssertions(page);

            // ACT - No action needed, just verify UI
            logger.step(1, 'Verify all login form elements');

            // ASSERT
            await assertions.expectLoginPageDisplayed();
            await expect(loginPage.logo).toBeVisible();

            const duration = Date.now() - startTime;
            logger.testPass('Login page UI elements verification', duration);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.testFail('Login page UI elements verification', errorMessage);
            throw error;
        }
    });
});
