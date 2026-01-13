/**
 * Email Reporter
 *
 * Sends test execution reports via email using SMTP.
 * Features:
 * - HTML formatted reports
 * - Customizable template
 * - Multiple recipients support
 * - Attachment support
 */

import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import { settings } from '../config/settings';
import { createLogger } from './Logger';

const logger = createLogger('EmailReporter');

/**
 * Test result summary interface
 */
export interface TestResultSummary {
    totalTests: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number; // in milliseconds
    startTime: Date;
    endTime: Date;
    environment: string;
    browserName?: string;
}

/**
 * Individual test result
 */
export interface TestResult {
    name: string;
    status: 'passed' | 'failed' | 'skipped';
    duration: number;
    error?: string;
    retries?: number;
}

/**
 * Email report data
 */
export interface EmailReportData {
    summary: TestResultSummary;
    tests: TestResult[];
    projectName?: string;
    buildUrl?: string;
}

/**
 * Email Reporter class
 */
export class EmailReporter {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: settings.email.host,
            port: settings.email.port,
            secure: settings.email.secure,
            auth: {
                user: settings.email.user,
                pass: settings.email.password,
            },
        });
    }

    /**
     * Send test report email
     */
    async sendReport(data: EmailReportData, attachmentPaths?: string[]): Promise<boolean> {
        try {
            logger.info('Preparing email report...');

            const htmlContent = await this.generateHtmlReport(data);
            const subject = this.generateSubject(data.summary);

            const attachments = this.prepareAttachments(attachmentPaths);

            const mailOptions: nodemailer.SendMailOptions = {
                from: settings.email.from,
                to: settings.email.recipients.join(', '),
                subject: subject,
                html: htmlContent,
                attachments: attachments,
            };

            await this.transporter.sendMail(mailOptions);
            logger.info(`Report sent to: ${settings.email.recipients.join(', ')}`);
            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(`Failed to send email report: ${errorMessage}`);
            return false;
        }
    }

    /**
     * Generate email subject based on results
     */
    private generateSubject(summary: TestResultSummary): string {
        const status = summary.failed > 0 ? '❌ FAILED' : '✅ PASSED';
        const passRate = Math.round((summary.passed / summary.totalTests) * 100);
        return `${status} | Test Report | ${passRate}% Pass Rate | ${summary.environment.toUpperCase()} | ${summary.totalTests} Tests`;
    }

    /**
     * Generate HTML report from template
     */
    private async generateHtmlReport(data: EmailReportData): Promise<string> {
        const templatePath = path.resolve(process.cwd(), 'templates/email-report.html');

        let template: string;
        if (fs.existsSync(templatePath)) {
            template = fs.readFileSync(templatePath, 'utf-8');
        } else {
            template = this.getDefaultTemplate();
        }

        // Replace placeholders
        const passRate = Math.round((data.summary.passed / data.summary.totalTests) * 100);
        const durationMinutes = Math.round(data.summary.duration / 60000);

        let html = template
            .replace(/{{PROJECT_NAME}}/g, data.projectName || 'Playwright E2E Tests')
            .replace(/{{ENVIRONMENT}}/g, data.summary.environment.toUpperCase())
            .replace(/{{TOTAL_TESTS}}/g, String(data.summary.totalTests))
            .replace(/{{PASSED}}/g, String(data.summary.passed))
            .replace(/{{FAILED}}/g, String(data.summary.failed))
            .replace(/{{SKIPPED}}/g, String(data.summary.skipped))
            .replace(/{{PASS_RATE}}/g, String(passRate))
            .replace(/{{DURATION}}/g, `${durationMinutes} min`)
            .replace(/{{START_TIME}}/g, data.summary.startTime.toISOString())
            .replace(/{{END_TIME}}/g, data.summary.endTime.toISOString())
            .replace(/{{STATUS_EMOJI}}/g, data.summary.failed > 0 ? '❌' : '✅')
            .replace(/{{STATUS_COLOR}}/g, data.summary.failed > 0 ? '#dc3545' : '#28a745')
            .replace(/{{BUILD_URL}}/g, data.buildUrl || '#');

        // Generate test results table
        const testRows = data.tests
            .map(
                (test) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${test.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">
          <span style="color: ${this.getStatusColor(test.status)}; font-weight: bold;">
            ${this.getStatusEmoji(test.status)} ${test.status.toUpperCase()}
          </span>
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${test.duration}ms</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; color: #dc3545;">${test.error || '-'}</td>
      </tr>
    `
            )
            .join('');

        html = html.replace('{{TEST_RESULTS_ROWS}}', testRows);

        return html;
    }

    /**
     * Get default HTML template
     */
    private getDefaultTemplate(): string {
        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Test Report</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
  <div style="max-width: 800px; margin: 0 auto; background-color: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="background-color: {{STATUS_COLOR}}; color: white; padding: 20px; text-align: center;">
      <h1 style="margin: 0;">{{STATUS_EMOJI}} {{PROJECT_NAME}}</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Environment: {{ENVIRONMENT}}</p>
    </div>
    
    <!-- Summary -->
    <div style="padding: 20px;">
      <h2 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">Summary</h2>
      <div style="display: flex; flex-wrap: wrap; gap: 20px;">
        <div style="flex: 1; min-width: 150px; background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: #333;">{{TOTAL_TESTS}}</div>
          <div style="color: #666;">Total Tests</div>
        </div>
        <div style="flex: 1; min-width: 150px; background: #d4edda; padding: 15px; border-radius: 8px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: #28a745;">{{PASSED}}</div>
          <div style="color: #666;">Passed</div>
        </div>
        <div style="flex: 1; min-width: 150px; background: #f8d7da; padding: 15px; border-radius: 8px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: #dc3545;">{{FAILED}}</div>
          <div style="color: #666;">Failed</div>
        </div>
        <div style="flex: 1; min-width: 150px; background: #fff3cd; padding: 15px; border-radius: 8px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: #856404;">{{SKIPPED}}</div>
          <div style="color: #666;">Skipped</div>
        </div>
      </div>
      
      <div style="margin-top: 20px; padding: 15px; background: #e9ecef; border-radius: 8px;">
        <p style="margin: 5px 0;"><strong>Pass Rate:</strong> {{PASS_RATE}}%</p>
        <p style="margin: 5px 0;"><strong>Duration:</strong> {{DURATION}}</p>
        <p style="margin: 5px 0;"><strong>Started:</strong> {{START_TIME}}</p>
        <p style="margin: 5px 0;"><strong>Ended:</strong> {{END_TIME}}</p>
      </div>
    </div>
    
    <!-- Test Results -->
    <div style="padding: 20px;">
      <h2 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">Test Results</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Test Name</th>
            <th style="padding: 12px; text-align: center; border-bottom: 2px solid #dee2e6;">Status</th>
            <th style="padding: 12px; text-align: center; border-bottom: 2px solid #dee2e6;">Duration</th>
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Error</th>
          </tr>
        </thead>
        <tbody>
          {{TEST_RESULTS_ROWS}}
        </tbody>
      </table>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 15px; text-align: center; color: #666;">
      <p style="margin: 0;">Generated by Playwright E2E Framework</p>
      <p style="margin: 5px 0 0 0;"><a href="{{BUILD_URL}}" style="color: #007bff;">View Full Report</a></p>
    </div>
  </div>
</body>
</html>
    `;
    }

    /**
     * Get status color
     */
    private getStatusColor(status: string): string {
        switch (status) {
            case 'passed':
                return '#28a745';
            case 'failed':
                return '#dc3545';
            case 'skipped':
                return '#856404';
            default:
                return '#666';
        }
    }

    /**
     * Get status emoji
     */
    private getStatusEmoji(status: string): string {
        switch (status) {
            case 'passed':
                return '✅';
            case 'failed':
                return '❌';
            case 'skipped':
                return '⏭️';
            default:
                return '❓';
        }
    }

    /**
     * Prepare email attachments
     */
    private prepareAttachments(attachmentPaths?: string[]): nodemailer.Attachment[] {
        if (!attachmentPaths || attachmentPaths.length === 0) {
            return [];
        }

        return attachmentPaths
            .filter((filePath) => fs.existsSync(filePath))
            .map((filePath) => ({
                filename: path.basename(filePath),
                path: filePath,
            }));
    }

    /**
     * Verify SMTP connection
     */
    async verifyConnection(): Promise<boolean> {
        try {
            await this.transporter.verify();
            logger.info('SMTP connection verified');
            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(`SMTP connection failed: ${errorMessage}`);
            return false;
        }
    }
}

/**
 * Create email reporter instance
 */
export function createEmailReporter(): EmailReporter {
    return new EmailReporter();
}
