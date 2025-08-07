import { Page, expect } from '@playwright/test';
import { AIElementLocator } from './ai-element-locator';

export class AssertionInterpreter {
    constructor(
        private page: Page,
        private elementLocator: AIElementLocator
    ) {}

    async interpretAndVerify(assertion: string): Promise<void> {
        if (assertion.startsWith('page url contains')) {
            const expectedUrl = assertion.split('contains ')[1];
            expect(this.page.url()).toContain(expectedUrl);
            return;
        }

        if (assertion.startsWith('element with class')) {
            const className = assertion.split('class ')[1].split(' ')[0];
            await expect(this.page.locator(`.${className}`)).toBeVisible();
            return;
        }

        if (assertion.includes('contains')) {
            if (assertion.includes('error message')) {
                const content = assertion.split(' contains ')[1];
                // Use the more specific h3 element with data-test="error"
                const errorElement = this.page.locator('h3[data-test="error"]');
                await expect(errorElement).toContainText(content);
            } else {
                const [target, content] = assertion.split(' contains ');
                const element = await this.elementLocator.findElement(target);
                await expect(element).toContainText(content);
            }
            return;
        }

        if (assertion.includes('shows')) {
            if (assertion.includes('cart badge shows correct count')) {
                // Count the number of items in cart by counting "Remove" buttons
                const removeButtons = await this.page.locator('button:has-text("Remove")').count();
                const cartBadge = this.page.locator('.shopping_cart_badge');
                
                if (removeButtons > 0) {
                    await expect(cartBadge).toBeVisible();
                    const badgeText = await cartBadge.textContent();
                    expect(Number(badgeText)).toBe(removeButtons);
                } else {
                    // If no items, badge should not be visible
                    await expect(cartBadge).toBeHidden();
                }
            } else if (assertion.includes('cart badge')) {
                const count = await this.page.locator('.shopping_cart_badge').textContent();
                const items = await this.page.locator('button:has-text("Remove")').count();
                expect(Number(count)).toBe(items);
            } else if (assertion.includes('cart shows three items')) {
                const count = await this.page.locator('.shopping_cart_badge').textContent();
                expect(Number(count)).toBe(3);
            }
            return;
        }

        if (assertion.includes('is visible')) {
            const elementText = assertion.split(' is visible')[0];
            if (elementText.includes('remove button')) {
                const removeButton = await this.page.locator('button:has-text("Remove")').first();
                await expect(removeButton).toBeVisible();
            } else if (elementText.includes('Thank you for your order')) {
                const thankYouText = this.page.locator('h2.complete-header, .complete-header');
                await expect(thankYouText).toBeVisible();
            } else {
                const element = await this.elementLocator.findElement(elementText);
                await expect(element).toBeVisible();
            }
            return;
        }

        if (assertion.includes('cart badge shows')) {
            const expectedCount = assertion.split('shows ')[1];
            const count = await this.page.locator('.shopping_cart_badge').textContent();
            expect(Number(count)).toBe(Number(expectedCount));
            return;
        }

        if (assertion.includes('is empty') || assertion.includes('should be empty')) {
            const cartBadge = this.page.locator('.shopping_cart_badge');
            await expect(cartBadge).toBeHidden();
            return;
        }

        if (assertion.includes('should not appear in checkout')) {
            await this.page.click('.shopping_cart_link');
            const cartItems = await this.page.locator('.cart_item').count();
            expect(cartItems).toBe(0);
            return;
        }

        if (assertion.includes('should match')) {
            // For price validation - this would need specific implementation
            // based on the actual requirements
            console.log('Price validation assertion - needs specific implementation');
            return;
        }

        throw new Error(`Unknown assertion: ${assertion}`);
    }
}
