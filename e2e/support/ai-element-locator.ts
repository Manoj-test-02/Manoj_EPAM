import { Page } from '@playwright/test';

export class AIElementLocator {
    constructor(private page: Page) {}

    async findElement(description: string): Promise<any> {
        if (!description) {
            throw new Error('Element description cannot be empty');
        }

        // Handle common field descriptions for SauceDemo
        if (description.includes('field labeled Username') || description.includes('Username')) {
            const usernameField = this.page.locator('#user-name');
            if (await usernameField.count() > 0) {
                return usernameField;
            }
        }

        if (description.includes('field labeled Password') || description.includes('Password')) {
            const passwordField = this.page.locator('#password');
            if (await passwordField.count() > 0) {
                return passwordField;
            }
        }

        if (description.includes('button labeled Login') || description.includes('Login')) {
            const loginButton = this.page.locator('#login-button');
            if (await loginButton.count() > 0) {
                return loginButton;
            }
        }

        if (description.includes('shopping cart')) {
            const cartLink = this.page.locator('.shopping_cart_link');
            if (await cartLink.count() > 0) {
                return cartLink;
            }
        }

        // Try by placeholder first
        const byPlaceholder = this.page.locator(`[placeholder*="${description}" i]`).first();
        if (await byPlaceholder.count() > 0) {
            return byPlaceholder;
        }

        // First try by label or aria-label
        const byLabel = this.page.locator(`label:has-text("${description}")`).first();
        if (await byLabel.count() > 0) {
            const forAttribute = await byLabel.getAttribute('for');
            if (forAttribute) {
                const inputElement = this.page.locator(`#${forAttribute}`);
                if (await inputElement.count() > 0) {
                    return inputElement;
                }
            }
        }

        // Try by button text (case insensitive)
        const byButtonText = this.page.locator(`button:has-text("${description}")`).first();
        if (await byButtonText.count() > 0) {
            return byButtonText;
        }

        // Try by input type and name for common fields
        if (description.toLowerCase().includes('username') || description.toLowerCase().includes('user')) {
            const userInput = this.page.locator('input[type="text"]').first();
            if (await userInput.count() > 0) {
                return userInput;
            }
        }

        if (description.toLowerCase().includes('password')) {
            const passwordInput = this.page.locator('input[type="password"]').first();
            if (await passwordInput.count() > 0) {
                return passwordInput;
            }
        }

        // Try by text content
        const byText = this.page.locator(`text="${description}"`).first();
        if (await byText.count() > 0) {
            return byText;
        }

        // Try by class if description contains 'class'
        if (description.includes('class')) {
            const className = description.split('class ')[1].split(' ')[0];
            const byClass = this.page.locator(`.${className}`);
            if (await byClass.count() > 0) {
                return byClass;
            }
        }

        // Fallback to any visible element containing the text
        const byVisibleText = this.page.locator(`*:visible:has-text("${description}")`).first();
        if (await byVisibleText.count() > 0) {
            return byVisibleText;
        }

        throw new Error(`Could not find element matching description: ${description}`);
    }

    async findElements(description: string): Promise<any> {
        if (description.includes('containing')) {
            const searchText = description.split('containing ')[1];
            return this.page.locator(`*:has-text("${searchText}")`);
        }
        return this.page.locator(`*:has-text("${description}")`);
    }
}
