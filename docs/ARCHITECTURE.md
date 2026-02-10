# Architecture Overview

This document explains the architectural patterns and design decisions used in this Playwright TypeScript framework.

## Design Principles

1. **Separation of Concerns** - Tests, page objects, and utilities are clearly separated
2. **DRY (Don't Repeat Yourself)** - Reusable fixtures and base classes
3. **Maintainability** - Easy to update when UI changes
4. **Scalability** - Structure supports growing test suites
5. **Readability** - Clear naming and organization

## Architecture Layers

```
┌─────────────────────────────────────────────┐
│           Test Layer (tests/)               │
│  - ExampleTestUI.ts                        │
│  - ExampleTestAPI.ts                       │
└─────────────────┬───────────────────────────┘
                  │ uses
┌─────────────────▼───────────────────────────┐
│         Fixture Layer (fixtures/)           │
│  - PageFixtures.ts                         │
│  - Manages page object lifecycle           │
└─────────────────┬───────────────────────────┘
                  │ creates
┌─────────────────▼───────────────────────────┐
│      Page Object Layer (pages/)             │
│  - BasePage.ts (common methods)            │
│  - WikipediaHomePage.ts                    │
│  - WikimediaCommonsPage.ts                 │
└─────────────────┬───────────────────────────┘
                  │ uses
┌─────────────────▼───────────────────────────┐
│        Utility Layer (utils/)               │
│  - Logger.ts                               │
│  - AllureHelper.ts                         │
│  - PlaywrightTestListener.ts              │
└─────────────────────────────────────────────┘
```

## Core Components

### 1. Test Layer (`src/tests/`)

**Purpose**: Contains actual test scenarios

**Structure**:
```typescript
test.describe('Feature Name', () => {
  test('should do something', async ({ fixture }) => {
    await test.step('Step 1', async () => {
      // Test implementation
    });
  });
});
```

**Key Features**:
- Uses custom fixtures for page objects
- Structured with test steps for clarity
- Screenshots attached at each step
- Comprehensive logging

**Example**:
```typescript
// src/tests/ExampleTestUI.ts
import { test } from '../fixtures/PageFixtures';

test.describe('Wikipedia Navigation Test', () => {
  test('should navigate from Wikipedia to Commons', async ({ 
    wikipediaHomePage,
    wikimediaCommonsPage,
    page 
  }) => {
    await test.step('Navigate to Wikipedia', async () => {
      await wikipediaHomePage.navigate();
      await testInfo.attach('screenshot', {
        body: await page.screenshot(),
        contentType: 'image/png'
      });
    });
  });
});
```

### 2. Fixture Layer (`src/fixtures/`)

**Purpose**: Manages test dependencies and page object lifecycle

**Benefits**:
- Automatic setup and teardown
- Dependency injection
- Shared state management
- Type-safe fixtures

**Structure**:
```typescript
// src/fixtures/PageFixtures.ts
import { test as base } from '@playwright/test';

type PageFixtures = {
  wikipediaHomePage: WikipediaHomePage;
  wikimediaCommonsPage: WikimediaCommonsPage;
};

export const test = base.extend<PageFixtures>({
  wikipediaHomePage: async ({ page }, use) => {
    const wikipediaHomePage = new WikipediaHomePage(page);
    await use(wikipediaHomePage);
  },
  
  wikimediaCommonsPage: async ({ page }, use) => {
    const wikimediaCommonsPage = new WikimediaCommonsPage(page);
    await use(wikimediaCommonsPage);
  },
});
```

### 3. Page Object Layer (`src/pages/`)

**Purpose**: Encapsulates page interactions and elements

**Pattern**: Page Object Model (POM)

**Base Class**:
```typescript
// src/pages/BasePage.ts
export class BasePage {
  protected page: Page;
  protected logger: Logger;

  constructor(page: Page) {
    this.page = page;
    this.logger = Logger.for(this.constructor.name);
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }
}
```

**Page Implementation**:
```typescript
// src/pages/wikipedia/WikipediaHomePage.ts
export class WikipediaHomePage extends BasePage {
  readonly url = 'https://www.wikipedia.org/';
  readonly commonsLink: Locator;

  constructor(page: Page) {
    super(page);
    this.commonsLink = this.page.locator('a:has(.other-project-title)');
  }

  async navigate(): Promise<void> {
    await this.page.goto(this.url);
    await this.waitForPageLoad();
  }

  async clickCommonsLink(): Promise<void> {
    await this.commonsLink.click();
  }
}
```

**Benefits**:
- Centralized element selectors
- Reusable page methods
- Easy maintenance when UI changes
- Built-in logging

### 4. Utility Layer (`src/utils/`)

**Components**:

#### Logger (`Logger.ts`)
- Structured logging with timestamps
- Multiple log levels (DEBUG, INFO, WARN, ERROR)
- File and console output
- Context-specific loggers

```typescript
const logger = Logger.for('MyTest');
logger.info('Test started');
logger.error('Test failed', { reason: 'timeout' });
```

#### AllureHelper (`AllureHelper.ts`)
- Enhanced Allure reporting
- Step screenshots
- Metadata attachments
- Test annotations

```typescript
await AllureHelper.stepWithScreenshot(page, 'Click button', async () => {
  await button.click();
});
```

#### PlaywrightTestListener (`PlaywrightTestListener.ts`)
- Custom test lifecycle reporting
- Execution statistics
- Real-time logging
- Custom report generation

## Configuration Management

### Playwright Config (`playwright.config.ts`)

**Key Configuration Areas**:

1. **Test Discovery**:
   ```typescript
   testDir: './src/tests',
   testMatch: '**/*Test*.ts',
   ```

2. **Output Management**:
   ```typescript
   outputDir: './reports/test-results',
   ```

3. **Reporters**:
   ```typescript
   reporter: [
     ['list'],
     ['html', { outputFolder: 'reports/playwright-report' }],
     ['junit', { outputFile: 'reports/test-results/test-results.xml' }],
     ['allure-playwright', { outputFolder: 'reports/allure-results' }],
     ['playwright-smart-reporter'],
   ]
   ```

4. **Projects** (Multiple Environments):
   ```typescript
   projects: [
     {
       name: 'local',  // Headed, slow motion
       use: { headless: false, launchOptions: { slowMo: 300 } }
     },
     {
       name: 'pipeline',  // Headless, fast
       use: { headless: true }
     }
   ]
   ```

5. **Global Settings**:
   ```typescript
   use: {
     actionTimeout: 120000,
     navigationTimeout: 120000,
     trace: 'on',
     screenshot: 'only-on-failure',
     video: 'retain-on-failure'
   }
   ```

## Data Flow

### Test Execution Flow

```
1. Test Runner starts
   ↓
2. Load playwright.config.ts
   ↓
3. Discover tests (testMatch pattern)
   ↓
4. Setup fixtures (PageFixtures.ts)
   ↓
5. Create page objects (BasePage + specific pages)
   ↓
6. Execute test steps
   ↓
7. Log events (Logger)
   ↓
8. Capture artifacts (screenshots, videos, traces)
   ↓
9. Generate reports (HTML, Allure, JUnit, Smart)
   ↓
10. Cleanup fixtures
```

### Logging Flow

```
Test → Logger → Console Output
                ↓
                File Output (logs/)
                ↓
                Test Listener → Custom Report
```

### Reporting Flow

```
Test Results → Playwright Core
                ↓
                ├→ List Reporter (console)
                ├→ HTML Reporter (reports/playwright-report/)
                ├→ JUnit Reporter (reports/test-results/test-results.xml)
                ├→ Allure Reporter (reports/allure-results/)
                ├→ Smart Reporter (reports/smart-reports/)
                └→ Custom Listener (reports/logs/)
```

## Scalability Patterns

### Adding New Pages

1. Create page class extending `BasePage`
2. Define locators and methods
3. Add to `PageFixtures.ts`
4. Use in tests via fixtures

### Adding New Utilities

1. Create utility class in `src/utils/`
2. Export functions/classes
3. Import in pages or tests
4. Document usage

### Adding New Test Suites

1. Create test file matching pattern `*Test*.ts`
2. Import fixtures: `import { test } from '../fixtures/PageFixtures'`
3. Use `test.describe()` and `test()` blocks
4. Add test steps with `test.step()`

## Performance Considerations

### Parallel Execution

- Tests run in parallel by default
- Configure workers: `workers: process.env.CI ? 1 : undefined`
- Use `fullyParallel: false` for sequential execution

### Resource Management

- Fixtures manage page lifecycle
- Automatic cleanup after tests
- Browser context isolation

### Timeouts

- Action timeout: 120 seconds
- Navigation timeout: 120 seconds
- Test timeout: 0 (unlimited)

## Best Practices

1. **One Page Object per Page** - Keep pages focused
2. **Use Fixtures** - Don't instantiate page objects in tests
3. **Log Extensively** - Use Logger for debugging
4. **Attach Screenshots** - At every test step
5. **Use test.step()** - For clear test reporting
6. **Keep Tests Independent** - No shared state between tests
7. **Use Meaningful Names** - Descriptive test and method names

## Security Considerations

- No credentials in code (use environment variables)
- `.gitignore` configured for sensitive files
- Traces and videos contain sensitive data - handle appropriately

## Further Reading

- [Page Object Model Guide](PAGE_OBJECTS.md)
- [Custom Utilities Documentation](UTILITIES.md)
- [Reporting Guide](REPORTING.md)
