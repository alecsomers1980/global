import { test, expect } from '@playwright/test'

test('catalogue lists the seeded play', async ({ page }) => {
  await page.goto('/plays')
  await expect(page.getByRole('heading', { name: 'Saturday Night at the Palace' })).toBeVisible()
})

test('search narrows the list', async ({ page }) => {
  await page.goto('/plays?q=zzzznomatch')
  await expect(page.getByText('No plays match those filters yet.')).toBeVisible()
})

test('filtering by playwright keeps the play', async ({ page }) => {
  await page.goto('/plays?playwright=paul-slabolepszy')
  await expect(page.getByRole('heading', { name: 'Saturday Night at the Palace' })).toBeVisible()
})
