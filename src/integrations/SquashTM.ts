/**
 * Squash TM Integration
 *
 * Integrates test results with Squash TM test management platform.
 * Supports:
 * - Reporting test execution status
 * - Attaching screenshots on failure
 * - Data-Driven Testing with iteration mapping
 */

import axios, { AxiosInstance } from 'axios';
import * as fs from 'fs';
import { settings } from '../config/settings';
import { createLogger } from '../utils/Logger';

const logger = createLogger('SquashTM');

/**
 * Test execution status for Squash TM
 */
export enum SquashTestStatus {
    PASSED = 'PASSED',
    FAILED = 'FAILED',
    BLOCKED = 'BLOCKED',
    NOT_RUN = 'NOT_RUN',
    UNTESTABLE = 'UNTESTABLE',
    SETTLED = 'SETTLED',
}

/**
 * Test execution result interface
 */
export interface TestExecutionResult {
    /** Squash TM test case ID (e.g., CAMP-4-TC-101) */
    squashId: string;
    /** Test execution status */
    status: SquashTestStatus;
    /** Optional comment/description */
    comment?: string;
    /** Optional screenshot path */
    screenshotPath?: string;
    /** Execution duration in milliseconds */
    duration?: number;
    /** DDT iteration index (for data-driven tests) */
    iterationIndex?: number;
    /** DDT iteration data description */
    iterationData?: string;
}

/**
 * Squash TM API Client
 */
export class SquashTMClient {
    private readonly client: AxiosInstance;
    private readonly campaignId: string;
    private readonly enabled: boolean;

    constructor() {
        this.enabled = settings.reportToSquash;
        this.campaignId = settings.squashTM.campaignId;

        this.client = axios.create({
            baseURL: `${settings.squashTM.url}/api/rest/latest`,
            headers: {
                Authorization: `Bearer ${settings.squashTM.apiToken}`,
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        });

        if (this.enabled) {
            logger.info(`Squash TM integration enabled for campaign: ${this.campaignId}`);
        }
    }

    /**
     * Check if Squash TM reporting is enabled
     */
    isEnabled(): boolean {
        return this.enabled;
    }

    /**
     * Parse Squash ID from test title
     * Expected format: @squashTM:CAMP-4-TC-101
     */
    static parseSquashId(testTitle: string): string | null {
        const match = testTitle.match(/@squashTM:([A-Z0-9-]+)/i);
        return match ? match[1] : null;
    }

    /**
     * Report test execution result to Squash TM
     */
    async reportResult(result: TestExecutionResult): Promise<boolean> {
        if (!this.enabled) {
            logger.debug('Squash TM reporting is disabled');
            return false;
        }

        try {
            logger.info(`Reporting result to Squash TM: ${result.squashId} - ${result.status}`);

            // Build the comment including DDT iteration info
            let comment = result.comment || '';
            if (result.iterationIndex !== undefined) {
                comment = `[DDT Iteration ${result.iterationIndex + 1}] ${comment}`;
                if (result.iterationData) {
                    comment += `\nTest Data: ${result.iterationData}`;
                }
            }
            if (result.duration) {
                comment += `\nDuration: ${result.duration}ms`;
            }

            // Parse the test case ID to extract numeric ID
            const testCaseId = this.extractTestCaseId(result.squashId);

            if (!testCaseId) {
                logger.warn(`Could not extract test case ID from: ${result.squashId}`);
                return false;
            }

            // Report execution status
            // Note: Actual Squash TM API integration depends on your Squash version
            // This is a template for the API call structure
            const payload = {
                executionStatus: result.status,
                comment: comment,
                lastExecutedOn: new Date().toISOString(),
            };

            await this.client.patch(`/iterations/${testCaseId}/test-plan`, payload);

            // Upload screenshot if available
            if (result.screenshotPath && result.status === SquashTestStatus.FAILED) {
                await this.uploadScreenshot(testCaseId, result.screenshotPath);
            }

            logger.info(`Successfully reported result for: ${result.squashId}`);
            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(`Failed to report to Squash TM: ${errorMessage}`);
            return false;
        }
    }

    /**
     * Extract numeric test case ID from Squash ID format
     */
    private extractTestCaseId(squashId: string): string | null {
        // Expected format: CAMP-4-TC-101 -> extract 101
        const match = squashId.match(/TC-(\d+)/i);
        return match ? match[1] : null;
    }

    /**
     * Upload screenshot attachment to Squash TM
     */
    private async uploadScreenshot(testCaseId: string, screenshotPath: string): Promise<void> {
        try {
            if (!fs.existsSync(screenshotPath)) {
                logger.warn(`Screenshot file not found: ${screenshotPath}`);
                return;
            }

            const fileBuffer = fs.readFileSync(screenshotPath);
            const base64File = fileBuffer.toString('base64');

            await this.client.post(`/iterations/${testCaseId}/attachments`, {
                name: `failure-screenshot-${Date.now()}.png`,
                content: base64File,
                contentType: 'image/png',
            });

            logger.info(`Screenshot uploaded for test case: ${testCaseId}`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(`Failed to upload screenshot: ${errorMessage}`);
        }
    }

    /**
     * Report batch of results for DDT test
     */
    async reportDDTResults(results: TestExecutionResult[]): Promise<void> {
        if (!this.enabled) {
            return;
        }

        logger.info(`Reporting ${results.length} DDT iteration results`);

        for (let i = 0; i < results.length; i++) {
            const result = { ...results[i], iterationIndex: i };
            await this.reportResult(result);
        }
    }

    /**
     * Get campaign execution status
     */
    async getCampaignStatus(): Promise<unknown> {
        try {
            const response = await this.client.get(`/campaigns/${this.campaignId}`);
            return response.data;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(`Failed to get campaign status: ${errorMessage}`);
            return null;
        }
    }
}

/**
 * Singleton instance
 */
let squashClient: SquashTMClient | null = null;

/**
 * Get Squash TM client instance
 */
export function getSquashTMClient(): SquashTMClient {
    if (!squashClient) {
        squashClient = new SquashTMClient();
    }
    return squashClient;
}

/**
 * Decorator-style function to link test with Squash TM
 * Usage in test: test('My test @squashTM:CAMP-4-TC-101', ...)
 */
export function squashTM(testCaseId: string): string {
    return `@squashTM:${testCaseId}`;
}

/**
 * Convert Playwright test status to Squash TM status
 */
export function toSquashStatus(playwrightStatus: string): SquashTestStatus {
    switch (playwrightStatus.toLowerCase()) {
        case 'passed':
            return SquashTestStatus.PASSED;
        case 'failed':
        case 'timedout':
            return SquashTestStatus.FAILED;
        case 'skipped':
            return SquashTestStatus.NOT_RUN;
        default:
            return SquashTestStatus.NOT_RUN;
    }
}
