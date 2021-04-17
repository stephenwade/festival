const {
  ChromiumEnv,
  FirefoxEnv,
  test,
  setConfig,
} = require('@playwright/test');

setConfig({
  testDir: __dirname,
  testMatch: /spec.cjs/iu,
  timeout: 15 * 1000,
});

// Run tests in three browsers.
test.runWith(new ChromiumEnv(), { tag: 'chromium' });
test.runWith(new FirefoxEnv(), { tag: 'firefox' });
