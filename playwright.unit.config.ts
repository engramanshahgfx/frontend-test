import { defineConfig } from '@playwright/test';

/**
 * Fast static guards — no browser, no dev server, no backend.
 *
 * These read the source tree directly, so they run in seconds and are safe in CI
 * before anything is started.
 *
 *   npx playwright test -c playwright.unit.config.ts
 */
export default defineConfig({
  testDir: './tests/unit',
  fullyParallel: true,
  reporter: [['list']],
  timeout: 30_000,
  projects: [{ name: 'static' }],
});
