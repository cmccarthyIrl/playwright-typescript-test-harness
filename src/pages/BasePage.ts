import { Locator, Page } from '@playwright/test';
import * as dotenv from 'dotenv';
import { Logger } from '../utils/Logger';

dotenv.config();

/**
 * Base Page Object class containing common methods for all page objects
 */
export class BasePage {
  readonly page: Page;
  protected logger: Logger;

  constructor(page: Page) {
    this.page = page;
    this.logger = Logger.for(this.constructor.name);
  }

  /**
   * Navigate to a specific URL
   * @param path - Path to navigate to (appended to baseURL)
   */
  async goto(domain: string = ''): Promise<void> {
    const url = domain;
    await this.page.goto(url);
  }

  /**
   * Wait for page to be loaded
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForLoadState('load');
  }

  /**
   * Get element by data-testid
   */
  getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  /**
   * Get element by text
   */
  getByText(text: string | RegExp): Locator {
    return this.page.getByText(text);
  }

  /**
   * Get element by role
   */
  getByRole(
    role: 'button' | 'link' | 'heading' | 'textbox' | 'img' | 'navigation',
    options?: { name?: string | RegExp }
  ): Locator {
    return this.page.getByRole(role, options);
  }

  /**
   * Click on an element
   */
  async click(locator: Locator): Promise<void> {
    await locator.click();
  }

  /**
   * Fill input field
   */
  async fill(locator: Locator, text: string): Promise<void> {
    await locator.fill(text);
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(
    locator: Locator,
    timeout: number = 30000
  ): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Check if element is visible
   */
  async isVisible(locator: Locator): Promise<boolean> {
    try {
      return await locator.isVisible();
    } catch (error) {
      this.logger.debug('Element visibility check failed', { error });
      return false;
    }
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: `./screenshots/${name}.png`,
      fullPage: true,
    });
  }

  /**
   * Scroll to element
   */
  async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Get current URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Wait for URL to contain specific text
   */
  async waitForUrl(urlPart: string, timeout: number = 30000): Promise<void> {
    await this.page.waitForURL(`**/*${urlPart}*`, { timeout });
  }

  /**
   * Reload the page
   */
  async reload(): Promise<void> {
    await this.page.reload();
  }

  /**
   * Go back in browser history
   */
  async goBack(): Promise<void> {
    await this.page.goBack();
  }

  /**
   * Accept cookie consent if present
   */
  async acceptCookies(): Promise<void> {
    try {
      const cookieButton = this.page
        .locator(
          'button:has-text("Accept"), button:has-text("accept"), button:has-text("Agree")'
        )
        .first();
      if (await cookieButton.isVisible({ timeout: 5000 })) {
        await cookieButton.click();
        this.logger.debug('Cookie banner accepted');
      }
    } catch (error) {
      this.logger.debug('Cookie banner not present or already accepted', {
        error,
      });
      // Cookie banner not present, continue
    }
  }
}
