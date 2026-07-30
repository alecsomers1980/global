import { defineConfig } from '@playwright/test'
import { PREVIEW_STATE } from './tests/e2e/global-setup'

export default defineConfig({
  testDir: './tests/e2e',
  globalSetup: './tests/e2e/global-setup.ts',
  use: { baseURL: 'http://localhost:3000', storageState: PREVIEW_STATE },
  webServer: { command: 'npm run dev', url: 'http://localhost:3000', reuseExistingServer: true },
})
