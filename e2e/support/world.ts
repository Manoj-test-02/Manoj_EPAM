import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { Browser, BrowserContext, chromium, Page } from '@playwright/test';

export class CustomWorld extends World {
  private browser: Browser | undefined;
  public context: BrowserContext | undefined;
  public page: Page | undefined;
  public scenarioName: string;

  static readonly DEFAULT_TIMEOUT = 30000; // 30 seconds

  constructor(options: IWorldOptions) {
    super(options);
    this.scenarioName = '';
  }

  async init(): Promise<void> {
    this.browser = await chromium.launch({ headless: false });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
  }

  async cleanup(): Promise<void> {
    try {
      if (this.page) {
        await this.page.close();
        this.page = undefined;
      }
    } catch (error) {
      console.error('Error closing page:', error);
    }
    
    try {
      if (this.context) {
        await this.context.close();
        this.context = undefined;
      }
    } catch (error) {
      console.error('Error closing context:', error);
    }
    
    try {
      if (this.browser) {
        await this.browser.close();
        this.browser = undefined;
      }
    } catch (error) {
      console.error('Error closing browser:', error);
    }
  }

  setScenarioName(name: string): void {
    this.scenarioName = name;
  }

  getScenarioName(): string {
    return this.scenarioName;
  }
}

setWorldConstructor(CustomWorld);
