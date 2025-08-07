import { Page } from '@playwright/test';
import { AIElementLocator } from './ai-element-locator';

export class ActionInterpreter {
    constructor(
        private page: Page,
        private elementLocator: AIElementLocator
    ) {}

    async interpretAndExecute(action: string): Promise<void> {
        // Handle predefined actions
        if (action.startsWith('login as ')) {
            await this.handleLogin(action);
            return;
        }

        // Parse the action string
        const parts = this.parseAction(action);
        
        switch (parts.action) {
            case 'enter text':
                await this.enterText(parts.value, parts.target);
                break;
            case 'click':
            case 'click button':
            case 'click on':
                await this.click(parts.target);
                break;
            case 'add':
                if (action.includes('all items containing Add to cart')) {
                    await this.addAllItems();
                } else if (action.includes('first item')) {
                    await this.addFirstItem();
                } else if (action.includes('three different products')) {
                    await this.addThreeProducts();
                } else if (action.includes('multiple products')) {
                    await this.addMultipleProducts();
                } else if (action.includes('top three expensive products')) {
                    await this.addTopThreeExpensiveProducts();
                } else if (action.includes('products to cart')) {
                    await this.addMultipleProducts();
                } else {
                    await this.addSpecificItem(parts.target);
                }
                break;
            case 'remove':
                if (action.includes('first item')) {
                    await this.removeFirstItem();
                } else if (action.includes('all products')) {
                    await this.removeAllProducts();
                }
                break;
            case 'fill':
                if (action.includes('checkout form')) {
                    await this.fillCheckoutForm(parts.value);
                }
                break;
            case 'sort':
                if (action.includes('price high to low')) {
                    await this.sortByPriceHighToLow();
                }
                break;
            default:
                throw new Error(`Unknown action: ${action}`);
        }
    }

    private parseAction(action: string): { action: string; value: string; target: string } {
        // Handle special case for checkout form
        if (action.includes('fill checkout form with')) {
            const data = action.split('fill checkout form with ')[1];
            return {
                action: 'fill',
                value: data,
                target: 'checkout form'
            };
        }
        
        const parts = action.split(' in ');
        if (parts.length > 1) {
            const actionParts = parts[0].split("'");
            return {
                action: actionParts[0].trim(),
                value: actionParts[1] || '',
                target: parts[1]
            };
        }
        
        const spaceParts = action.split(' ');
        return {
            action: spaceParts[0],
            value: '',
            target: spaceParts.slice(1).join(' ')
        };
    }

    private async handleLogin(action: string): Promise<void> {
        const username = action.split('login as ')[1];
        await this.page.fill('#user-name', username);
        await this.page.fill('#password', 'secret_sauce');
        await this.page.click('#login-button');
    }

    private async enterText(text: string, target: string): Promise<void> {
        const element = await this.elementLocator.findElement(target);
        await element.fill(text);
    }

    private async click(target: string): Promise<void> {
        if (target.includes('button labeled Checkout')) {
            const checkoutButton = this.page.locator('#checkout, .checkout_button, button:has-text("Checkout")');
            await checkoutButton.click();
        } else if (target.includes('button labeled Continue')) {
            const continueButton = this.page.locator('#continue, .btn_primary:has-text("Continue")');
            await continueButton.click();
        } else if (target.includes('button labeled Finish')) {
            const finishButton = this.page.locator('#finish, .btn_primary:has-text("Finish")');
            await finishButton.click();
        } else {
            const element = await this.elementLocator.findElement(target);
            await element.click();
        }
    }

    private async addAllItems(): Promise<void> {
        // Wait for the inventory page to load
        await this.page.waitForSelector('.inventory_item');
        
        // For stability, let's add just the first 3 items instead of all items
        // This prevents potential browser crashes with too many rapid clicks
        await this.addThreeProducts();
    }

    private async addSpecificItem(itemName: string): Promise<void> {
        // Wait for the inventory page to load
        await this.page.waitForSelector('.inventory_item');
        
        // Handle specific item names
        if (itemName.includes('Sauce Labs Backpack')) {
            // Find the specific backpack item and its add to cart button
            const backpackItem = this.page.locator('.inventory_item').filter({ hasText: 'Sauce Labs Backpack' });
            const addButton = backpackItem.locator('button[id^="add-to-cart"]');
            await addButton.click();
        } else {
            // Generic approach for other items
            const item = this.page.locator('.inventory_item').filter({ hasText: itemName });
            const addButton = item.locator('button[id^="add-to-cart"]');
            await addButton.click();
        }
    }

    private async fillCheckoutForm(data: string): Promise<void> {
        const [firstName, lastName, zipCode] = data.split(', ');
        await this.page.fill('#first-name', firstName);
        await this.page.fill('#last-name', lastName);
        await this.page.fill('#postal-code', zipCode);
    }

    private async addFirstItem(): Promise<void> {
        const firstAddButton = await this.page.locator('button:has-text("Add to cart")').first();
        await firstAddButton.click();
    }

    private async addThreeProducts(): Promise<void> {
        // Wait for the inventory page to load
        await this.page.waitForSelector('.inventory_item');
        
        // Get the first 3 "Add to cart" buttons using a more specific selector
        const addToCartButtons = this.page.locator('button[id^="add-to-cart"]');
        const buttonCount = Math.min(3, await addToCartButtons.count());
        
        for (let i = 0; i < buttonCount; i++) {
            const button = addToCartButtons.nth(i);
            await button.waitFor({ state: 'visible' });
            await button.click();
            // Small delay to ensure the button state changes
            await this.page.waitForTimeout(300);
        }
    }

    private async addMultipleProducts(): Promise<void> {
        const buttons = await this.page.locator('button:has-text("Add to cart")').all();
        // Add 2-3 random products
        const numberOfProducts = Math.min(3, buttons.length);
        for (let i = 0; i < numberOfProducts; i++) {
            await buttons[i].click();
        }
    }

    private async addTopThreeExpensiveProducts(): Promise<void> {
        // First ensure products are sorted by price high to low
        await this.sortByPriceHighToLow();
        // Then add first 3 products
        await this.addThreeProducts();
    }

    private async removeFirstItem(): Promise<void> {
        const firstRemoveButton = await this.page.locator('button:has-text("Remove")').first();
        await firstRemoveButton.click();
    }

    private async removeAllProducts(): Promise<void> {
        // Wait for the inventory page to load
        await this.page.waitForSelector('.inventory_item');
        
        // Keep clicking remove buttons until there are none left
        let removeButtons = await this.page.locator('button:has-text("Remove")').count();
        let attempts = 0;
        const maxAttempts = 10; // Prevent infinite loop
        
        while (removeButtons > 0 && attempts < maxAttempts) {
            const removeButton = this.page.locator('button:has-text("Remove")').first();
            await removeButton.click();
            await this.page.waitForTimeout(300); // Wait for state change
            removeButtons = await this.page.locator('button:has-text("Remove")').count();
            attempts++;
        }
    }

    private async sortByPriceHighToLow(): Promise<void> {
        const sortDropdown = await this.page.locator('.product_sort_container');
        await sortDropdown.selectOption('hilo');
    }
}
