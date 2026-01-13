/**
 * Test Data Loader
 *
 * Utility for loading test data from JSON or YAML files based on configuration.
 * Supports Data-Driven Testing by providing typed access to test data.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as YAML from 'yaml';
import { getDataFormat, DataFormat } from '../config/settings';
import { createLogger } from './Logger';

const logger = createLogger('TestDataLoader');

/**
 * Test data directory paths
 */
const DATA_DIRS: Record<DataFormat, string> = {
    json: path.resolve(process.cwd(), 'test-data/json'),
    yaml: path.resolve(process.cwd(), 'test-data/yaml'),
};

/**
 * Load test data from a file
 *
 * @param filename - Name of the file (without extension)
 * @param format - Optional format override (defaults to config setting)
 * @returns Parsed test data
 */
export function loadTestData<T>(filename: string, format?: DataFormat): T {
    const dataFormat = format || getDataFormat();
    const extension = dataFormat === 'json' ? '.json' : '.yaml';
    const dataDir = DATA_DIRS[dataFormat];
    const filePath = path.join(dataDir, `${filename}${extension}`);

    logger.debug(`Loading test data from: ${filePath}`);

    if (!fs.existsSync(filePath)) {
        throw new Error(`Test data file not found: ${filePath}`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');

    try {
        if (dataFormat === 'json') {
            return JSON.parse(fileContent) as T;
        } else {
            return YAML.parse(fileContent) as T;
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to parse ${dataFormat.toUpperCase()} file ${filePath}: ${errorMessage}`);
    }
}

/**
 * Load test data and return as array for data-driven tests
 *
 * @param filename - Name of the file (without extension)
 * @param arrayKey - Key of the array within the data file
 * @returns Array of test data items
 */
export function loadTestDataArray<T>(filename: string, arrayKey: string): T[] {
    const data = loadTestData<Record<string, T[]>>(filename);

    if (!data[arrayKey]) {
        throw new Error(`Key "${arrayKey}" not found in test data file: ${filename}`);
    }

    if (!Array.isArray(data[arrayKey])) {
        throw new Error(`Key "${arrayKey}" is not an array in test data file: ${filename}`);
    }

    return data[arrayKey];
}

/**
 * Get test data for a specific test case by ID
 *
 * @param filename - Name of the file (without extension)
 * @param arrayKey - Key of the array within the data file
 * @param testCaseId - ID of the test case to find
 * @param idKey - Key within each item that contains the ID (default: 'id')
 * @returns Single test data item
 */
export function getTestDataById<T extends Record<string, unknown>>(
    filename: string,
    arrayKey: string,
    testCaseId: string,
    idKey: string = 'id'
): T {
    const dataArray = loadTestDataArray<T>(filename, arrayKey);
    const testCase = dataArray.find((item) => item[idKey] === testCaseId);

    if (!testCase) {
        throw new Error(`Test case with ${idKey}="${testCaseId}" not found in ${filename}.${arrayKey}`);
    }

    return testCase;
}

/**
 * Interface for parameterized test data
 */
export interface ParameterizedTestData<T> {
    /** Test case name/description */
    name: string;
    /** Test data */
    data: T;
    /** Optional tags for filtering */
    tags?: string[];
    /** Optional Squash TM test case ID */
    squashId?: string;
}

/**
 * Transform test data array into parameterized test format
 *
 * @param filename - Name of the file (without extension)
 * @param arrayKey - Key of the array within the data file
 * @param nameKey - Key to use for test name
 * @returns Array of parameterized test data
 */
export function toParameterizedTests<T extends Record<string, unknown>>(
    filename: string,
    arrayKey: string,
    nameKey: string = 'name'
): ParameterizedTestData<T>[] {
    const dataArray = loadTestDataArray<T>(filename, arrayKey);

    return dataArray.map((item, index) => ({
        name: (item[nameKey] as string) || `Test Case ${index + 1}`,
        data: item,
        tags: item['tags'] as string[] | undefined,
        squashId: item['squashId'] as string | undefined,
    }));
}
