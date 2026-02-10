# Reporting Guide

Comprehensive guide to test reporting in this Playwright TypeScript framework.

## Overview

The framework includes multiple reporters for different use cases:

| Reporter | Purpose | Output Location |
|----------|---------|-----------------|
| **List** | Console output during test execution | Console |
| **HTML** | Interactive web-based report | `reports/playwright-report/` |
| **JUnit** | XML format for CI/CD integration | `reports/test-results/test-results.xml` |
| **Allure** | Rich, detailed test reports | `reports/allure-results/` |
| **Smart Reporter** | Historical test tracking | `reports/smart-reports/` |
| **Custom Listener** | Real-time execution logs | `reports/` and Console |

## Configuration

All reporters are configured in `playwright.config.ts`:

```typescript
reporter: [
  ['list', { printSteps: true }],
  ['html', { open: 'never', outputFolder: 'reports/playwright-report' }],
  ['junit', { outputFile: 'reports/test-results/test-results.xml' }],
  ['allure-playwright', {
    detail: true,
    outputFolder: 'reports/allure-results',
    // ... additional config
  }],
  ['playwright-smart-reporter', {
    outputFile: 'reports/smart-reports/smart-report.html',
    historyFile: 'reports/smart-reports/test-history.json',
    maxHistoryRuns: 10,
  }],
  [require.resolve('./src/utils/PlaywrightTestListener.ts'), {
    outputDir: 'reports',
    enableConsoleLogging: true,
    enableFileLogging: true,
  }]
]
```

## List Reporter (Console)

### Features

- Real-time test execution feedback
- Color-coded output
- Test step details
- Duration tracking

### Output Example

```
Running 2 tests using 2 workers

  ✓  [local] › ExampleTestUI.ts:15:3 › Wikipedia Navigation Test › should navigate from Wikipedia to Wikimedia Commons (5.2s)
     Step 1: Navigate to Wikipedia homepage (1.1s)
     Step 2: Verify page URL contains "wikipedia" (0.3s)
     Step 3: Click the Commons link (2.5s)
     Step 4: Verify Wikimedia Commons page loaded (1.3s)

  ✓  [local] › ExampleTestAPI.ts:12:3 › API Tests › should verify API endpoint returns valid response (0.8s)
     Step 1: Make GET request to API endpoint (0.4s)
     Step 2: Verify response body structure (0.4s)

  2 passed (6.0s)
```

### Configuration Options

```typescript
['list', { 
  printSteps: true  // Show test step details
}]
```

---

## HTML Reporter

### Features

- Interactive web interface
- Detailed test results
- Screenshots and videos
- Trace viewer integration
- Filter and search capabilities
- Error stack traces

### Viewing the Report

```bash
# Open the last generated HTML report
npx playwright show-report reports/playwright-report

# Or open manually
# Open reports/playwright-report/index.html in a browser
```

### Report Contents

#### 1. **Overview Page**
- Total tests, passed, failed, skipped
- Test duration
- Project breakdown

#### 2. **Test Details**
- Individual test results
- Test steps with timing
- Screenshots (on failure)
- Videos (on failure)
- Console logs
- Network activity

#### 3. **Trace Viewer**
- Timeline of test execution
- DOM snapshots
- Network requests
- Console messages
- Action details

### Configuration Options

```typescript
['html', { 
  open: 'never',                              // 'always' | 'never' | 'on-failure'
  outputFolder: 'reports/playwright-report',
  host: 'localhost',                          // Server host
  port: 9323                                  // Server port
}]
```

### Screenshots in Reports

HTML reporter automatically includes:
- Screenshots on failure (configured in use.screenshot)
- Videos on failure (configured in use.video)
- Traces (configured in use.trace)

---

## JUnit Reporter

### Features

- XML format compatible with CI/CD tools
- Test suite organization
- Error messages and stack traces
- Test timing information
- Jenkins/GitLab CI integration

### Output Format

```xml
<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
  <testsuite name="ExampleTestUI.ts" tests="1" failures="0" skipped="0" time="5.234">
    <testcase name="Wikipedia Navigation Test › should navigate from Wikipedia to Wikimedia Commons" 
              classname="[local] › ExampleTestUI.ts" 
              time="5.234">
    </testcase>
  </testsuite>
</testsuites>
```

### Configuration Options

```typescript
['junit', { 
  outputFile: 'reports/test-results/test-results.xml',
  stripANSIControlSequences: true,        // Remove color codes
  includeProjectInTestName: true,         // Include project name
  embedAnnotationsAsProperties: false     // Add annotations as properties
}]
```

### CI/CD Integration

#### Jenkins

```groovy
stage('Test Reports') {
    steps {
        junit 'reports/test-results/test-results.xml'
    }
}
```

#### GitLab CI

```yaml
test:
  artifacts:
    reports:
      junit: reports/test-results/test-results.xml
```

---

## Allure Reporter

### Features

- Beautiful, detailed reports
- Historical trends
- Test categorization
- Rich attachments (screenshots, logs, videos)
- Step-by-step execution
- Metadata and annotations

### Installation

Already included in `package.json`:

```json
{
  "devDependencies": {
    "allure-playwright": "^3.0.0",
    "allure-commandline": "^2.25.0"
  }
}
```

### Generating Reports

```bash
# Run tests (generates allure-results)
npx playwright test

# Generate HTML report from results
npm run allure:generate

# Open the generated report
npm run allure:open

# Generate and serve in one command
npm run allure:serve
```

### Report Contents

#### 1. **Overview**
- Total/Passed/Failed/Broken tests
- Success rate
- Duration statistics
- Environment info

#### 2. **Suites**
- Test organization by suite
- Individual test details
- Step-by-step breakdown

#### 3. **Graphs**
- Status trend over time
- Duration trend
- Test distribution

#### 4. **Timeline**
- Visual timeline of test execution
- Parallel execution visualization

#### 5. **Behaviors**
- Tests grouped by Epic/Feature/Story
- BDD-style organization

### Enhanced Usage with AllureHelper

```typescript
import { AllureHelper } from '../utils/AllureHelper';

test('enhanced allure test', async ({ page }) => {
  // Add metadata
  await AllureHelper.addTestMetadata({
    description: 'Detailed test description',
    owner: 'QA Team',
    severity: 'critical',
    epic: 'User Management',
    feature: 'Login',
    story: 'User Story #123',
    tags: ['smoke', 'regression']
  });

  // Add parameters
  await AllureHelper.addParameters({
    'Browser': 'chromium',
    'Environment': 'staging',
    'User Type': 'admin'
  });

  // Steps with screenshots
  await AllureHelper.stepWithScreenshot(
    page,
    'Navigate and login',
    async () => {
      await page.goto('https://example.com');
      await page.fill('#username', 'user');
      await page.fill('#password', 'pass');
      await page.click('#submit');
    }
  );

  // Attach logs
  await AllureHelper.attachLog('logs/test.log', 'Execution Log');
});
```

### Configuration Options

```typescript
['allure-playwright', {
  detail: true,                              // Include detailed steps
  outputFolder: 'reports/allure-results',
  suiteTitle: false,                         // Don't add browser to suite
  
  // Categories for test failures
  categories: [
    {
      name: 'Ignored tests',
      matchedStatuses: ['skipped']
    },
    {
      name: 'Infrastructure problems',
      matchedStatuses: ['broken', 'failed'],
      messageRegex: '.*timeout.*'
    }
  ],
  
  // Environment info
  environmentInfo: {
    framework: 'Playwright',
    language: 'TypeScript',
    node_version: process.version,
    test_environment: process.env.ENV || 'local'
  },
  
  // Attachment configuration
  attachments: {
    screenshot: {
      mode: 'always',               // 'always' | 'on-failure' | 'off'
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
}]
```

---

## Smart Reporter

### Features

- Test history tracking
- Flaky test detection
- Duration trends
- Success rate over time
- Last 10 runs comparison

### Output

Generates:
- `reports/smart-reports/smart-report.html` - Interactive report
- `reports/smart-reports/test-history.json` - Historical data

### Viewing Report

```bash
# Open in browser
start reports/smart-reports/smart-report.html
```

### Report Sections

1. **Summary**
   - Current run statistics
   - Comparison with previous runs

2. **Test List**
   - All tests with current status
   - Historical success rate
   - Average duration

3. **Flaky Tests**
   - Tests with inconsistent results
   - Failure patterns

4. **Trends**
   - Success rate over time
   - Duration trends

### Configuration Options

```typescript
['playwright-smart-reporter', {
  outputFile: 'reports/smart-reports/smart-report.html',
  historyFile: 'reports/smart-reports/test-history.json',
  maxHistoryRuns: 10,        // Number of historical runs to track
  showTrends: true,          // Display trend charts
  highlightFlaky: true       // Highlight flaky tests
}]
```

---

## Custom Test Listener

### Features

- Real-time execution logging
- Structured output
- Custom statistics
- File and console logging
- Test lifecycle tracking

### Output Example

```
[2026-02-10T10:30:00.000Z] ℹ️[PlaywrightTestListener] ════════════════════════════════════════
[2026-02-10T10:30:00.000Z] ℹ️[PlaywrightTestListener] 🚀 Test execution started
[2026-02-10T10:30:00.000Z] ℹ️[PlaywrightTestListener] 📊 Configuration: Projects=2, Workers=4
[2026-02-10T10:30:00.000Z] ℹ️[PlaywrightTestListener] ════════════════════════════════════════

[2026-02-10T10:30:15.000Z] ℹ️[PlaywrightTestListener] ✅ PASS: should login successfully (1.2s)
[2026-02-10T10:30:16.000Z] ℹ️[PlaywrightTestListener] ❌ FAIL: should handle errors (0.8s)
[2026-02-10T10:30:16.500Z] ℹ️[PlaywrightTestListener] 💬 Error: Element not found

[2026-02-10T10:30:20.000Z] ℹ️[PlaywrightTestListener] ════════════════════════════════════════
[2026-02-10T10:30:20.000Z] ℹ️[PlaywrightTestListener] 🏁 Test execution completed in 20s
[2026-02-10T10:30:20.000Z] ℹ️[PlaywrightTestListener] 📊 Overall Results: FAILED
[2026-02-10T10:30:20.000Z] ℹ️[PlaywrightTestListener] ════════════════════════════════════════
[2026-02-10T10:30:20.000Z] ℹ️[PlaywrightTestListener] 📈 Test Statistics:
[2026-02-10T10:30:20.000Z] ℹ️[PlaywrightTestListener]    ✅ Passed: 1
[2026-02-10T10:30:20.000Z] ℹ️[PlaywrightTestListener]    ❌ Failed: 1
[2026-02-10T10:30:20.000Z] ℹ️[PlaywrightTestListener]    ⏭️  Skipped: 0
[2026-02-10T10:30:20.000Z] ℹ️[PlaywrightTestListener]    📊 Total: 2
```

---

## Report Comparison

### When to Use Each Reporter

| What You Need | Use This Reporter |
|---------------|-------------------|
| Quick feedback during test run | **List** (console) |
| Detailed interactive reports | **HTML** |
| CI/CD integration | **JUnit** |
| Beautiful reports with history | **Allure** |
| Track test stability over time | **Smart Reporter** |
| Custom logging/metrics | **Custom Listener** |

### Reporter Strengths

#### HTML Reporter
✅ Built-in, no additional setup
✅ Trace viewer for debugging
✅ Fast generation
❌ No historical trends
❌ Basic styling

#### Allure Reporter
✅ Beautiful, professional reports
✅ Rich metadata and annotations
✅ Historical trends
✅ Categorization and organization
❌ Requires additional tooling
❌ Slower report generation

#### Smart Reporter
✅ Flaky test detection
✅ Historical tracking
✅ Lightweight
❌ Limited customization
❌ Basic visualizations

---

## Screenshots and Videos

### Configuration

```typescript
use: {
  screenshot: 'only-on-failure',  // 'off' | 'on' | 'only-on-failure'
  video: 'retain-on-failure',     // 'off' | 'on' | 'retain-on-failure' | 'on-first-retry'
  trace: 'on'                     // 'off' | 'on' | 'retain-on-failure' | 'on-first-retry'
}
```

### Manual Screenshots

```typescript
// In test
await test.step('Capture screenshot', async () => {
  await testInfo.attach('my-screenshot', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png'
  });
});

// With AllureHelper
await AllureHelper.addScreenshot(page, 'state', 'Current state');
```

### Viewing Artifacts

- **HTML Reporter**: Click on test → View attachments
- **Allure Reporter**: Click on test → Attachments section
- **File System**: `reports/test-results/<test-name>/`

---

## Best Practices

### 1. Use Multiple Reporters

```typescript
// Combine for maximum value
reporter: [
  ['list'],              // Real-time feedback
  ['html'],              // Quick debugging
  ['junit'],             // CI/CD integration
  ['allure-playwright'], // Detailed reports
]
```

### 2. Attach Context

```typescript
await test.step('Action', async () => {
  // Perform action
  await page.click('#button');
  
  // Attach screenshot
  await testInfo.attach('after-click', {
    body: await page.screenshot(),
    contentType: 'image/png'
  });
});
```

### 3. Add Metadata

```typescript
// Use AllureHelper for rich metadata
await AllureHelper.addTestMetadata({
  description: 'Clear test description',
  tags: ['smoke', 'critical'],
  owner: 'Team Name'
});
```

### 4. Organize Reports

```
reports/
├── playwright-report/  # Quick checks
├── allure-results/     # Detailed analysis
├── smart-reports/      # Trend analysis
└── test-results/       # CI/CD consumption
```

### 5. Clean Old Reports

```bash
# Before running new tests
Remove-Item -Path "reports" -Recurse -Force -ErrorAction SilentlyContinue
```

---

## CI/CD Integration

### GitHub Actions

```yaml
- name: Run tests
  run: npx playwright test

- name: Upload HTML Report
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: reports/playwright-report/

- name: Upload Allure Results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: allure-results
    path: reports/allure-results/

- name: Publish Test Results
  if: always()
  uses: EnricoMi/publish-unit-test-result-action@v2
  with:
    files: reports/test-results/test-results.xml
```

### Viewing in CI

- **GitHub**: Actions → Run → Artifacts → Download reports
- **Jenkins**: HTML reports via HTML Publisher Plugin
- **GitLab**: Browse Job Artifacts

---

## Troubleshooting

### No Reports Generated

```bash
# Check reporter configuration
# Verify output directories exist
# Check for write permissions
mkdir -p reports
```

### Allure Report Empty

```bash
# Ensure allure-results has JSON files
ls reports/allure-results/

# Regenerate report
npm run allure:generate
```

### Screenshots Missing

```typescript
// Check configuration
use: {
  screenshot: 'on',  // Force screenshots
  video: 'on'        // Force videos
}
```

## Further Reading

- [Playwright Reporters](https://playwright.dev/docs/test-reporters)
- [Allure Documentation](https://docs.qameta.io/allure/)
- [JUnit XML Format](https://www.ibm.com/docs/en/developer-for-zos/14.1?topic=formats-junit-xml-format)
