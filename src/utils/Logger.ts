/**
 * Custom Logger with Emoji Icons
 *
 * Provides structured logging for test execution with visual indicators:
 * 🚀 Test Started
 * ✅ PASS (green)
 * ❌ FAIL (red)
 * ⚠️ Warning
 * ℹ️ Info
 */

import * as winston from 'winston';
import chalk from 'chalk';

/**
 * Log levels enum
 */
export enum LogLevel {
    ERROR = 'error',
    WARN = 'warn',
    INFO = 'info',
    DEBUG = 'debug',
}

/**
 * Custom format for console output with colors and emojis
 */
const consoleFormat = winston.format.printf(({ level, message, timestamp }) => {
    const ts = timestamp as string;

    switch (level) {
        case 'error':
            return `${ts} ${chalk.red('❌ FAIL')} ${message}`;
        case 'warn':
            return `${ts} ${chalk.yellow('⚠️  WARN')} ${message}`;
        case 'info':
            return `${ts} ${chalk.blue('ℹ️  INFO')} ${message}`;
        case 'debug':
            return `${ts} ${chalk.gray('🔍 DEBUG')} ${message}`;
        default:
            return `${ts} ${message}`;
    }
});

/**
 * File format without colors
 */
const fileFormat = winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level.toUpperCase()}] ${message}`;
});

/**
 * Create Winston logger instance
 */
const winstonLogger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })),
    transports: [
        // Console transport with colors
        new winston.transports.Console({
            format: winston.format.combine(winston.format.timestamp({ format: 'HH:mm:ss' }), consoleFormat),
        }),
        // File transport for all logs
        new winston.transports.File({
            filename: 'reports/test-execution.log',
            format: winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), fileFormat),
        }),
    ],
});

/**
 * Logger class providing test-specific logging methods
 */
export class Logger {
    private context: string;

    constructor(context: string = 'Test') {
        this.context = context;
    }

    /**
     * Log test start with rocket emoji
     */
    testStart(testName: string): void {
        console.log(`\n${chalk.cyan('🚀 Test Started:')} ${chalk.bold(testName)}`);
        winstonLogger.info(`[${this.context}] Test Started: ${testName}`);
    }

    /**
     * Log test pass with green checkmark
     */
    testPass(testName: string, duration?: number): void {
        const durationStr = duration ? ` (${duration}ms)` : '';
        console.log(`${chalk.green('✅ PASS:')} ${testName}${durationStr}`);
        winstonLogger.info(`[${this.context}] PASS: ${testName}${durationStr}`);
    }

    /**
     * Log test fail with red X
     */
    testFail(testName: string, error?: string): void {
        const errorStr = error ? ` - ${error}` : '';
        console.log(`${chalk.red('❌ FAIL:')} ${testName}${errorStr}`);
        winstonLogger.error(`[${this.context}] FAIL: ${testName}${errorStr}`);
    }

    /**
     * Log test skip with yellow warning
     */
    testSkip(testName: string, reason?: string): void {
        const reasonStr = reason ? ` - ${reason}` : '';
        console.log(`${chalk.yellow('⏭️  SKIP:')} ${testName}${reasonStr}`);
        winstonLogger.warn(`[${this.context}] SKIP: ${testName}${reasonStr}`);
    }

    /**
     * Log info message
     */
    info(message: string): void {
        winstonLogger.info(`[${this.context}] ${message}`);
    }

    /**
     * Log warning message
     */
    warn(message: string): void {
        winstonLogger.warn(`[${this.context}] ${message}`);
    }

    /**
     * Log error message
     */
    error(message: string, error?: Error): void {
        const errorDetails = error ? ` | ${error.message}` : '';
        winstonLogger.error(`[${this.context}] ${message}${errorDetails}`);
    }

    /**
     * Log debug message
     */
    debug(message: string): void {
        winstonLogger.debug(`[${this.context}] ${message}`);
    }

    /**
     * Log step in test execution
     */
    step(stepNumber: number, description: string): void {
        console.log(`  ${chalk.gray(`Step ${stepNumber}:`)} ${description}`);
        winstonLogger.info(`[${this.context}] Step ${stepNumber}: ${description}`);
    }

    /**
     * Log action being performed
     */
    action(action: string): void {
        console.log(`  ${chalk.magenta('→')} ${action}`);
        winstonLogger.debug(`[${this.context}] Action: ${action}`);
    }

    /**
     * Log assertion
     */
    assertion(description: string): void {
        console.log(`  ${chalk.cyan('✓')} ${description}`);
        winstonLogger.debug(`[${this.context}] Assert: ${description}`);
    }
}

/**
 * Create a logger instance with optional context
 */
export function createLogger(context?: string): Logger {
    return new Logger(context);
}

/**
 * Default logger instance
 */
export const logger = new Logger();
