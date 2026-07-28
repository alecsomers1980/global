import { test, expect } from '@playwright/test'

const URL = '/plays/saturday-night-at-the-palace'

test('renders the title, writer and both CTAs', async ({ page }) => {
  await page.goto(URL)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Saturday Night at the Palace')
  await expect(page.getByRole('link', { name: 'Paul Slabolepszy' }).first()).toBeVisible()
  await expect(page.getByRole('link', { name: 'Request perusal script' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Apply for licence' })).toBeVisible()
})

test('shows the cast breakdown', async ({ page }) => {
  await page.goto(URL)
  await expect(page.getByRole('heading', { name: 'Characters' })).toBeVisible()
  await expect(page.getByText('Vince')).toBeVisible()
})

test('shows availability by territory', async ({ page }) => {
  await page.goto(URL)
  await expect(page.getByRole('heading', { name: 'Rights and availability' })).toBeVisible()
  await expect(page.getByText('Not currently available').first()).toBeVisible()
})

test('omits blocks that have no data', async ({ page }) => {
  await page.goto(URL)
  // The seed play has no press, media or production history yet.
  await expect(page.getByRole('heading', { name: 'Press' })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Media' })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Production history' })).toHaveCount(0)
})

test('returns 404 for an unknown play', async ({ page }) => {
  const res = await page.goto('/plays/not-a-real-play')
  expect(res?.status()).toBe(404)
})
