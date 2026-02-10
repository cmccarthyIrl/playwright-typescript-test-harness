import { Page } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Wikimedia Commons Page Object
 */
export class WikimediaCommonsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Get the page title
   */
  async getPageTitle(): Promise<string> {
    this.logger.info('Getting page title');
    const title = await this.page.title();
    this.logger.info(`Page title: ${title}`);
    return title;
  }

  /**
   * Get the current page URL
   */
  getPageUrl(): string {
    return this.page.url();
  }
}
