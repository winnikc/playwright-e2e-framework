/**
 * Environment Configuration
 *
 * Defines the configuration for each environment (Dev, QA, UAT).
 * URLs can be modified per environment for future separation.
 */

export interface EnvironmentConfig {
    /** Base URL for the web application */
    baseUrl: string;
    /** API base URL for backend services */
    apiUrl: string;
    /** Environment name */
    name: 'dev' | 'qa' | 'uat';
    /** Optional: Additional environment-specific settings */
    timeout?: number;
}

/**
 * Environment configurations
 * TODO: Update URLs when environments have different domains
 */
export const environments: Record<string, EnvironmentConfig> = {
    dev: {
        name: 'dev',
        baseUrl: process.env.BASE_URL || 'https://www.saucedemo.com',
        apiUrl: process.env.API_BASE_URL || 'https://api.dev.example.com',
        timeout: 30000,
    },
    qa: {
        name: 'qa',
        baseUrl: process.env.BASE_URL || 'https://www.saucedemo.com',
        apiUrl: process.env.API_BASE_URL || 'https://api.qa.example.com',
        timeout: 30000,
    },
    uat: {
        name: 'uat',
        baseUrl: process.env.BASE_URL || 'https://www.saucedemo.com',
        apiUrl: process.env.API_BASE_URL || 'https://api.uat.example.com',
        timeout: 60000, // UAT may be slower
    },
};

/**
 * Get the current environment configuration
 */
export function getCurrentEnvironment(): EnvironmentConfig {
    const envName = process.env.TEST_ENV || 'qa';
    const env = environments[envName];

    if (!env) {
        throw new Error(`Unknown environment: ${envName}. Available: ${Object.keys(environments).join(', ')}`);
    }

    return env;
}

/**
 * Get environment by name
 */
export function getEnvironment(name: string): EnvironmentConfig {
    const env = environments[name];

    if (!env) {
        throw new Error(`Unknown environment: ${name}. Available: ${Object.keys(environments).join(', ')}`);
    }

    return env;
}
