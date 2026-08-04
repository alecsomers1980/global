import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  use: { baseURL: 'http://localhost:3000' },
  webServer: {
    // Production build, not `next dev` — dev mode JIT-compiles each route on
    // first hit, and concurrent Playwright workers hitting a cold dev server
    // stack up past the test timeout on nothing but compile time.
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
