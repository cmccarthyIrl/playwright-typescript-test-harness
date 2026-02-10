import { expect, test } from '@playwright/test';
import { Logger } from '../utils/Logger';

/**
 * API Test Suite Example
 * Demonstrates API testing capabilities with Playwright
 */
test.describe('API Tests', () => {
  const logger = Logger.for('API.Tests');

  test.beforeEach(async () => {
    logger.info('🚀 Starting API test setup');
  });

  test('should verify API endpoint returns valid response', async ({ request }) => {
    logger.info('📋 Starting API test - health check');

    await test.step('Step 1: Make GET request to API endpoint', async () => {
      logger.info('Step 1: Making GET request to JSONPlaceholder API');

      const response = await request.get('https://jsonplaceholder.typicode.com/posts/1');

      // Verify response status
      expect(response.status()).toBe(200);
      logger.info('✅ Step 1 complete: API responded with 200 OK');
    });

    await test.step('Step 2: Verify response body structure', async () => {
      logger.info('Step 2: Verifying response body structure');

      const response = await request.get('https://jsonplaceholder.typicode.com/posts/1');
      const responseBody = await response.json();

      // Verify response contains expected fields
      expect(responseBody).toHaveProperty('userId');
      expect(responseBody).toHaveProperty('id');
      expect(responseBody).toHaveProperty('title');
      expect(responseBody).toHaveProperty('body');

      logger.info(`✅ Step 2 complete: Response body validated - Post ID: ${responseBody.id}`);
    });

    logger.info('🎉 API test completed successfully');
  });

  test.afterEach(async () => {
    logger.info('🧹 Test cleanup completed');
  });
});
