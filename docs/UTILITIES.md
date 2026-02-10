# Custom Utilities Guide

This framework includes several custom utilities to enhance testing capabilities.

## Overview

The `src/utils/` directory contains:
- **Logger** - Structured logging with file and console output
- **AllureHelper** - Enhanced Allure reporting utilities
- **PlaywrightTestListener** - Custom test lifecycle reporter

## Logger Utility

### Purpose

The Logger provides:
- Structured logging with consistent formatting
- Multiple log levels (DEBUG, INFO, WARN, ERROR)
- File and console output
- Context-specific loggers
- Timestamp support
- Color-coded output

### Basic Usage

```typescript
import { Logger } from '../utils/Logger';

// Create a logger instance
const logger = Logger.for('MyComponent');

// Log messages at different levels
logger.debug('Detailed debugging information');
logger.info('General information');
logger.warn('Warning message');
logger.error('Error occurred', { details: 'error details' });
```

### Configuration

#### Global Configuration

```typescript
import { Logger, LogLevel } from '../utils/Logger';

Logger.configure({
  level: LogLevel.DEBUG,           // Minimum log level to display
  enableTimestamps: true,          // Include timestamps in logs
  enableColors: true,              // Use colored output
  enableFileLogging: true,         // Write logs to file
  logFile: 'logs/test.log',       // Log file path
  maxLineLength: 200,             // Maximum character length per line
  context: 'APP'                  // Default context name
});
```

#### Log Levels

| Level | Value | Description |
|-------|-------|-------------|
| DEBUG | 0 | Detailed information for debugging |
| INFO  | 1 | General informational messages |
| WARN  | 2 | Warning messages |
| ERROR | 3 | Error messages |
| SILENT| 4 | Suppress all logs |

### Context-Specific Loggers

Create loggers for different components:

```typescript
// In a page object
const logger = Logger.for('LoginPage');
logger.info('Navigating to login page');

// In a test
const logger = Logger.for('LoginTest');
logger.info('Starting login test');

// In a utility
const logger = Logger.for('DatabaseHelper');
logger.debug('Executing query');
```

### Logging with Metadata

```typescript
// Simple metadata
logger.info('User logged in', { userId: 12345 });

// Complex metadata
logger.error('API request failed', {
  endpoint: '/api/users',
  statusCode: 500,
  requestId: 'abc-123',
  timestamp: Date.now()
});

// Error object
try {
  await somethingRisky();
} catch (error) {
  logger.error('Operation failed', error);
}
```

### Output Examples

#### Console Output

```
[2026-02-10T10:30:45.123Z] ℹ️[LoginPage] Navigating to login page
[2026-02-10T10:30:46.456Z] ⚠️[LoginPage] Slow network detected
[2026-02-10T10:30:47.789Z] ❌[LoginPage] Login failed: Invalid credentials
```

#### File Output

```
[2026-02-10T10:30:45.123Z] INFO[LoginPage] Navigating to login page
[2026-02-10T10:30:46.456Z] WARN[LoginPage] Slow network detected
[2026-02-10T10:30:47.789Z] ERROR[LoginPage] Login failed: Invalid credentials
```

### Advanced Features

#### Conditional Logging

```typescript
class MyPage extends BasePage {
  async performAction(): Promise<void> {
    if (process.env.DEBUG) {
      this.logger.debug('Detailed state information', {
        url: this.page.url(),
        cookies: await this.page.context().cookies()
      });
    }
    
    this.logger.info('Performing action');
    // ... action implementation
  }
}
```

#### Disable Logging in Tests

```typescript
import { Logger, LogLevel } from '../utils/Logger';

test.beforeAll(() => {
  // Silence logs for cleaner test output
  Logger.configure({ level: LogLevel.SILENT });
});
```

#### Custom Log Formatting

```typescript
// Log with specific formatting
logger.info('═'.repeat(80));
logger.info('🚀 Test Suite Started');
logger.info('═'.repeat(80));
```

### Best Practices

✅ **Use appropriate log levels**
```typescript
// Debug - Implementation details
this.logger.debug('Element selector: .login-button');

// Info - Key actions
this.logger.info('User logged in successfully');

// Warn - Unexpected but handled situations
this.logger.warn('Retry attempt 2 of 3');

// Error - Failures
this.logger.error('Unable to connect to database');
```

✅ **Add context to log messages**
```typescript
// ❌ Bad
logger.info('Clicked button');

// ✅ Good
logger.info('Clicked submit button on login form');
```

✅ **Include relevant metadata**
```typescript
logger.info('API request completed', {
  endpoint: '/api/users',
  duration: 245,
  status: 200
});
```

---

## AllureHelper Utility

### Purpose

AllureHelper enhances Allure reporting with:
- Screenshots at every step
- Test metadata and annotations
- Parameter logging
- Log file attachments

### Basic Usage

```typescript
import { AllureHelper } from '../utils/AllureHelper';

test('my test', async ({ page }) => {
  // Step with automatic screenshot
  await AllureHelper.stepWithScreenshot(
    page,
    'Navigate to homepage',
    async () => {
      await page.goto('https://example.com');
    }
  );
});
```

### Step with Screenshots

Takes a screenshot before, during, and after errors:

```typescript
await AllureHelper.stepWithScreenshot(
  page,
  'Fill login form',
  async () => {
    await page.fill('#username', 'user@example.com');
    await page.fill('#password', 'password123');
  },
  {
    takeScreenshotBefore: true,  // Screenshot before step
    takeScreenshotAfter: true,   // Screenshot after step
    takeScreenshotOnError: true  // Screenshot if step fails
  }
);
```

### Step with Validation

Combines step execution with validation:

```typescript
await AllureHelper.stepWithValidation(
  page,
  'Verify homepage loaded',
  async () => {
    await page.goto('https://example.com');
  },
  async (page) => {
    // Validation logic
    const title = await page.title();
    return title === 'Example Domain';
  }
);
```

### Adding Screenshots

```typescript
// Add single screenshot
await AllureHelper.addScreenshot(page, 'current-state', 'Current page state');

// In test step
await test.step('Verify UI state', async () => {
  await AllureHelper.addScreenshot(page, 'verification', 'UI verification screenshot');
});
```

### Test Metadata

```typescript
test('comprehensive test', async ({ page }) => {
  // Add test metadata
  await AllureHelper.addTestMetadata({
    description: 'Validates the complete user registration flow',
    owner: 'QA Team',
    severity: 'critical',
    epic: 'User Management',
    feature: 'Registration',
    story: 'As a user, I want to register...',
    tags: ['smoke', 'regression', 'critical']
  });

  // Test implementation...
});
```

### Add Parameters

```typescript
test('parameterized test', async ({ page }) => {
  const testData = {
    username: 'testuser',
    email: 'test@example.com',
    role: 'admin'
  };

  // Log test parameters in Allure
  await AllureHelper.addParameters({
    'Username': testData.username,
    'Email': testData.email,
    'Role': testData.role
  });

  // Test implementation...
});
```

### Attach Log Files

```typescript
test('test with logs', async ({ page }) => {
  // Perform test actions...
  
  // Attach log file to Allure report
  await AllureHelper.attachLog('logs/test.log', 'Test Execution Log');
});
```

### Complete Example

```typescript
import { test } from '../fixtures/PageFixtures';
import { AllureHelper } from '../utils/AllureHelper';

test.describe('Login Flow', () => {
  test('should login successfully', async ({ page }) => {
    // Add metadata
    await AllureHelper.addTestMetadata({
      description: 'Test successful login with valid credentials',
      owner: 'QA Team',
      severity: 'critical',
      epic: 'Authentication',
      feature: 'Login',
      tags: ['smoke', 'authentication']
    });

    // Add test parameters
    await AllureHelper.addParameters({
      'Environment': 'staging',
      'Browser': 'chromium',
      'Username': 'testuser@example.com'
    });

    // Step 1: Navigate
    await AllureHelper.stepWithScreenshot(
      page,
      'Navigate to login page',
      async () => {
        await page.goto('https://example.com/login');
      }
    );

    // Step 2: Fill form
    await AllureHelper.stepWithScreenshot(
      page,
      'Enter credentials',
      async () => {
        await page.fill('#email', 'testuser@example.com');
        await page.fill('#password', 'securePassword123');
      }
    );

    // Step 3: Submit with validation
    await AllureHelper.stepWithValidation(
      page,
      'Submit login form',
      async () => {
        await page.click('button[type="submit"]');
        await page.waitForNavigation();
      },
      async (page) => {
        const url = page.url();
        return url.includes('/dashboard');
      }
    );

    // Attach logs
    await AllureHelper.attachLog('logs/test.log', 'Execution Log');
  });
});
```

---

## PlaywrightTestListener

### Purpose

Custom reporter that provides:
- Test execution lifecycle logging
- Real-time test progress
- Custom statistics
- Structured log output

### Configuration

Already configured in `playwright.config.ts`:

```typescript
reporter: [
  [require.resolve('./src/utils/PlaywrightTestListener.ts'), {
    outputDir: 'reports',
    enableConsoleLogging: true,
    enableFileLogging: true,
    enableTimestamps: true
  }]
]
```

### Features

#### Test Lifecycle Events

The listener logs:
- Test run start/end
- Suite start/end
- Individual test start/end
- Test results (pass/fail/skip)
- Error details

#### Console Output Example

```
[2026-02-10T10:30:00.000Z] ℹ️[PlaywrightTestListener] ════════════════════════════════════════
[2026-02-10T10:30:00.000Z] ℹ️[PlaywrightTestListener] 🚀 Test execution started
[2026-02-10T10:30:00.000Z] ℹ️[PlaywrightTestListener] 📊 Configuration: Projects=2, Workers=4
[2026-02-10T10:30:00.000Z] ℹ️[PlaywrightTestListener] 📁 Output directory: ./reports
[2026-02-10T10:30:00.000Z] ℹ️[PlaywrightTestListener] ════════════════════════════════════════

[2026-02-10T10:30:05.000Z] ℹ️[PlaywrightTestListener] 📋 Suite: Login Tests
[2026-02-10T10:30:05.100Z] ℹ️[PlaywrightTestListener] ✅ PASS: should login successfully (1.2s)
[2026-02-10T10:30:06.300Z] ℹ️[PlaywrightTestListener] ✅ PASS: should show error for invalid (1.1s)

[2026-02-10T10:30:10.000Z] ℹ️[PlaywrightTestListener] ════════════════════════════════════════
[2026-02-10T10:30:10.000Z] ℹ️[PlaywrightTestListener] 🏁 Test execution completed in 10s
[2026-02-10T10:30:10.000Z] ℹ️[PlaywrightTestListener] 📊 Overall Results: PASSED
[2026-02-10T10:30:10.000Z] ℹ️[PlaywrightTestListener] ════════════════════════════════════════
[2026-02-10T10:30:10.000Z] ℹ️[PlaywrightTestListener] 📈 Test Statistics:
[2026-02-10T10:30:10.000Z] ℹ️[PlaywrightTestListener]    ✅ Passed: 2
[2026-02-10T10:30:10.000Z] ℹ️[PlaywrightTestListener]    ❌ Failed: 0
[2026-02-10T10:30:10.000Z] ℹ️[PlaywrightTestListener]    ⏭️  Skipped: 0
[2026-02-10T10:30:10.000Z] ℹ️[PlaywrightTestListener]    📊 Total: 2
```

### Custom Options

```typescript
interface ListenerOptions {
  outputDir?: string;              // Directory for log files
  enableConsoleLogging?: boolean;  // Enable console output
  enableFileLogging?: boolean;     // Enable file logging
  enableTimestamps?: boolean;      // Include timestamps
}
```

---

## Utility Integration Example

Combining all utilities in a test:

```typescript
import { test } from '../fixtures/PageFixtures';
import { expect } from '@playwright/test';
import { AllureHelper } from '../utils/AllureHelper';
import { Logger, LogLevel } from '../utils/Logger';

// Configure logger
Logger.configure({
  level: LogLevel.DEBUG,
  enableFileLogging: true,
  logFile: 'logs/integration-test.log'
});

test.describe('Integration Test Example', () => {
  const logger = Logger.for('IntegrationTest');

  test.beforeEach(() => {
    logger.info('🚀 Starting new test');
  });

  test('complete flow with all utilities', async ({ page }) => {
    // Add Allure metadata
    await AllureHelper.addTestMetadata({
      description: 'Complete user flow test',
      owner: 'QA Team',
      severity: 'critical',
      epic: 'E2E Tests',
      feature: 'User Flow',
      tags: ['integration', 'critical']
    });

    // Step 1
    logger.info('Step 1: Navigation');
    await AllureHelper.stepWithScreenshot(
      page,
      'Navigate to application',
      async () => {
        await page.goto('https://example.com');
        logger.debug(`Current URL: ${page.url()}`);
      }
    );

    // Step 2
    logger.info('Step 2: Interaction');
    await AllureHelper.stepWithScreenshot(
      page,
      'Perform user action',
      async () => {
        await page.click('#action-button');
        logger.info('Button clicked successfully');
      }
    );

    // Step 3 with validation
    logger.info('Step 3: Validation');
    await AllureHelper.stepWithValidation(
      page,
      'Verify result',
      async () => {
        const result = await page.locator('.result').textContent();
        logger.info(`Result: ${result}`);
      },
      async (page) => {
        const isVisible = await page.locator('.success').isVisible();
        logger.debug(`Success indicator visible: ${isVisible}`);
        return isVisible;
      }
    );

    // Attach logs
    await AllureHelper.attachLog('logs/integration-test.log', 'Test Log');
    
    logger.info('✅ Test completed successfully');
  });

  test.afterEach(async ({}, testInfo) => {
    if (testInfo.status === 'failed') {
      logger.error(`Test failed: ${testInfo.error?.message}`);
    } else {
      logger.info('🎉 Test passed');
    }
  });
});
```

## Best Practices

### 1. Consistent Logging

```typescript
// Always log key actions
logger.info('Starting login flow');
await loginPage.login(username, password);
logger.info('Login completed');
```

### 2. Meaningful Context

```typescript
// Create loggers with descriptive contexts
const logger = Logger.for('UserRegistrationFlow');
```

### 3. Structured Metadata

```typescript
// Always include relevant metadata
logger.info('API call completed', {
  endpoint: '/api/users',
  method: 'POST',
  status: 201,
  duration: 345
});
```

### 4. Error Handling

```typescript
try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', error);
  throw error; // Re-throw for test framework
}
```

### 5. Test Documentation

```typescript
// Use AllureHelper for comprehensive test documentation
await AllureHelper.addTestMetadata({
  description: 'Clear description of what the test does',
  owner: 'Team Name',
  severity: 'critical',
  tags: ['smoke', 'regression']
});
```

## Further Reading

- [Allure Documentation](https://docs.qameta.io/allure/)
- [Playwright Reporters](https://playwright.dev/docs/test-reporters)
