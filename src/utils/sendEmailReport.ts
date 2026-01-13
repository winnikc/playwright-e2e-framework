/**
 * Send Email Report Script
 *
 * Standalone script to send email report after test execution.
 * Run with: npm run report:send
 */

import * as fs from 'fs';
import * as path from 'path';
import { EmailReporter, EmailReportData, TestResult, TestResultSummary } from './EmailReporter';
import { settings } from '../config/settings';
import { createLogger } from './Logger';

const logger = createLogger('SendReport');

/**
 * Parse Playwright JSON report
 */
function parsePlaywrightReport(reportPath: string): EmailReportData {
    if (!fs.existsSync(reportPath)) {
        throw new Error(`Report file not found: ${reportPath}`);
    }

    const reportContent = fs.readFileSync(reportPath, 'utf-8');
    const report = JSON.parse(reportContent);

    // Parse test results
    const tests: TestResult[] = [];
    let passed = 0;
    let failed = 0;
    let skipped = 0;

    // Navigate through the Playwright report structure
    for (const suite of report.suites || []) {
        parseTestSuite(suite, tests, { passed: 0, failed: 0, skipped: 0 });
    }

    // Count results
    for (const test of tests) {
        switch (test.status) {
            case 'passed':
                passed++;
                break;
            case 'failed':
                failed++;
                break;
            case 'skipped':
                skipped++;
                break;
        }
    }

    const summary: TestResultSummary = {
        totalTests: tests.length,
        passed,
        failed,
        skipped,
        duration: report.stats?.duration || 0,
        startTime: new Date(report.stats?.startTime || Date.now()),
        endTime: new Date(report.stats?.endTime || Date.now()),
        environment: settings.testEnv,
        browserName: report.config?.projects?.[0]?.name || 'chromium',
    };

    return {
        summary,
        tests,
        projectName: 'Playwright E2E Tests',
        buildUrl: process.env.CI_JOB_URL || process.env.BUILD_URL || '#',
    };
}

/**
 * Recursively parse test suite
 */
function parseTestSuite(
    suite: Record<string, unknown>,
    tests: TestResult[],
    _counts: { passed: number; failed: number; skipped: number }
): void {
    // Parse specs (test cases)
    const specs = suite.specs as Array<Record<string, unknown>> | undefined;
    if (specs) {
        for (const spec of specs) {
            const results = spec.tests as Array<Record<string, unknown>> | undefined;
            if (results) {
                for (const result of results) {
                    const resultsList = result.results as Array<Record<string, unknown>> | undefined;
                    if (resultsList && resultsList.length > 0) {
                        const lastResult = resultsList[resultsList.length - 1];
                        tests.push({
                            name: spec.title as string,
                            status: lastResult.status as 'passed' | 'failed' | 'skipped',
                            duration: (lastResult.duration as number) || 0,
                            error: lastResult.error
                                ? (
                                    (lastResult.error as { message?: string }).message ||
                                    String(lastResult.error)
                                ).substring(0, 200)
                                : undefined,
                            retries: resultsList.length - 1,
                        });
                    }
                }
            }
        }
    }

    // Parse nested suites
    const nestedSuites = suite.suites as Array<Record<string, unknown>> | undefined;
    if (nestedSuites) {
        for (const nestedSuite of nestedSuites) {
            parseTestSuite(nestedSuite, tests, _counts);
        }
    }
}

/**
 * Main function
 */
async function main(): Promise<void> {
    logger.info('Starting email report generation...');

    try {
        // Find report file
        const reportPath = path.resolve(process.cwd(), 'reports/test-results.json');

        // Parse report
        logger.info(`Parsing report from: ${reportPath}`);
        const reportData = parsePlaywrightReport(reportPath);

        logger.info(`Found ${reportData.tests.length} tests`);
        logger.info(`Results: ${reportData.summary.passed} passed, ${reportData.summary.failed} failed, ${reportData.summary.skipped} skipped`);

        // Send email
        const reporter = new EmailReporter();

        // Verify connection first
        const connected = await reporter.verifyConnection();
        if (!connected) {
            throw new Error('Could not connect to SMTP server');
        }

        // Collect attachments (HTML report if exists)
        const attachments: string[] = [];
        const htmlReportPath = path.resolve(process.cwd(), 'playwright-report/index.html');
        if (fs.existsSync(htmlReportPath)) {
            // Zip the report folder for attachment
            logger.info('HTML report found, will include link in email');
        }

        // Send the report
        const sent = await reporter.sendReport(reportData, attachments);

        if (sent) {
            logger.info('✅ Email report sent successfully!');
        } else {
            throw new Error('Failed to send email report');
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Failed to send report: ${errorMessage}`);
        process.exit(1);
    }
}

// Run main function
main();
