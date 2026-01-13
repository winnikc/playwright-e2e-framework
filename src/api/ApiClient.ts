/**
 * API Client
 *
 * Base API client for REST API testing.
 * Features:
 * - Axios-based HTTP client
 * - Environment-aware configuration
 * - Request/response logging
 * - Authentication support
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getCurrentEnvironment } from '../config/environments';
import { createLogger } from '../utils/Logger';

const logger = createLogger('ApiClient');

/**
 * API response wrapper
 */
export interface ApiResponse<T = unknown> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    duration: number;
}

/**
 * API error interface
 */
export interface ApiError {
    message: string;
    status?: number;
    data?: unknown;
}

/**
 * Base API Client class
 */
export class ApiClient {
    protected readonly client: AxiosInstance;
    protected readonly baseUrl: string;

    constructor(baseUrl?: string) {
        const env = getCurrentEnvironment();
        this.baseUrl = baseUrl || env.apiUrl;

        this.client = axios.create({
            baseURL: this.baseUrl,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        });

        // Request interceptor for logging
        this.client.interceptors.request.use(
            (config) => {
                logger.debug(`→ ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            },
            (error) => {
                logger.error('Request error', error);
                return Promise.reject(error);
            }
        );

        // Response interceptor for logging
        this.client.interceptors.response.use(
            (response) => {
                logger.debug(`← ${response.status} ${response.config.url}`);
                return response;
            },
            (error) => {
                if (error.response) {
                    logger.error(`← ${error.response.status} ${error.config?.url}`);
                }
                return Promise.reject(error);
            }
        );
    }

    /**
     * Set authorization header
     */
    setAuthToken(token: string, type: 'Bearer' | 'Basic' = 'Bearer'): void {
        this.client.defaults.headers.common['Authorization'] = `${type} ${token}`;
    }

    /**
     * Clear authorization header
     */
    clearAuthToken(): void {
        delete this.client.defaults.headers.common['Authorization'];
    }

    /**
     * Set custom header
     */
    setHeader(name: string, value: string): void {
        this.client.defaults.headers.common[name] = value;
    }

    /**
     * Execute request and wrap response
     */
    private async executeRequest<T>(
        config: AxiosRequestConfig
    ): Promise<ApiResponse<T>> {
        const startTime = Date.now();

        try {
            const response: AxiosResponse<T> = await this.client.request(config);
            const duration = Date.now() - startTime;

            return {
                data: response.data,
                status: response.status,
                statusText: response.statusText,
                headers: response.headers as Record<string, string>,
                duration,
            };
        } catch (error) {
            const duration = Date.now() - startTime;

            if (axios.isAxiosError(error) && error.response) {
                return {
                    data: error.response.data as T,
                    status: error.response.status,
                    statusText: error.response.statusText,
                    headers: error.response.headers as Record<string, string>,
                    duration,
                };
            }

            throw error;
        }
    }

    /**
     * GET request
     */
    async get<T = unknown>(
        url: string,
        params?: Record<string, unknown>,
        config?: AxiosRequestConfig
    ): Promise<ApiResponse<T>> {
        logger.info(`GET ${url}`);
        return this.executeRequest<T>({
            method: 'GET',
            url,
            params,
            ...config,
        });
    }

    /**
     * POST request
     */
    async post<T = unknown>(
        url: string,
        data?: unknown,
        config?: AxiosRequestConfig
    ): Promise<ApiResponse<T>> {
        logger.info(`POST ${url}`);
        return this.executeRequest<T>({
            method: 'POST',
            url,
            data,
            ...config,
        });
    }

    /**
     * PUT request
     */
    async put<T = unknown>(
        url: string,
        data?: unknown,
        config?: AxiosRequestConfig
    ): Promise<ApiResponse<T>> {
        logger.info(`PUT ${url}`);
        return this.executeRequest<T>({
            method: 'PUT',
            url,
            data,
            ...config,
        });
    }

    /**
     * PATCH request
     */
    async patch<T = unknown>(
        url: string,
        data?: unknown,
        config?: AxiosRequestConfig
    ): Promise<ApiResponse<T>> {
        logger.info(`PATCH ${url}`);
        return this.executeRequest<T>({
            method: 'PATCH',
            url,
            data,
            ...config,
        });
    }

    /**
     * DELETE request
     */
    async delete<T = unknown>(
        url: string,
        config?: AxiosRequestConfig
    ): Promise<ApiResponse<T>> {
        logger.info(`DELETE ${url}`);
        return this.executeRequest<T>({
            method: 'DELETE',
            url,
            ...config,
        });
    }

    /**
     * Upload file
     */
    async upload<T = unknown>(
        url: string,
        file: Buffer | Blob,
        filename: string,
        additionalData?: Record<string, string>
    ): Promise<ApiResponse<T>> {
        logger.info(`UPLOAD ${url}`);

        const formData = new FormData();
        formData.append('file', new Blob([file]), filename);

        if (additionalData) {
            Object.entries(additionalData).forEach(([key, value]) => {
                formData.append(key, value);
            });
        }

        return this.executeRequest<T>({
            method: 'POST',
            url,
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }
}

/**
 * Create API client instance
 */
export function createApiClient(baseUrl?: string): ApiClient {
    return new ApiClient(baseUrl);
}
