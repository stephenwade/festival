import path from 'node:path';

import { defineConfig, devices } from '@playwright/experimental-ct-react';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: 'playwright/ct-tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'blob' : 'html',

  use: {
    trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
    ctPort: 3100,
    ctTemplateDir: 'playwright/ct-tests',
    ctViteConfig: {
      resolve: {
        // Match "paths" in tsconfig.json
        alias: {
          '~': path.resolve(import.meta.dirname, 'app'),
        },
      },
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
