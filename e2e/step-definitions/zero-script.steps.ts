import { Given, When, Then } from '@cucumber/cucumber';
import { Page, expect } from '@playwright/test';
import { AIElementLocator } from '../support/ai-element-locator';
import { ActionInterpreter } from '../support/action-interpreter';
import { AssertionInterpreter } from '../support/assertion-interpreter';
import { CustomWorld } from '../support/world';

let elementLocator: AIElementLocator;
let actionInterpreter: ActionInterpreter;
let assertionInterpreter: AssertionInterpreter;

Given('I navigate to login page', async function(this: CustomWorld) {
    if (!this.page) {
        throw new Error('Page is not initialized');
    }
    await this.page.goto('https://www.saucedemo.com/');
    
    // Initialize interpreters with the current page
    elementLocator = new AIElementLocator(this.page);
    actionInterpreter = new ActionInterpreter(this.page, elementLocator);
    assertionInterpreter = new AssertionInterpreter(this.page, elementLocator);
});

When('I perform {string}', async function(this: CustomWorld, action) {
    if (!actionInterpreter) {
        elementLocator = new AIElementLocator(this.page!);
        actionInterpreter = new ActionInterpreter(this.page!, elementLocator);
    }
    await actionInterpreter.interpretAndExecute(action);
});

Then('I verify {string}', async function(this: CustomWorld, assertion) {
    if (!assertionInterpreter) {
        elementLocator = new AIElementLocator(this.page!);
        assertionInterpreter = new AssertionInterpreter(this.page!, elementLocator);
    }
    await assertionInterpreter.interpretAndVerify(assertion);
});
