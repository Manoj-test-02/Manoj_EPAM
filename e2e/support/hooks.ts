import { Before, After, AfterAll, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { CustomWorld } from './world';
import { EmailReporter } from './email-reporter';
import * as fs from 'fs';
import * as path from 'path';

// Set timeout for all steps and hooks
setDefaultTimeout(CustomWorld.DEFAULT_TIMEOUT);

// Initialize test statistics
let totalScenarios = 0;
let passedScenarios = 0;
let failedScenarios = 0;
let skippedScenarios = 0;
const failures: any[] = [];
const startTime = Date.now();

Before(async function(this: CustomWorld) {
  totalScenarios++;
  await this.init();
});

After(async function(this: CustomWorld, scenario: any) {
  // Record scenario result
  switch(scenario.result.status) {
    case Status.PASSED:
      passedScenarios++;
      break;
    case Status.FAILED:
      failedScenarios++;
      failures.push({
        scenario: scenario.pickle.name,
        error: scenario.result.error?.message || 'Unknown error'
      });
      break;
    case Status.SKIPPED:
      skippedScenarios++;
      break;
  }

  await this.cleanup();
});

AfterAll(async function() {
  const duration = (Date.now() - startTime) / 1000; // Convert to seconds
  
  const testResults = {
    summary: {
      total: totalScenarios,
      passed: passedScenarios,
      failed: failedScenarios,
      skipped: skippedScenarios,
      duration: duration.toFixed(2)
    },
    failures: failures
  };

  // Send email report
  try {
    console.log('Sending email report...');
    const emailReporter = new EmailReporter();
    await emailReporter.sendTestReport(testResults);
    console.log('Email report sent successfully');
  } catch (error) {
    console.error('Failed to send email report:', error);
  }
});
