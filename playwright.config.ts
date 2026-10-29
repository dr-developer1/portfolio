import { defineConfig, devices } from '@playwright/test';

const repository = process.env.GITHUB_REPOSITORY?.split('/')[1];
const siteBase = process.env.GITHUB_ACTIONS && repository ? `/${repository}/` : '/';
const previewURL = `http://127.0.0.1:4173${siteBase}`;

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
    baseURL: previewURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm build && pnpm preview --host 127.0.0.1 --port 4173',
    url: previewURL,
    // Includes the production build, which can exceed one minute on CI runners.
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
  },
});
