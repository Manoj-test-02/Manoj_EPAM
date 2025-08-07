import { Page, expect } from '@playwright/test';

export class AssertionExecutor {
    private page!: Page;

    async executeAssertions(assertions: any[]) {
        for (const assertion of assertions) {
            await this.executeAssertion(assertion);
        }
    }

    private async executeAssertion(assertion: any) {
        switch (assertion.type) {
            case 'url':
                expect(this.page.url()).toBe(assertion.expected);
                break;
            case 'element':
                if (assertion.shouldExist) {
                    await expect(this.page.locator(assertion.selector)).toBeVisible();
                } else {
                    await expect(this.page.locator(assertion.selector)).toBeHidden();
                }
                break;
            case 'text':
                const element = this.page.locator(assertion.selector);
                await expect(element).toHaveText(assertion.expected);
                break;
            case 'count':
                const elements = this.page.locator(assertion.selector);
                await expect(elements).toHaveCount(assertion.expected);
                break;
            default:
                throw new Error(`Unknown assertion type: ${assertion.type}`);
        }
    }
}
