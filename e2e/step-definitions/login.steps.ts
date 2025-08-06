import { Given, When, Then, Before } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { LoginPage } from '../models/login.page';
import * as loginData from '../fixtures/login.json';
import { CustomWorld } from '../support/world';
import { LoginJson, LoginScenario } from '../models/login.data';

let loginPage: LoginPage;

Before(async function (this: CustomWorld, scenario: any) {
  this.setScenarioName(scenario.pickle.name);
});

Given('I am on the login page', async function (this: CustomWorld) {
  loginPage = new LoginPage(this.page!);
  await loginPage.navigateToLoginPage();
});

async function performLogin(world: CustomWorld) {
  const scenarioName = world.getScenarioName();
  const scenarioData = (loginData as LoginJson)[scenarioName];
  
  if (!scenarioData) {
    throw new Error(`No test data found for scenario: ${scenarioName}`);
  }
  
  const { username, password } = scenarioData.login_credentials;
  await loginPage.login(username, password);
  return scenarioData;
}

When('I login with valid credentials', async function (this: CustomWorld) {
  await performLogin(this);
});

When('I login with invalid credentials', async function (this: CustomWorld) {
  await performLogin(this);
});

When('I login with locked user credentials', async function (this: CustomWorld) {
  await performLogin(this);
});

Then('I should be logged in successfully', async function (this: CustomWorld) {
  const scenarioData = (loginData as LoginJson)[this.getScenarioName()];
  if ('url' in scenarioData.expected) {
    await expect(this.page!).toHaveURL(new RegExp(scenarioData.expected.url));
  }
});

Then('I should see error message', async function (this: CustomWorld) {
  const scenarioData = (loginData as LoginJson)[this.getScenarioName()];
  if ('error_message' in scenarioData.expected) {
    await loginPage.verifyErrorMessage(scenarioData.expected.error_message);
  }
});

Then('I should see account locked message', async function (this: CustomWorld) {
  const scenarioData = (loginData as LoginJson)[this.getScenarioName()];
  if ('error_message' in scenarioData.expected) {
    await loginPage.verifyErrorMessage(scenarioData.expected.error_message);
  }
});
