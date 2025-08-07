import { Page } from '@playwright/test';

export class ActionExecutor {
    private page!: Page;

    async executeActions(actions: any[]) {
        for (const action of actions) {
            await this.executeAction(action);
        }
    }

    private async executeAction(action: any) {
        switch (action.type) {
            case 'navigate':
                await this.page.goto(action.url);
                break;
            case 'click':
                await this.page.click(action.selector);
                break;
            case 'input':
                await this.page.fill(action.selector, action.value);
                break;
            case 'select':
                await this.page.selectOption(action.selector, action.value);
                break;
            case 'hover':
                await this.page.hover(action.selector);
                break;
            case 'wait':
                await this.page.waitForSelector(action.selector);
                break;
            default:
                throw new Error(`Unknown action type: ${action.type}`);
        }
    }
}
