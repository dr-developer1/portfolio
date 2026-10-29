import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    // Keep Node 26’s native storage out of the browser-emulated test environment.
    pool: 'forks',
    poolOptions: { forks: { execArgv: ['--no-experimental-webstorage'] } },
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
