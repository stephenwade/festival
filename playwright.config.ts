import type { PlaywrightTestConfig } from '@playwright/test';
import { defineConfig, devices } from '@playwright/test';

import { DOCKER_MODE } from './playwright/helpers/docker';
import { authFile } from './playwright/tests/shared-data';

try {
  process.loadEnvFile('.env');
} catch {
  // Ignore errors if `.env` doesn't exist
}

const baseURL = `http://127.0.0.1:${process.env.PORT!}`;
const webServer = DOCKER_MODE
  ? undefined
  : ({
      command: [
        'npx prisma migrate dev',
        'npm run build',
        'npm run start',
      ].join(' && '),
      url: `${baseURL}/admin`,
      reuseExistingServer: !process.env.CI,
      env: {
        FIRST_ADMIN_EMAIL_ADDRESS: 'ci@urlfest.com',
      },
    } satisfies PlaywrightTestConfig['webServer']);

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: 'playwright/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'blob' : 'html',

  use: {
    baseURL,
    trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
  },

  webServer,

  projects: [
    {
      name: 'global setup',
      testMatch: 'global.setup.ts',
      teardown: 'global teardown',
    },
    {
      name: 'global teardown',
      testMatch: 'global.teardown.ts',
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: authFile,
      },
      dependencies: ['global setup'],
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: authFile,
      },
      dependencies: ['global setup'],
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: authFile,
      },
      dependencies: ['global setup'],
    },
  ],
});
