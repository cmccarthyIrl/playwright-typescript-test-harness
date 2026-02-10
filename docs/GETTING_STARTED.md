# Getting Started Guide

This guide will help you set up and run your first test with the Playwright TypeScript framework.

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (version 18 or higher)
   ```bash
   node --version  # Should be v18.0.0 or higher
   ```

2. **npm** (comes with Node.js)
   ```bash
   npm --version   # Should be 9.0.0 or higher
   ```

3. **Git** (for cloning the repository)
   ```bash
   git --version
   ```

## Initial Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd playwright-typescript-example

# Install all dependencies
npm install

# Install Playwright browsers (Chromium, Firefox, WebKit)
npx playwright install
```

### 2. Verify Installation

```bash
# Run a quick test to verify everything works
npx playwright test --project=local --grep="API Tests"
```

If successful, you should see test results in your terminal.

## Your First Test Run

### Run All Tests (Local Mode)

```bash
# Run all tests in headed mode (you'll see the browser)
npx playwright test --project=local
```

### Run All Tests (Pipeline Mode)

```bash
# Run all tests in headless mode (no browser UI)
npx playwright test --project=pipeline
```

### Run Specific Test Suites

```bash
# Run Wikipedia navigation tests
npx playwright test --grep="Wikipedia Navigation Test"

# Run API tests only
npx playwright test --grep="API Tests"
```

## Understanding the Output

After running tests, you'll see:

1. **Console Output** - Real-time test execution logs
2. **Reports Directory** - Generated at `reports/`
   - `playwright-report/` - Interactive HTML report
   - `test-results/` - Test artifacts, screenshots, videos
   - `allure-results/` - Allure test results
   - `smart-reports/` - Smart reporter HTML

### View HTML Report

```bash
# Open the Playwright HTML report
npx playwright show-report reports/playwright-report
```

## Project Structure Overview

```
src/
├── fixtures/          # Test fixtures (reusable setup)
├── pages/            # Page Objects (UI element abstractions)
├── tests/            # Your test files
└── utils/            # Helper utilities (Logger, Allure, etc.)
```

## Writing Your First Test

### 1. Create a New Page Object

```typescript
// src/pages/MyNewPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class MyNewPage extends BasePage {
  readonly searchInput: Locator;
  readonly searchButton: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = this.page.locator('[name="search"]');
    this.searchButton = this.page.locator('button[type="submit"]');
  }

  async search(query: string): Promise<void> {
    this.logger.info(`Searching for: ${query}`);
    await this.searchInput.fill(query);
    await this.searchButton.click();
    await this.waitForPageLoad();
  }
}
```

### 2. Add Page to Fixtures

```typescript
// src/fixtures/PageFixtures.ts
import { MyNewPage } from '../pages/MyNewPage';

type PageFixtures = {
  // ... existing fixtures
  myNewPage: MyNewPage;
};

export const test = base.extend<PageFixtures>({
  // ... existing fixtures
  
  myNewPage: async ({ page }, use) => {
    const myNewPage = new MyNewPage(page);
    await use(myNewPage);
  },
});
```

### 3. Write Your Test

```typescript
// src/tests/MyNewTest.ts
import { expect } from '@playwright/test';
import { test } from '../fixtures/PageFixtures';

test.describe('My New Test Suite', () => {
  test('should search successfully', async ({ myNewPage, page }) => {
    await test.step('Navigate and search', async () => {
      await page.goto('https://example.com');
      await myNewPage.search('playwright');
    });

    await test.step('Verify results', async () => {
      await expect(page).toHaveURL(/search/);
    });
  });
});
```

### 4. Run Your New Test

```bash
npx playwright test --grep="My New Test Suite" --project=local
```

## Common Commands

```bash
# Run tests in debug mode
npx playwright test --debug

# Run tests with UI mode (interactive)
npx playwright test --ui

# Run a specific test file
npx playwright test src/tests/MyNewTest.ts

# Run tests and update snapshots
npx playwright test --update-snapshots

# Show test report
npx playwright show-report reports/playwright-report

# Generate Allure report
npm run allure:serve
```

## IDE Setup (VS Code Recommended)

### Recommended Extensions

1. **Playwright Test for VSCode** - Run and debug tests from IDE
2. **ESLint** - Code linting
3. **Prettier - Code formatter** - Code formatting

### Install Extensions

```bash
# Install VS Code Playwright extension
code --install-extension ms-playwright.playwright
```

### Debug Tests in VS Code

1. Open test file
2. Click the green play button next to test name
3. Or use `F5` to start debugging

## Next Steps

1. Read the [Architecture Overview](ARCHITECTURE.md) to understand the framework design
2. Learn about [Page Objects](PAGE_OBJECTS.md) for better test organization
3. Explore [Custom Utilities](UTILITIES.md) like Logger and AllureHelper
4. Check the [Reporting Guide](REPORTING.md) for advanced reporting features

## Troubleshooting

### Tests Won't Run

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Reinstall browsers
npx playwright install --force
```

### Browser Launch Issues

```bash
# Install browser dependencies (Linux)
npx playwright install-deps

# Use specific browser
npx playwright test --project=local --browser=chromium
```

### Port Already in Use

If you see port conflicts, check for running Node processes:

```bash
# Windows PowerShell
Get-Process node | Stop-Process

# Linux/Mac
pkill -f node
```

## Getting Help

- 📖 [Playwright Documentation](https://playwright.dev/)
- 💬 [Playwright Discord](https://discord.com/invite/playwright-807756831384403968)
- 🐛 [Report Issues](https://github.com/microsoft/playwright/issues)

---

Ready to dive deeper? Continue to the [Architecture Overview](ARCHITECTURE.md)
