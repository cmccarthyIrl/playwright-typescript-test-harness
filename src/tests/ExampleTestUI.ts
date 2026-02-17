import { expect } from '@playwright/test';
import { test } from '../fixtures/PageFixtures';
import { Logger } from '../utils/Logger';

/**
 * Wikipedia Test Suite
 * Tests navigation from Wikipedia to Wikimedia Commons
 */
test.describe('Wikipedia Navigation Test', () => {
  const logger = Logger.for('UI.WikipediaTest');

  test.beforeEach(async () => {
    logger.info('🚀 Starting Wikipedia test setup');
  });

  test('should navigate from Wikipedia to Wikimedia Commons', async ({
    wikipediaHomePage,
    wikimediaCommonsPage,
    page,
  }, testInfo) => {
    logger.info('📋 Starting Wikipedia navigation test - 4 steps');

    // Step 1: Navigate to Wikipedia homepage
    await test.step('Step 1: Navigate to Wikipedia homepage', async () => {
      logger.info('Step 1: Navigating to https://www.wikipedia.org/');
      await wikipediaHomePage.navigate();

      await testInfo.attach('step-1-wikipedia-home', {
        body: await page.screenshot(),
        contentType: 'image/png'
      });
      logger.info('✅ Step 1 complete: Wikipedia homepage loaded');
    });

    // Step 2: Verify the page URL contains 'wikipedia'
    await test.step('Step 2: Verify page URL contains "wikipedia"', async () => {
      logger.info('Step 2: Verifying URL contains "wikipedia"');
      const currentUrl = wikipediaHomePage.getPageUrl();

      expect(currentUrl.toLowerCase()).toContain('wikipedia');
      logger.info(`✅ Step 2 complete: URL verified - ${currentUrl}`);

      await testInfo.attach('step-2-url-verification', {
        body: await page.screenshot(),
        contentType: 'image/png'
      });
    });

    // Step 3: Click the Commons link
    await test.step('Step 3: Click the Commons link', async () => {
      logger.info('Step 3: Clicking the Commons link');
      await wikipediaHomePage.clickCommonsLink();

      await testInfo.attach('step-3-commons-click', {
        body: await page.screenshot(),
        contentType: 'image/png'
      });
      logger.info('✅ Step 3 complete: Commons link clicked');
    });

    // Step 4: Verify the page title contains 'Wikimedia Commons'
    await test.step('Step 4: Verify page title contains "Wikimedia Commons"', async () => {
      logger.info('Step 4: Verifying page title contains "Wikimedia Commons"');
      const pageTitle = await wikimediaCommonsPage.getPageTitle();

      expect(pageTitle).toContain('Wikimedia Commons');
      logger.info(`✅ Step 4 complete: Page title verified - ${pageTitle}`);

      await testInfo.attach('step-4-title-verification', {
        body: await page.screenshot(),
        contentType: 'image/png'
      });
    });

    logger.info('🎉 Wikipedia navigation test completed successfully');
  });

  test.afterEach(async ({ page }) => {
    logger.info('🧹 Test cleanup and final validation');

    // Take final screenshot for evidence
    await page.screenshot({
      path: `./reports/test-results/wikipedia-test-final-${Date.now()}.png`,
      fullPage: true,
    });

    logger.info('Test completed with final screenshot captured');
  });
});
