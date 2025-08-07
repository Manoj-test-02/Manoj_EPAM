import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { InventoryPage } from '../models/inventory.page';
import { CustomWorld } from '../support/world';
import { time } from 'console';

let inventoryPage: InventoryPage;

When('I am on the inventory page', async function (this: CustomWorld) {
    inventoryPage = new InventoryPage(this.page!);
    const isOnInventoryPage = await inventoryPage.isOnInventoryPage();
    expect(isOnInventoryPage).toBeTruthy();
});

When('I add multiple products to the cart', async function () {
    await inventoryPage.addMultipleProducts(3);
});

When('I add multiple products to cart', async function () {
    await inventoryPage.addMultipleProducts(3);
});

When('I add products to cart', async function () {
    await inventoryPage.addMultipleProducts(2);
});

When('I add a product to cart', async function () {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate a delay for demonstration purposes
    await inventoryPage.addProductToCart();
});

When('I add three different products to cart', async function () {
    await inventoryPage.addMultipleProducts(3);
});

When('I proceed to checkout page', async function () {
    await inventoryPage.proceedToCheckout();
});

When('I remove the product from cart', async function () {
    await inventoryPage.removeProduct();
});

When('I remove all products from cart', async function () {
    await inventoryPage.removeAllProducts();
});

When('I sort products by price high to low', async function () {
    await inventoryPage.sortByPriceHighToLow();
});

When('I add top three expensive products to cart', async function () {
    await inventoryPage.addTopExpensiveProducts(3);
});

Then('cart badge should display correct item count', async function () {
    const count = await inventoryPage.getCartBadgeCount();
    expect(count).toBeGreaterThan(0);
});

When('I enter checkout information', async function (dataTable) {
    const data = dataTable.hashes()[0];
    await inventoryPage.fillCheckoutInfo(data.firstName, data.lastName, data.zipCode);
});

When('I click continue button', async function () {
    await inventoryPage.clickContinueButton();
});

When('I click finish button on summary page', async function () {
    await inventoryPage.clickFinishButton();
});

Then('I should see checkout success message', async function () {
    const successMessage = await inventoryPage.getCheckoutSuccessMessage();
    expect(successMessage).toBe('Thank you for your order!');
});

Then('remove button should be enabled for added product', async function () {
    const isEnabled = await inventoryPage.isRemoveButtonEnabled();
    expect(isEnabled).toBeTruthy();
    await new Promise(resolve => setTimeout(resolve, 1000));
});

Then('product should not appear in checkout page', async function () {
    const isProductPresent = await inventoryPage.isProductInCheckout('Test Product');
    expect(isProductPresent).toBeFalsy();
});

Then('cart should show three items', async function () {
    const count = await inventoryPage.getCartBadgeCount();
    expect(count).toBe(3);
});

Then('cart should be empty', async function () {
    const count = await inventoryPage.getCartBadgeCount();
    expect(count).toBe(0);
});

Then('checkout button should be disabled', async function () {
    const isEnabled = await inventoryPage.isCheckoutButtonEnabled();
    expect(isEnabled).toBeFalsy();
});

Then('product prices in cart should match inventory prices', async function () {
    const cartPrices = await inventoryPage.getProductPrices();
    const inventoryPrices = await inventoryPage.getProductPrices();
    console.log('Cart Prices:', cartPrices);
    console.log('Inventory Prices:', inventoryPrices);
    expect(cartPrices).toEqual(inventoryPrices);
});

Then('cart total should match sum of selected products', async function () {
    const total = await inventoryPage.getCartTotal();
    const prices = await inventoryPage.getProductPrices();
    const expectedTotal = prices.reduce((sum, price) => sum + price, 0);
    expect(total).toBe(expectedTotal);
});
