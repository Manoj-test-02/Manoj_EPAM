import { Page } from '@playwright/test';
import { LoginPageModel } from './login.model';

export class LoginPage {
  private readonly timeout = 30000; // 30 seconds timeout

  constructor(private page: Page) {}

  async navigateToLoginPage() {
    await this.page.goto('https://www.saucedemo.com/', { 
      waitUntil: 'networkidle',
      timeout: this.timeout 
    });
  }

  async login(username: string, password: string) {
    await this.page.waitForSelector(LoginPageModel.username_input, { timeout: this.timeout });
    await this.page.fill(LoginPageModel.username_input, username);
    await this.page.waitForSelector(LoginPageModel.password_input, { timeout: this.timeout });
    await this.page.fill(LoginPageModel.password_input, password);
    await this.page.waitForSelector(LoginPageModel.login_button, { timeout: this.timeout });
    await this.page.click(LoginPageModel.login_button);
  }

  async getErrorMessage() {
    return await this.page.textContent(LoginPageModel.error_message);
  }
}
