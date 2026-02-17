import { Page } from '@playwright/test';
import allure from 'allure-js-commons';

/**
 * Allure Helper utility for enhanced reporting with step screenshots
 */
export class AllureHelper {
  /**
   * Execute a step with automatic screenshot capture
   */
  static async step<T>(
    stepName: string,
    page: Page,
    action: () => Promise<T>,
    options: {
      screenshotBefore?: boolean;
      screenshotAfter?: boolean;
      screenshotOnError?: boolean;
    } = {}
  ): Promise<T> {
    const {
      screenshotBefore = true,
      screenshotAfter = true,
      screenshotOnError = true,
    } = options;

    let result: T;

    await allure.step(stepName, async () => {
      try {
        // Take screenshot before action
        if (screenshotBefore) {
          const beforeScreenshot = await page.screenshot({
            fullPage: true,
            quality: 90,
          });
          await allure.attachment(
            `${stepName} - Before`,
            beforeScreenshot,
            'image/png'
          );
        }

        // Execute the action
        result = await action();

        // Take screenshot after successful action
        if (screenshotAfter) {
          const afterScreenshot = await page.screenshot({
            fullPage: true,
            quality: 90,
          });
          await allure.attachment(
            `${stepName} - After`,
            afterScreenshot,
            'image/png'
          );
        }
      } catch (error) {
        // Take screenshot on error
        if (screenshotOnError) {
          try {
            const errorScreenshot = await page.screenshot({
              fullPage: true,
              quality: 90,
            });
            await allure.attachment(
              `${stepName} - Error`,
              errorScreenshot,
              'image/png'
            );
          } catch (screenshotError) {
            console.warn(
              'Failed to capture error screenshot:',
              screenshotError
            );
          }
        }

        // Re-throw the original error
        throw error;
      }
    });

    return result!;
  }

  /**
   * Add a simple step without screenshot
   */
  static async simpleStep<T>(
    stepName: string,
    action: () => Promise<T>
  ): Promise<T> {
    let result: T;
    await allure.step(stepName, async () => {
      result = await action();
    });
    return result!;
  }

  /**
   * Take a screenshot with custom name
   */
  static async screenshot(
    page: Page,
    name: string,
    description?: string
  ): Promise<void> {
    const screenshot = await page.screenshot({
      fullPage: true,
      quality: 90,
    });
    await allure.attachment(name, screenshot, 'image/png');

    if (description) {
      await allure.step(description, async () => {
        // Step completed with screenshot attachment
      });
    }
  }

  /**
   * Add environment information
   */
  static async addEnvironmentInfo(info: Record<string, string>): Promise<void> {
    for (const [key, value] of Object.entries(info)) {
      await allure.parameter(key, value);
    }
  }

  /**
   * Add test description and labels
   */
  static async addTestMetadata(options: {
    description?: string;
    owner?: string;
    severity?: 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial';
    epic?: string;
    feature?: string;
    story?: string;
    tags?: string[];
  }): Promise<void> {
    const { description, owner, severity, epic, feature, story, tags } =
      options;

    if (description) {
      await allure.description(description);
    }

    if (owner) {
      await allure.owner(owner);
    }

    if (severity) {
      await allure.severity(severity);
    }

    if (epic) {
      await allure.epic(epic);
    }

    if (feature) {
      await allure.feature(feature);
    }

    if (story) {
      await allure.story(story);
    }

    if (tags) {
      for (const tag of tags) {
        await allure.tag(tag);
      }
    }
  }

  /**
   * Attach log file content to Allure report
   */
  static async attachLogFile(
    filePath: string,
    name: string = 'Test Logs'
  ): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const logContent = await fs.readFile(filePath, 'utf-8');
      await allure.attachment(name, logContent, 'text/plain');
    } catch (error) {
      console.warn(`Failed to attach log file ${filePath}:`, error);
    }
  }

  /**
   * Attach network HAR file for detailed network analysis
   */
  static async attachHAR(
    page: Page,
    name: string = 'Network HAR'
  ): Promise<void> {
    try {
      // Enable tracing if not already enabled
      const context = page.context();

      // Stop tracing and save HAR
      const harBuffer = await context.storageState();
      await allure.attachment(
        name,
        JSON.stringify(harBuffer, null, 2),
        'application/json'
      );
    } catch (error) {
      console.warn('Failed to attach HAR file:', error);
    }
  }
}
