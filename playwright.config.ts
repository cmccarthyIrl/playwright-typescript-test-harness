import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './src/tests',
  testMatch: '**/*Test*.ts',
  outputDir: './reports/test-results',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 0, // No timeout - let tests run as long as needed
  reporter: process.env.CI ? [
    ['blob'],
    ['allure-playwright', {
      detail: true,
      outputFolder: 'allure-results',
      suiteTitle: false,
      environmentInfo: {
        framework: 'Playwright',
        language: 'TypeScript',
        node_version: process.version,
      },
    }],
    ['playwright-smart-reporter', {
      outputFile: '../../reports/smart-reports/smart-report.html',
      historyFile: '../../reports/smart-reports/test-history.json',
      maxHistoryRuns: 10,
    }],
  ] : [
    ['list', { printSteps: true }],
    ['html', { open: 'never', outputFolder: 'reports/playwright-report' }],
    ['junit', { outputFile: 'reports/test-results/test-results.xml' }],
    ['allure-playwright', {
      detail: true,
      outputFolder: 'allure-results',
      suiteTitle: false,
      environmentInfo: {
        framework: 'Playwright',
        language: 'TypeScript',
        node_version: process.version,
      },
      attachments: {
        screenshot: {
          mode: 'always',
          contentType: 'image/png'
        },
        video: {
          mode: 'always',
          contentType: 'video/webm'
        },
        trace: {
          mode: 'always',
          contentType: 'application/zip'
        }
      }
    }],
    ['playwright-smart-reporter', {
      outputFile: '../../reports/smart-reports/smart-report.html',
      historyFile: '../../reports/smart-reports/test-history.json',
      maxHistoryRuns: 10,
    }],
    [require.resolve('./src/utils/PlaywrightTestListener.ts'), {
      outputDir: 'reports',
      enableConsoleLogging: true,
      enableFileLogging: true,
      enableTimestamps: true
    }]
  ],
  use: {
    actionTimeout: 120000, // 2 minute timeout for actions (click, fill, etc.)
    navigationTimeout: 120000, // 2 minute timeout for navigation actions
    trace: 'on',
    acceptDownloads: false,
    bypassCSP: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  projects: [
    {
      name: 'local',
      use: {
        channel: 'chromium',
        headless: false,
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--auth-server-whitelist="_"',
            '--disable-background-networking',
            '--disable-backgrounding-occluded-windows',
            '--disable-component-extensions-with-background-pages',
          ],
          slowMo: 300,
        },
      },
    },
    {
      name: 'pipeline',
      use: {
        channel: 'chromium',
        headless: true,
        launchOptions: {
          args: ['--disable-web-security', '--disable-features=IsolateOrigins,site-per-process'],
          slowMo: 300,
        },
      },
    },
  ],
});
