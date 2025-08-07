import { Page, Locator } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export class SauceLabsLocator {
    private static readonly MODEL_DIR = path.join(__dirname, '..', 'models');
    
    constructor(private page: Page) {}

    async findElement(originalSelector: string, modelFile: string): Promise<Locator> {
        try {
            // First try with original selector
            const element = this.page.locator(originalSelector);
            await element.waitFor({ state: 'visible', timeout: 5000 });
            return element;
        } catch (error) {
            console.log(`[Self-Healing] Original selector failed: ${originalSelector}`);
            
            // Get element type from selector
            const elementType = this.getElementType(originalSelector);
            const newSelector = await this.findSauceLabsSelector(elementType);
            
            if (newSelector) {
                console.log(`[Self-Healing] Found alternative selector: ${newSelector}`);
                
                // Verify new selector works before updating
                const newElement = this.page.locator(newSelector);
                try {
                    await newElement.waitFor({ state: 'visible', timeout: 5000 });
                    // Update model file only if new selector works
                    await this.updateModelFile(modelFile, originalSelector, newSelector);
                    return newElement;
                } catch (verifyError) {
                    console.log(`[Self-Healing] New selector verification failed: ${newSelector}`);
                }
            }
            
            // If we get here, try the default Sauce Labs selectors as fallback
            const defaultSelector = this.getDefaultSauceLabsSelector(elementType);
            if (defaultSelector) {
                const fallbackElement = this.page.locator(defaultSelector);
                await fallbackElement.waitFor({ state: 'visible', timeout: 5000 });
                return fallbackElement;
            }
            
            throw new Error(`Unable to find alternative selector for: ${originalSelector}`);
        }
    }

    private getElementType(selector: string): string {
        // Determine element type based on selector content
        if (selector.toLowerCase().includes('password')) return 'password';
        if (selector.toLowerCase().includes('username')) return 'username';
        if (selector.toLowerCase().includes('login')) return 'login';
        if (selector.toLowerCase().includes('error')) return 'error';
        return 'unknown';
    }

    private getDefaultSauceLabsSelector(elementType: string): string | null {
        // Default known working selectors for Sauce Labs
        const defaultSelectors: { [key: string]: string } = {
            password: '[data-test="password"]',
            username: '[data-test="username"]',
            login: '[data-test="login-button"]',
            error: '[data-test="error"]'
        };
        return defaultSelectors[elementType] || null;
    }

    private async findSauceLabsSelector(elementType: string): Promise<string | null> {
        // Sauce Labs specific selectors
        const sauceLabsSelectors = {
            password: '[data-test="password"]',
            username: '[data-test="username"]',
            login: '[data-test="login-button"]',
            error: '[data-test="error"]',
            cart: '[data-test="add-to-cart"]',
            remove: '[data-test="remove"]',
            checkout: '[data-test="checkout"]',
            sort: '[data-test="product_sort_container"]'
        };

        if (elementType in sauceLabsSelectors) {
            const selector = sauceLabsSelectors[elementType as keyof typeof sauceLabsSelectors];
            try {
                const element = this.page.locator(selector);
                await element.waitFor({ state: 'visible', timeout: 2000 });
                return selector;
            } catch {
                return null;
            }
        }

        // If no specific selector found, try common data-test attributes
        try {
            const elements = await this.page.$$('[data-test]');
            for (const element of elements) {
                const dataTest = await element.getAttribute('data-test');
                if (dataTest?.includes(elementType.toLowerCase())) {
                    return `[data-test="${dataTest}"]`;
                }
            }
        } catch {
            return null;
        }

        return null;
    }

    private async updateModelFile(modelFile: string, oldSelector: string, newSelector: string): Promise<void> {
        const filePath = path.join(SauceLabsLocator.MODEL_DIR, modelFile);
        if (!fs.existsSync(filePath)) return;

        let content = fs.readFileSync(filePath, 'utf8');
        const escapedOldSelector = oldSelector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(['"\`])${escapedOldSelector}\\1`, 'g');
        
        content = content.replace(regex, `'${newSelector}'`);
        fs.writeFileSync(filePath, content);
        
        console.log(`[Self-Healing] Updated model file: ${modelFile}`);
        console.log(`[Self-Healing] Old selector: ${oldSelector}`);
        console.log(`[Self-Healing] New selector: ${newSelector}`);
    }
}
