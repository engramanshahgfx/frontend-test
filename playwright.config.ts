import { defineConfig, devices } from '@playwright/test';

/**
 * Full-stack integration tests for the Tilal Rimal front-end.
 *
 * This config runs the browser tests and starts the Next.js app automatically.
 * Static/source guards live in `tests/unit` and run with `playwright.unit.config.ts`,
 * which does not need a server.
 *
 *   npx playwright test                     # e2e (starts the dev server)
 *   npx playwright test -c playwright.unit.config.ts   # fast static guards
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list']],

  timeout: 90_000,
  expect: { timeout: 20_000 },

  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'retain-on-failure',
    video: 'off',
    screenshot: 'only-on-failure',
    navigationTimeout: 90_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000/en',
    reuseExistingServer: true,
    timeout: 180_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
