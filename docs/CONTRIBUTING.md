# Contributing Guidelines

Thank you for considering contributing to this Playwright TypeScript framework! This document provides guidelines and best practices for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Commit Message Guidelines](#commit-message-guidelines)

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the best outcome for the project
- Accept constructive criticism gracefully

## Getting Started

### Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- Git
- Code editor (VS Code recommended)

### Initial Setup

```bash
# Fork and clone the repository
git clone <your-fork-url>
cd playwright-typescript-example

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Run tests to verify setup
npx playwright test --project=local
```

### Recommended VS Code Extensions

- Playwright Test for VSCode
- ESLint
- Prettier - Code formatter
- GitLens

## Development Workflow

### 1. Create a Branch

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Or bug fix branch
git checkout -b fix/bug-description
```

### Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or modifications

### 2. Make Changes

Follow the [Coding Standards](#coding-standards) section below.

### 3. Test Your Changes

```bash
# Run all tests
npx playwright test

# Run specific tests
npx playwright test --grep="your test"

# Run with UI mode for debugging
npx playwright test --ui

# Check code quality
npm run check
```

### 4. Commit Your Changes

Follow the [Commit Message Guidelines](#commit-message-guidelines).

```bash
git add .
git commit -m "feat: add new feature"
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

## Coding Standards

### TypeScript Guidelines

#### ✅ DO

```typescript
// Use explicit types
async login(username: string, password: string): Promise<void> {
  // Implementation
}

// Use readonly for properties that shouldn't change
readonly loginButton: Locator;

// Use async/await
async navigate(): Promise<void> {
  await this.page.goto(this.url);
}

// Use meaningful names
const isUserLoggedIn = await this.checkLoginStatus();

// Add JSDoc comments for public methods
/**
 * Navigate to the login page
 * @returns Promise that resolves when navigation is complete
 */
async navigate(): Promise<void> {
  // Implementation
}
```

#### ❌ DON'T

```typescript
// Don't use 'any' type
async doSomething(data: any) { } // Bad

// Don't leave public properties mutable
public loginButton: Locator; // Bad - use readonly

// Don't use .then() chains
this.page.goto(url).then(() => { }); // Bad - use async/await

// Don't use generic names
const x = await this.getData(); // Bad

// Don't skip documentation
async complexMethod() { } // Bad - needs JSDoc
```

### File Organization

```typescript
// Order of class members:
export class MyPage extends BasePage {
  // 1. Properties (readonly first)
  readonly url = 'https://example.com';
  readonly button: Locator;
  private cache: Map<string, string>;

  // 2. Constructor
  constructor(page: Page) {
    super(page);
    this.button = this.page.locator('#button');
  }

  // 3. Public methods
  async navigate(): Promise<void> { }
  async clickButton(): Promise<void> { }

  // 4. Private methods
  private async helper(): Promise<void> { }
}
```

### Import Organization

```typescript
// 1. Node.js built-ins
import { promises as fs } from 'fs';

// 2. External dependencies
import { Page, Locator } from '@playwright/test';

// 3. Internal imports - base classes
import { BasePage } from './BasePage';

// 4. Internal imports - utilities
import { Logger } from '../utils/Logger';

// 5. Types/Interfaces
import type { UserData } from '../types';
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Classes | PascalCase | `LoginPage`, `UserDataHelper` |
| Methods | camelCase | `navigate()`, `clickButton()` |
| Variables | camelCase | `userName`, `isLoggedIn` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES`, `API_URL` |
| Interfaces | PascalCase with 'I' prefix | `IUserData`, `IConfig` |
| Types | PascalCase | `UserRole`, `TestData` |
| Files | PascalCase for classes | `LoginPage.ts` |
| Files | camelCase for utilities | `dateHelper.ts` |

### Linting and Formatting

```bash
# Check for linting errors
npm run lint

# Fix linting errors automatically
npm run lint:fix

# Format and lint in one command
npm run check
```

## Testing Guidelines

### Test Structure

```typescript
import { test } from '../fixtures/PageFixtures';
import { expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async () => {
    // Setup
  });

  test('should perform action', async ({ page, myPage }) => {
    // Arrange
    await test.step('Setup', async () => {
      await myPage.navigate();
    });

    // Act
    await test.step('Perform action', async () => {
      await myPage.clickButton();
    });

    // Assert
    await test.step('Verify result', async () => {
      await expect(page.locator('.result')).toBeVisible();
    });
  });

  test.afterEach(async () => {
    // Cleanup
  });
});
```

### Test Naming

✅ **Good test names:**
```typescript
test('should login successfully with valid credentials')
test('should display error message for invalid password')
test('should navigate to dashboard after login')
```

❌ **Bad test names:**
```typescript
test('login') // Too vague
test('test1') // Not descriptive
test('it works') // Not specific
```

### Test Best Practices

#### ✅ DO

- Use fixtures for page objects
- Break tests into clear steps
- Add screenshots at key points
- Use meaningful assertions
- Keep tests independent
- Clean up test data

```typescript
test('good test', async ({ loginPage, page }) => {
  await test.step('Navigate and login', async () => {
    await loginPage.navigate();
    await loginPage.login('user@test.com', 'password');
  });

  await test.step('Verify dashboard', async () => {
    await expect(page).toHaveURL(/dashboard/);
    await testInfo.attach('dashboard', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });
});
```

#### ❌ DON'T

- Create page objects in tests
- Use hardcoded sleeps
- Share state between tests
- Skip error handling
- Leave debug code

```typescript
test('bad test', async ({ page }) => {
  const loginPage = new LoginPage(page); // Bad - use fixture
  await page.goto('https://example.com');
  await page.waitForTimeout(5000); // Bad - use proper waits
  // No error handling
  // No assertions
});
```

### Page Object Guidelines

#### ✅ DO

```typescript
export class GoodPage extends BasePage {
  readonly url = 'https://example.com';
  readonly button: Locator;

  constructor(page: Page) {
    super(page);
    this.button = this.page.getByRole('button', { name: 'Submit' });
  }

  /**
   * Click the submit button
   */
  async clickSubmit(): Promise<void> {
    this.logger.info('Clicking submit button');
    await this.button.click();
    await this.waitForPageLoad();
  }

  /**
   * Check if button is enabled
   */
  async isSubmitEnabled(): Promise<boolean> {
    return await this.button.isEnabled();
  }
}
```

#### ❌ DON'T

```typescript
export class BadPage {
  // No BasePage inheritance
  page: Page; // Not readonly

  constructor(page: Page) {
    this.page = page;
    // No logger initialization
  }

  // No JSDoc
  async click(): Promise<void> // Generic name
    await this.page.locator('#btn').click(); // Locator inline
    expect(this.page.url()).toContain('/next'); // Assertion in PO!
  }

  getButton() { // Not async, no return type
    return this.page.locator('#btn');
  }
}
```

## Pull Request Process

### Before Submitting

- [ ] All tests pass locally
- [ ] Code follows style guidelines
- [ ] Comments added for complex logic
- [ ] Documentation updated if needed
- [ ] No console.log or debug code
- [ ] Commit messages follow guidelines

### PR Title Format

```
<type>(<scope>): <description>

Examples:
feat(pages): add shopping cart page object
fix(tests): resolve flaky login test
docs(readme): update installation instructions
refactor(utils): improve logger performance
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Performance improvement

## Testing
- [ ] All existing tests pass
- [ ] New tests added
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots or GIFs

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added
- [ ] Documentation updated
- [ ] No warnings generated
```

### Review Process

1. Automated checks must pass (CI/CD)
2. At least one approval required
3. Address all review comments
4. Resolve merge conflicts
5. Squash commits if requested

## Commit Message Guidelines

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting)
- **refactor**: Code refactoring
- **test**: Test additions or changes
- **chore**: Build process or auxiliary tool changes

### Examples

```
feat(pages): add user profile page object

- Created UserProfilePage class
- Added profile editing methods
- Included validation helpers

Closes #123
```

```
fix(tests): resolve race condition in login test

The login test was failing intermittently due to a race
condition. Added proper wait for navigation to complete.

Fixes #456
```

```
docs(guide): update page object model documentation

- Added advanced patterns section
- Included more examples
- Fixed typos
```

### Scope Examples

- `pages` - Page object changes
- `tests` - Test file changes
- `utils` - Utility changes
- `config` - Configuration changes
- `fixtures` - Fixture changes
- `ci` - CI/CD changes

## Adding New Features

### New Page Object

1. Create page class in `src/pages/`
2. Extend `BasePage`
3. Add to `PageFixtures.ts`
4. Write tests
5. Update documentation

### New Utility

1. Create utility in `src/utils/`
2. Add comprehensive JSDoc
3. Export functions/classes
4. Write unit tests (if applicable)
5. Add usage examples in docs

### New Test Suite

1. Create test file matching `*Test*.ts`
2. Use existing fixtures
3. Follow test structure guidelines
4. Add descriptive test names
5. Include screenshots

## Documentation

### When to Update Docs

- Adding new features
- Changing existing behavior
- Adding new utilities
- Modifying configuration
- Improving processes

### Documentation Files

- `README.md` - Project overview
- `docs/GETTING_STARTED.md` - Setup guide
- `docs/ARCHITECTURE.md` - Design overview
- `docs/PAGE_OBJECTS.md` - POM guide
- `docs/UTILITIES.md` - Utility documentation
- `docs/REPORTING.md` - Reporting guide
- `docs/CONTRIBUTING.md` - This file

## Getting Help

- Check existing documentation
- Review similar implementations
- Ask in pull request discussions
- Reach out to maintainers

## Recognition

Contributors will be recognized in:
- Project README
- Release notes
- Contributor list

Thank you for contributing! 🎉
