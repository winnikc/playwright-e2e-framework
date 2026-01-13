/**
 * Global Settings Configuration
 *
 * Central configuration for framework-wide settings.
 * Values are loaded from environment variables with sensible defaults.
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment-specific configuration
const testEnv = process.env.TEST_ENV || 'qa';
const envPath = path.resolve(process.cwd(), `envs/.env.${testEnv}`);
dotenv.config({ path: envPath });
dotenv.config({ path: path.resolve(process.cwd(), 'envs/.env.example') });

/**
 * Data format configuration for test data files
 */
export type DataFormat = 'json' | 'yaml';

/**
 * Global settings interface
 */
export interface Settings {
    /** Current test environment */
    testEnv: string;
    /** Data format for test data files */
    dataFormat: DataFormat;
    /** Whether to report results to Squash TM */
    reportToSquash: boolean;
    /** Squash TM configuration */
    squashTM: {
        url: string;
        apiToken: string;
        campaignId: string;
    };
    /** Email configuration */
    email: {
        host: string;
        port: number;
        secure: boolean;
        user: string;
        password: string;
        recipients: string[];
        from: string;
    };
    /** AI/MCP configuration */
    geminiApiKey: string;
    /** CI mode flag */
    isCI: boolean;
    /** Number of parallel workers */
    workers: number;
}

/**
 * Parse boolean from environment variable
 */
function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
    if (value === undefined) {
        return defaultValue;
    }
    return value.toLowerCase() === 'true';
}

/**
 * Parse integer from environment variable
 */
function parseInt(value: string | undefined, defaultValue: number): number {
    if (value === undefined) {
        return defaultValue;
    }
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Global settings instance
 */
export const settings: Settings = {
    testEnv: process.env.TEST_ENV || 'qa',
    dataFormat: (process.env.DATA_FORMAT as DataFormat) || 'json',
    reportToSquash: parseBoolean(process.env.REPORT_TO_SQUASH, false),
    squashTM: {
        url: process.env.SQUASH_TM_URL || 'https://demo.squashtest.org',
        apiToken: process.env.SQUASH_TM_API_TOKEN || '',
        campaignId: process.env.SQUASH_TM_CAMPAIGN_ID || '4',
    },
    email: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT, 587),
        secure: parseBoolean(process.env.SMTP_SECURE, false),
        user: process.env.SMTP_USER || '',
        password: process.env.SMTP_PASSWORD || '',
        recipients: (process.env.EMAIL_RECIPIENTS || 'cezarywinnik@gmail.com').split(',').map((e) => e.trim()),
        from: process.env.EMAIL_FROM || 'test-reports@example.com',
    },
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    isCI: parseBoolean(process.env.CI, false),
    workers: parseInt(process.env.WORKERS, 4),
};

/**
 * Get a specific setting value
 */
export function getSetting<K extends keyof Settings>(key: K): Settings[K] {
    return settings[key];
}

/**
 * Check if running in CI environment
 */
export function isCI(): boolean {
    return settings.isCI;
}

/**
 * Get data format preference
 */
export function getDataFormat(): DataFormat {
    return settings.dataFormat;
}
