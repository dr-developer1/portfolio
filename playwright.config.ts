import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  projects: [
    {
      name: 'desktop-chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 7'],
        browserName: 'chromium',
      },
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 14'],
        browserName: 'webkit',
      },
    },
  ],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm build && pnpm preview --host 127.0.0.1 --port 4173',
    port: 4173,
    // Includes the production build, which can exceed one minute on CI runners.
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
  },
});
