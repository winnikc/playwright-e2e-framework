/**
 * API Tests Example
 *
 * Demonstrates API testing structure using JSONPlaceholder as public API.
 * Follows AAA pattern and uses the ApiClient.
 */

import { test, expect } from '@playwright/test';
import { ApiClient, ApiResponse } from '../../src/api/ApiClient';
import { createLogger } from '../../src/utils/Logger';

const logger = createLogger('ApiTests');

/**
 * JSONPlaceholder Post interface
 */
interface Post {
    id: number;
    userId: number;
    title: string;
    body: string;
}

/**
 * JSONPlaceholder User interface
 */
interface User {
    id: number;
    name: string;
    username: string;
    email: string;
}

/**
 * API test suite
 */
test.describe('API Tests @api @regression', () => {
    let apiClient: ApiClient;

    /**
     * Setup API client before tests
     */
    test.beforeAll(() => {
        // Using JSONPlaceholder as public test API
        apiClient = new ApiClient('https://jsonplaceholder.typicode.com');
    });

    /**
     * GET request test
     */
    test('GET /posts - should return list of posts', async () => {
        logger.testStart('GET /posts - should return list of posts');
        const startTime = Date.now();

        try {
            // ARRANGE
            logger.step(1, 'Prepare API request');
            // No special setup needed for this test

            // ACT
            logger.step(2, 'Execute GET request to /posts');
            const response: ApiResponse<Post[]> = await apiClient.get<Post[]>('/posts');

            // ASSERT
            logger.step(3, 'Verify response');
            expect(response.status).toBe(200);
            expect(response.data).toBeInstanceOf(Array);
            expect(response.data.length).toBeGreaterThan(0);

            // Verify first post structure
            const firstPost = response.data[0];
            expect(firstPost).toHaveProperty('id');
            expect(firstPost).toHaveProperty('userId');
            expect(firstPost).toHaveProperty('title');
            expect(firstPost).toHaveProperty('body');

            const duration = Date.now() - startTime;
            logger.testPass('GET /posts', duration);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.testFail('GET /posts', errorMessage);
            throw error;
        }
    });

    /**
     * GET single resource test
     */
    test('GET /posts/:id - should return single post', async () => {
        logger.testStart('GET /posts/:id - should return single post');
        const startTime = Date.now();

        try {
            // ARRANGE
            logger.step(1, 'Set post ID to fetch');
            const postId = 1;

            // ACT
            logger.step(2, `Execute GET request to /posts/${postId}`);
            const response: ApiResponse<Post> = await apiClient.get<Post>(`/posts/${postId}`);

            // ASSERT
            logger.step(3, 'Verify response');
            expect(response.status).toBe(200);
            expect(response.data.id).toBe(postId);
            expect(response.data.title).toBeTruthy();

            const duration = Date.now() - startTime;
            logger.testPass('GET /posts/:id', duration);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.testFail('GET /posts/:id', errorMessage);
            throw error;
        }
    });

    /**
     * POST request test
     */
    test('POST /posts - should create new post', async () => {
        logger.testStart('POST /posts - should create new post');
        const startTime = Date.now();

        try {
            // ARRANGE
            logger.step(1, 'Prepare new post data');
            const newPost = {
                title: 'Test Post Title',
                body: 'This is a test post body created by Playwright API test',
                userId: 1,
            };

            // ACT
            logger.step(2, 'Execute POST request to /posts');
            const response: ApiResponse<Post> = await apiClient.post<Post>('/posts', newPost);

            // ASSERT
            logger.step(3, 'Verify response');
            expect(response.status).toBe(201);
            expect(response.data.title).toBe(newPost.title);
            expect(response.data.body).toBe(newPost.body);
            expect(response.data.userId).toBe(newPost.userId);
            expect(response.data.id).toBeTruthy();

            const duration = Date.now() - startTime;
            logger.testPass('POST /posts', duration);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.testFail('POST /posts', errorMessage);
            throw error;
        }
    });

    /**
     * PUT request test
     */
    test('PUT /posts/:id - should update existing post', async () => {
        logger.testStart('PUT /posts/:id - should update existing post');
        const startTime = Date.now();

        try {
            // ARRANGE
            logger.step(1, 'Prepare update data');
            const postId = 1;
            const updatedPost = {
                id: postId,
                title: 'Updated Title',
                body: 'Updated body content',
                userId: 1,
            };

            // ACT
            logger.step(2, `Execute PUT request to /posts/${postId}`);
            const response: ApiResponse<Post> = await apiClient.put<Post>(
                `/posts/${postId}`,
                updatedPost
            );

            // ASSERT
            logger.step(3, 'Verify response');
            expect(response.status).toBe(200);
            expect(response.data.id).toBe(postId);
            expect(response.data.title).toBe(updatedPost.title);
            expect(response.data.body).toBe(updatedPost.body);

            const duration = Date.now() - startTime;
            logger.testPass('PUT /posts/:id', duration);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.testFail('PUT /posts/:id', errorMessage);
            throw error;
        }
    });

    /**
     * DELETE request test
     */
    test('DELETE /posts/:id - should delete post', async () => {
        logger.testStart('DELETE /posts/:id - should delete post');
        const startTime = Date.now();

        try {
            // ARRANGE
            logger.step(1, 'Set post ID to delete');
            const postId = 1;

            // ACT
            logger.step(2, `Execute DELETE request to /posts/${postId}`);
            const response = await apiClient.delete(`/posts/${postId}`);

            // ASSERT
            logger.step(3, 'Verify response');
            expect(response.status).toBe(200);

            const duration = Date.now() - startTime;
            logger.testPass('DELETE /posts/:id', duration);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.testFail('DELETE /posts/:id', errorMessage);
            throw error;
        }
    });

    /**
     * GET with query parameters test
     */
    test('GET /posts with query params - should filter by userId', async () => {
        logger.testStart('GET /posts with query params');
        const startTime = Date.now();

        try {
            // ARRANGE
            logger.step(1, 'Set filter parameters');
            const userId = 1;

            // ACT
            logger.step(2, `Execute GET request to /posts with userId=${userId}`);
            const response: ApiResponse<Post[]> = await apiClient.get<Post[]>('/posts', { userId });

            // ASSERT
            logger.step(3, 'Verify all posts belong to user');
            expect(response.status).toBe(200);
            expect(response.data).toBeInstanceOf(Array);
            response.data.forEach((post) => {
                expect(post.userId).toBe(userId);
            });

            const duration = Date.now() - startTime;
            logger.testPass('GET /posts with query params', duration);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.testFail('GET /posts with query params', errorMessage);
            throw error;
        }
    });

    /**
     * Nested resource test
     */
    test('GET /users/:id - should return user with email', async () => {
        logger.testStart('GET /users/:id');
        const startTime = Date.now();

        try {
            // ARRANGE
            logger.step(1, 'Set user ID');
            const userId = 1;

            // ACT
            logger.step(2, `Execute GET request to /users/${userId}`);
            const response: ApiResponse<User> = await apiClient.get<User>(`/users/${userId}`);

            // ASSERT
            logger.step(3, 'Verify user data');
            expect(response.status).toBe(200);
            expect(response.data.id).toBe(userId);
            expect(response.data.email).toMatch(/@/); // Basic email validation
            expect(response.data.name).toBeTruthy();
            expect(response.data.username).toBeTruthy();

            const duration = Date.now() - startTime;
            logger.testPass('GET /users/:id', duration);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.testFail('GET /users/:id', errorMessage);
            throw error;
        }
    });
});
