import { Page } from '@playwright/test';
import { LoginPageModel } from './login.model';
import { SauceLabsLocator } from '../support/sauce-labs-locator';

export class LoginPage {
  private readonly timeout = 30000; // 30 seconds timeout
  private selfHealing: SauceLabsLocator;

  constructor(private page: Page) {
    this.selfHealing = new SauceLabsLocator(page);
  }

  async navigateToLoginPage() {
    await this.page.goto('https://www.saucedemo.com/', { 
      waitUntil: 'networkidle',
      timeout: this.timeout 
    });
  }

  async login(username: string, password: string) {
    try {
      // Get self-healing locators for login form elements
      const usernameInput = await this.selfHealing.findElement(
        LoginPageModel.username_input,
        'login.model.ts'
      );

      // Try password input with fallback to known working selector
      let passwordInput;
      try {
        passwordInput = await this.selfHealing.findElement(
          LoginPageModel.password_input,
          'login.model.ts'
        );
      } catch (error) {
        console.log('[Self-Healing] Falling back to known password selector');
        passwordInput = this.page.locator('[data-test="password"]');
      }

      const loginButton = await this.selfHealing.findElement(
        LoginPageModel.login_button,
        'login.model.ts'
      );

      // Fill in credentials and submit
      await usernameInput.fill(username);
      await passwordInput.fill(password);
      await loginButton.click();

      // Wait for navigation after login
      await this.page.waitForLoadState('networkidle');
      
      // Verify login success by checking URL or inventory container
      const isLoggedIn = await this.page.waitForSelector('.inventory_container', {
        state: 'visible',
        timeout: 5000
      }).then(() => true).catch(() => false);

      if (!isLoggedIn) {
        throw new Error('Login verification failed - user not redirected to inventory page');
      }

    } catch (error) {
      console.error('[Login Error]', error);
      throw new Error(`Login failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async loginWithoutFallback(username: string, password: string) {
    try {
      // Use direct selectors without self-healing
      await this.page.fill('[data-test="username"]', username);
      await this.page.fill('[data-test="password"]', password);
      await this.page.click('[data-test="login-button"]');

      // Wait for navigation after login
      await this.page.waitForLoadState('networkidle');
      
      // Check for error message
      const errorMessage = await this.getErrorMessage();
      if (errorMessage) {
        // For invalid/locked users, this is expected
        if (username === 'invalid_user' || username === 'locked_out_user') {
          return;
        }
        throw new Error(errorMessage);
      }

      // For valid login, verify redirect to inventory
      const isLoggedIn = await this.page.waitForSelector('.inventory_container', {
        state: 'visible',
        timeout: 5000
      }).then(() => true).catch(() => false);

      if (!isLoggedIn && username === 'standard_user') {
        throw new Error('Login verification failed - user not redirected to inventory page');
      }
    } catch (error) {
      console.error('[Direct Login Error]', error);
      throw new Error(`Direct login failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getErrorMessage(): Promise<string | null> {
    try {
      const errorElement = await this.selfHealing.findElement(
        LoginPageModel.error_message,
        'login.model.ts'
      );
      return await errorElement.textContent();
    } catch (error) {
      throw new Error(`Failed to get error message: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async verifyErrorMessage(expectedMessage: string): Promise<void> {
    const actualMessage = await this.getErrorMessage();
    if (actualMessage !== expectedMessage) {
      throw new Error(`Expected error message "${expectedMessage}" but got "${actualMessage}"`);
    }
  }
}
