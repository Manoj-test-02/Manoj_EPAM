import { Page } from '@playwright/test';
import { InventoryPageModel } from './inventory.model';

export class InventoryPage {
    constructor(private page: Page) {}

    // Checkout form selectors
    private readonly firstNameInput = '#first-name';
    private readonly lastNameInput = '#last-name';
    private readonly zipCodeInput = '#postal-code';
    private readonly continueButton = '#continue';
    private readonly finishButton = '#finish';
    private readonly successMessage = '.complete-header';

    async isOnInventoryPage(): Promise<boolean> {
        const container = await this.page.waitForSelector(InventoryPageModel.inventory_page);
        return container !== null;
    }

    async addProductToCart(productName?: string) {
        if (productName) {
            const productItem = await this.page.locator(InventoryPageModel.product_item)
                .filter({ hasText: productName });
            await productItem.locator(InventoryPageModel.add_to_cart_button).click();
        } else {
            await this.page.locator(InventoryPageModel.add_to_cart_button).first().click();
        }
    }

    async addMultipleProducts(count: number) {
        const buttons = await this.page.$$(InventoryPageModel.add_to_cart_button);
        for (let i = 0; i < Math.min(count, buttons.length); i++) {
            await buttons[i].click();
        }
    }

    async getCartBadgeCount(): Promise<number> {
        const badge = await this.page.locator(InventoryPageModel.cart_badge);
        if (await badge.isVisible()) {
            const text = await badge.textContent();
            return parseInt(text || '0', 10);
        }
        return 0;
    }

    async isRemoveButtonEnabled(productName?: string): Promise<boolean> {
        const removeButton = productName 
            ? await this.page.locator(InventoryPageModel.product_item)
                .filter({ hasText: productName })
                .locator(InventoryPageModel.remove_button)
            : await this.page.locator(InventoryPageModel.remove_button).first();
        return await removeButton.isEnabled();
    }

    async removeProduct(productName?: string) {
        if (productName) {
            const productItem = await this.page.locator(InventoryPageModel.product_item)
                .filter({ hasText: productName });
            await productItem.locator(InventoryPageModel.remove_button).click();
        } else {
            await this.page.locator(InventoryPageModel.remove_button).first().click();
        }
    }

    async removeAllProducts() {
        const removeButtons = await this.page.$$(InventoryPageModel.remove_button);
        for (const button of removeButtons) {
            await button.click();
        }
    }

    async proceedToCheckout() {
        await this.page.click(InventoryPageModel.cart_link);
        await this.page.click(InventoryPageModel.checkout_button);
    }

    async isCheckoutButtonEnabled(): Promise<boolean> {
        const button = await this.page.locator(InventoryPageModel.checkout_button);
        return await button.isEnabled();
    }

    async getProductPrices(): Promise<number[]> {
        const priceElements = await this.page.$$(InventoryPageModel.product_price);
        const prices: number[] = [];
        for (const element of priceElements) {
            const priceText = await element.textContent();
            if (priceText) {
                prices.push(parseFloat(priceText.replace('$', '')));
            }
        }
        return prices;
    }

    async sortByPriceHighToLow() {
        try {
            // Wait for and locate the sort dropdown
            const dropdown = this.page.locator('select.product_sort_container');
            
            await dropdown.waitFor({ 
                state: 'visible',
                timeout: 10000 
            });

            // Select the high to low option
            await dropdown.selectOption({ value: 'hilo' });
            
            // Wait for products to re-render
            await this.page.waitForTimeout(2000);
        } catch (error: unknown) {
            throw new Error(`Failed to sort products: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async addTopExpensiveProducts(count: number) {
        await this.sortByPriceHighToLow();
        await this.addMultipleProducts(count);
    }

    async getCartTotal(): Promise<number> {
        const prices = await this.getProductPrices();
        return prices.reduce((sum, price) => sum + price, 0);
    }

    async isProductInCheckout(productName: string): Promise<boolean> {
        const items = this.page.locator(InventoryPageModel.checkout_items);
        const count = await items.count();
        for (let i = 0; i < count; i++) {
            const name = await items.nth(i).locator(InventoryPageModel.product_name).textContent();
            if (name === productName) return true;
        }
        return false;
    }

    async fillCheckoutInfo(firstName: string, lastName: string, zipCode: string): Promise<void> {
        await this.page.fill(this.firstNameInput, firstName);
        await this.page.fill(this.lastNameInput, lastName);
        await this.page.fill(this.zipCodeInput, zipCode);
    }

    async clickContinueButton(): Promise<void> {
        await this.page.click(this.continueButton);
        // Wait for summary page to load
        await this.page.waitForLoadState('networkidle');
    }

    async clickFinishButton(): Promise<void> {
        await this.page.click(this.finishButton);
        // Wait for success message to appear
        await this.page.waitForLoadState('networkidle');
    }

    async getCheckoutSuccessMessage(): Promise<string> {
        const element = await this.page.waitForSelector(this.successMessage);
        return (await element.textContent()) || '';
    }
}
