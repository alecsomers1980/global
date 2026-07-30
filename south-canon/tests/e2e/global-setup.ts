import { chromium, type FullConfig } from '@playwright/test'

export const PREVIEW_STATE = 'tests/e2e/.preview-state.json'

/**
 * The public site is gated behind the coming-soon page (see middleware.ts); /preview sets the
 * cookie that unlocks it. Every pre-existing spec targets the real site, so the suite runs with
 * that cookie already in place. The gate itself is covered by coming-soon.spec.ts, which opts
 * back out of this state.
 */
export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL
  if (!baseURL) throw new Error('globalSetup expected a baseURL on the first project')

  const browser = await chromium.launch()
  try {
    const context = await browser.newContext({ baseURL })
    const page = await context.newPage()
    await page.goto('/preview')
    await context.storageState({ path: PREVIEW_STATE })
  } finally {
    await browser.close()
  }
}
