import { test as base } from '@playwright/test';
import { WikimediaCommonsPage } from '../pages/wikipedia/WikimediaCommonsPage';
import { WikipediaHomePage } from '../pages/wikipedia/WikipediaHomePage';
import { Logger, LogLevel } from '../utils/Logger';

// Configure Logger for E2E tests
Logger.configure({
  level: LogLevel.DEBUG,
  enableFileLogging: true,
  logFile: 'logs/e2e-complete-flow.log',
  enableTimestamps: true,
  context: 'E2E-CompleteFlow',
});

/**
 * Custom fixtures for Daimler Truck tests
 * Extends the base Playwright test with page objects
 */
type PageFixtures = {
  wikipediaHomePage: WikipediaHomePage;
  wikimediaCommonsPage: WikimediaCommonsPage;
};

/**
 * Extended test with custom fixtures
 * Usage: import { test, expect } from './fixtures/pageFixtures';
 */
export const test = base.extend<PageFixtures>({

  /**
   * WikipediaHomePage fixture
   * Automatically creates a new WikipediaHomePage instance for each test
   */
  wikipediaHomePage: async ({ page }, use) => {
    const wikipediaHomePage = new WikipediaHomePage(page);
    await use(wikipediaHomePage);
  },

  /**
   * WikimediaCommonsPage fixture
   * Automatically creates a new WikimediaCommonsPage instance for each test
   */
  wikimediaCommonsPage: async ({ page }, use) => {
    const wikimediaCommonsPage = new WikimediaCommonsPage(page);
    await use(wikimediaCommonsPage);
  },
});

/**
 * Export expect from Playwright for convenience
 */
export { expect } from '@playwright/test';
