import { Before, After, setDefaultTimeout } from '@cucumber/cucumber';
import { CustomWorld } from './world';

// Set timeout for all steps and hooks
setDefaultTimeout(CustomWorld.DEFAULT_TIMEOUT);

Before(async function(this: CustomWorld) {
  await this.init();
});

After(async function(this: CustomWorld) {
  await this.cleanup();
});
