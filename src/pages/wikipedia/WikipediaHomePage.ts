import { Locator, Page } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Wikipedia Home Page Object
 */
export class WikipediaHomePage extends BasePage {
  readonly url = 'https://www.wikipedia.org/';

  // Locators
  readonly commonsLink: Locator;

  constructor(page: Page) {
    super(page);
    
    this.commonsLink = this.page.locator('a:has(.other-project-title[data-jsl10n="commons.name"])');
  }

  /**
   * Navigate to Wikipedia homepage
   */
  async navigate(): Promise<void> {
    this.logger.info('Navigating to Wikipedia homepage');
    await this.page.goto(this.url);
    await this.waitForPageLoad();
    this.logger.info('Wikipedia homepage loaded');
  }

  /**
   * Click the Commons link
   */
  async clickCommonsLink(): Promise<void> {
    this.logger.info('Clicking Commons link');
    await this.commonsLink.click();
    await this.waitForPageLoad();
    this.logger.info('Commons link clicked');
  }

  /**
   * Get the current page URL
   */
  getPageUrl(): string {
    return this.page.url();
  }
}
