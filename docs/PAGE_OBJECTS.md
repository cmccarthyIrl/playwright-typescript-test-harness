# Page Object Model Guide

This guide explains how to implement and use the Page Object Model (POM) pattern in this framework.

## What is Page Object Model?

The Page Object Model is a design pattern that:
- Encapsulates web page structure and behavior
- Separates test logic from page interaction details
- Makes tests more maintainable and readable
- Reduces code duplication

## Framework Structure

```
src/pages/
├── BasePage.ts           # Base class with common functionality
└── wikipedia/            # Feature-specific folder
    ├── WikipediaHomePage.ts
    └── WikimediaCommonsPage.ts
```

## Base Page Class

All page objects inherit from `BasePage`:

```typescript
// src/pages/BasePage.ts
import { Page } from '@playwright/test';
import { Logger } from '../utils/Logger';

export class BasePage {
  protected page: Page;
  protected logger: Logger;

  constructor(page: Page) {
    this.page = page;
    this.logger = Logger.for(this.constructor.name);
  }

  /**
   * Wait for page to fully load
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    this.logger.debug('Page loaded successfully');
  }

  /**
   * Wait for specific element to be visible
   */
  async waitForElement(locator: Locator, timeout = 30000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Take a screenshot
   */
  async takeScreenshot(name: string): Promise<Buffer> {
    return await this.page.screenshot({ fullPage: true });
  }
}
```

### BasePage Benefits

✅ **Shared functionality** - Common methods available to all pages
✅ **Consistent logging** - Every page has a logger
✅ **Type safety** - TypeScript support throughout
✅ **Less boilerplate** - Don't repeat common patterns

## Creating a Page Object

### Step 1: Define the Class

```typescript
// src/pages/example/LoginPage.ts
import { Locator, Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class LoginPage extends BasePage {
  // Define the page URL
  readonly url = 'https://example.com/login';
  
  // Define locators as readonly properties
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page); // Call parent constructor
    
    // Initialize locators
    this.usernameInput = this.page.locator('#username');
    this.passwordInput = this.page.locator('#password');
    this.loginButton = this.page.locator('button[type="submit"]');
    this.errorMessage = this.page.locator('.error-message');
  }

  /**
   * Navigate to login page
   */
  async navigate(): Promise<void> {
    this.logger.info(`Navigating to ${this.url}`);
    await this.page.goto(this.url);
    await this.waitForPageLoad();
  }

  /**
   * Perform login action
   */
  async login(username: string, password: string): Promise<void> {
    this.logger.info(`Logging in as: ${username}`);
    
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    
    await this.waitForPageLoad();
    this.logger.info('Login attempted');
  }

  /**
   * Check if error message is displayed
   */
  async hasError(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    await this.waitForElement(this.errorMessage);
    return await this.errorMessage.textContent() || '';
  }
}
```

### Step 2: Add to Fixtures

```typescript
// src/fixtures/PageFixtures.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/example/LoginPage';

type PageFixtures = {
  loginPage: LoginPage;
  // ... other page fixtures
};

export const test = base.extend<PageFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
});
```

### Step 3: Use in Tests

```typescript
// src/tests/LoginTest.ts
import { expect } from '@playwright/test';
import { test } from '../fixtures/PageFixtures';

test.describe('Login Tests', () => {
  test('should login successfully', async ({ loginPage }) => {
    await test.step('Navigate to login page', async () => {
      await loginPage.navigate();
    });

    await test.step('Enter credentials and login', async () => {
      await loginPage.login('user@example.com', 'password123');
    });

    await test.step('Verify no error displayed', async () => {
      const hasError = await loginPage.hasError();
      expect(hasError).toBe(false);
    });
  });

  test('should show error for invalid credentials', async ({ loginPage }) => {
    await loginPage.navigate();
    await loginPage.login('invalid@example.com', 'wrongpassword');
    
    const hasError = await loginPage.hasError();
    expect(hasError).toBe(true);
    
    const errorText = await loginPage.getErrorMessage();
    expect(errorText).toContain('Invalid credentials');
  });
});
```

## Locator Strategies

### Best Practices

✅ **Use data-testid** for test-specific selectors
```typescript
this.submitButton = this.page.locator('[data-testid="submit-btn"]');
```

✅ **Use role-based selectors** for accessibility
```typescript
this.heading = this.page.getByRole('heading', { name: 'Welcome' });
this.submitButton = this.page.getByRole('button', { name: 'Submit' });
```

✅ **Use text for unique content**
```typescript
this.loginLink = this.page.getByText('Log In');
```

❌ **Avoid brittle selectors**
```typescript
// Bad - breaks if structure changes
this.button = this.page.locator('div > div > button:nth-child(3)');

// Good - semantic and stable
this.button = this.page.getByRole('button', { name: 'Submit' });
```

### Locator Examples

```typescript
export class ExamplePage extends BasePage {
  // By role (recommended)
  readonly heading = this.page.getByRole('heading', { name: 'Dashboard' });
  readonly submitBtn = this.page.getByRole('button', { name: 'Submit' });
  
  // By test ID (most stable)
  readonly userMenu = this.page.locator('[data-testid="user-menu"]');
  
  // By label (for form fields)
  readonly emailInput = this.page.getByLabel('Email Address');
  
  // By placeholder
  readonly searchInput = this.page.getByPlaceholder('Search...');
  
  // By text
  readonly welcomeText = this.page.getByText('Welcome back!');
  
  // By CSS (when necessary)
  readonly customElement = this.page.locator('.custom-class');
  
  // By XPath (last resort)
  readonly complexElement = this.page.locator('xpath=//div[@class="complex"]');
  
  // Chained locators
  readonly tableRow = this.page
    .locator('table')
    .locator('tr')
    .filter({ hasText: 'Active' });
}
```

## Page Object Patterns

### Pattern 1: Simple Actions

```typescript
export class DashboardPage extends BasePage {
  readonly logoutButton = this.page.getByRole('button', { name: 'Logout' });

  async logout(): Promise<void> {
    this.logger.info('Logging out');
    await this.logoutButton.click();
    await this.waitForPageLoad();
  }
}
```

### Pattern 2: Form Filling

```typescript
export class RegistrationPage extends BasePage {
  readonly firstNameInput = this.page.getByLabel('First Name');
  readonly lastNameInput = this.page.getByLabel('Last Name');
  readonly emailInput = this.page.getByLabel('Email');
  readonly submitButton = this.page.getByRole('button', { name: 'Register' });

  async fillRegistrationForm(data: {
    firstName: string;
    lastName: string;
    email: string;
  }): Promise<void> {
    this.logger.info('Filling registration form');
    
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    await this.emailInput.fill(data.email);
  }

  async submitForm(): Promise<void> {
    await this.submitButton.click();
    await this.waitForPageLoad();
  }
}
```

### Pattern 3: Navigation

```typescript
export class NavigationPage extends BasePage {
  async navigateToSection(section: string): Promise<void> {
    this.logger.info(`Navigating to ${section}`);
    
    const link = this.page.getByRole('link', { name: section });
    await link.click();
    await this.waitForPageLoad();
  }

  async searchFor(query: string): Promise<void> {
    const searchBox = this.page.getByPlaceholder('Search');
    await searchBox.fill(query);
    await searchBox.press('Enter');
    await this.waitForPageLoad();
  }
}
```

### Pattern 4: Verification Methods

```typescript
export class ProductPage extends BasePage {
  readonly productTitle = this.page.locator('h1.product-title');
  readonly productPrice = this.page.locator('.price');
  readonly addToCartBtn = this.page.getByRole('button', { name: 'Add to Cart' });

  async getProductTitle(): Promise<string> {
    return await this.productTitle.textContent() || '';
  }

  async getProductPrice(): Promise<string> {
    return await this.productPrice.textContent() || '';
  }

  async isAddToCartVisible(): Promise<boolean> {
    return await this.addToCartBtn.isVisible();
  }
}
```

### Pattern 5: Component-Based

```typescript
// For reusable page components
export class HeaderComponent {
  private page: Page;
  private logger: Logger;

  readonly logo = this.page.locator('.logo');
  readonly navMenu = this.page.locator('nav');

  constructor(page: Page) {
    this.page = page;
    this.logger = Logger.for('HeaderComponent');
  }

  async clickLogo(): Promise<void> {
    await this.logo.click();
  }
}

export class HomePage extends BasePage {
  readonly header: HeaderComponent;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
  }
}
```

## Advanced Techniques

### Dynamic Locators

```typescript
export class UserListPage extends BasePage {
  getUserRow(username: string): Locator {
    return this.page.locator(`tr:has-text("${username}")`);
  }

  async deleteUser(username: string): Promise<void> {
    const row = this.getUserRow(username);
    const deleteBtn = row.getByRole('button', { name: 'Delete' });
    await deleteBtn.click();
  }
}
```

### Waiting Strategies

```typescript
export class AsyncPage extends BasePage {
  readonly loader = this.page.locator('.spinner');
  readonly content = this.page.locator('.content');

  async waitForContentLoad(): Promise<void> {
    // Wait for loader to disappear
    await this.loader.waitFor({ state: 'hidden' });
    
    // Wait for content to appear
    await this.content.waitFor({ state: 'visible' });
  }

  async waitForSpecificText(text: string): Promise<void> {
    await this.page.waitForSelector(`text=${text}`);
  }
}
```

### File Upload

```typescript
export class UploadPage extends BasePage {
  readonly fileInput = this.page.locator('input[type="file"]');
  readonly uploadButton = this.page.getByRole('button', { name: 'Upload' });

  async uploadFile(filePath: string): Promise<void> {
    this.logger.info(`Uploading file: ${filePath}`);
    await this.fileInput.setInputFiles(filePath);
    await this.uploadButton.click();
  }
}
```

### Handling Dialogs

```typescript
export class AlertPage extends BasePage {
  async handleConfirmDialog(accept: boolean): Promise<void> {
    this.page.on('dialog', async dialog => {
      this.logger.info(`Dialog message: ${dialog.message()}`);
      if (accept) {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });
  }
}
```

## Organizing Page Objects

### By Feature/Module

```
src/pages/
├── BasePage.ts
├── auth/
│   ├── LoginPage.ts
│   └── RegisterPage.ts
├── dashboard/
│   ├── DashboardPage.ts
│   └── SettingsPage.ts
└── product/
    ├── ProductListPage.ts
    └── ProductDetailPage.ts
```

### By User Journey

```
src/pages/
├── BasePage.ts
├── onboarding/
│   ├── WelcomePage.ts
│   ├── ProfileSetupPage.ts
│   └── CompletionPage.ts
└── checkout/
    ├── CartPage.ts
    ├── CheckoutPage.ts
    └── ConfirmationPage.ts
```

## Best Practices

### ✅ DO

- **Inherit from BasePage** for shared functionality
- **Use meaningful method names** that describe actions
- **Return Promises** for all async operations
- **Log important actions** using the logger
- **Keep methods focused** - one action per method
- **Use TypeScript types** for parameters
- **Make locators readonly** to prevent accidental changes

### ❌ DON'T

- **Don't add assertions** in page objects (keep in tests)
- **Don't make page objects too complex** - split if needed
- **Don't use sleeps** - use proper waits
- **Don't expose implementation details** to tests
- **Don't hardcode test data** in page objects

## Common Mistakes

### Mistake 1: Assertions in Page Objects

```typescript
// ❌ Bad
async login(username: string, password: string): Promise<void> {
  await this.usernameInput.fill(username);
  await this.passwordInput.fill(password);
  await this.loginButton.click();
  expect(this.page.url()).toContain('/dashboard'); // Wrong!
}

// ✅ Good
async login(username: string, password: string): Promise<void> {
  await this.usernameInput.fill(username);
  await this.passwordInput.fill(password);
  await this.loginButton.click();
}

// In test:
await loginPage.login('user', 'pass');
expect(page.url()).toContain('/dashboard'); // Correct!
```

### Mistake 2: Not Using Fixtures

```typescript
// ❌ Bad
test('my test', async ({ page }) => {
  const loginPage = new LoginPage(page); // Manual instantiation
  await loginPage.navigate();
});

// ✅ Good
test('my test', async ({ loginPage }) => { // Fixture injection
  await loginPage.navigate();
});
```

## Further Reading

- [Playwright Locators](https://playwright.dev/docs/locators)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Models](https://playwright.dev/docs/pom)
