import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { LoginPage } from '../models/login.page';
import * as testData from '../fixtures/testdata.json';
import { CustomWorld } from '../support/world';

let loginPage: LoginPage;

Given('I am on the login page', async function (this: CustomWorld) {
  loginPage = new LoginPage(this.page!);
  await loginPage.navigateToLoginPage();
});

When('I login with valid credentials', async function (this: CustomWorld) {
  const { username, password } = testData.login_test;
  await loginPage.login(username, password);
});

Then('I should be logged in successfully', async function (this: CustomWorld) {
  await expect(this.page!).toHaveURL(/.*inventory.html/);
});
