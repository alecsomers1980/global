import { test, expect } from '@playwright/test'

// This spec exercises the gate itself, so it opts out of the suite-wide preview cookie.
test.use({ storageState: { cookies: [], origins: [] } })

test('the public site is gated behind the coming-soon page', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Theatre from the south')
})

test('a deep link into the catalogue also shows the holding page', async ({ page }) => {
  await page.goto('/plays')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Theatre from the south')
  await expect(page.getByRole('heading', { name: 'Saturday Night at the Palace' })).toHaveCount(0)
})

test('the holding page carries the contact details', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: '+27 82 773 5397' })).toBeVisible()
  await expect(page.getByRole('link', { name: /WhatsApp Jaco/ })).toHaveAttribute(
    'href',
    'https://wa.me/27827735397',
  )
})

test('/preview unlocks the real site', async ({ page }) => {
  await page.goto('/preview')
  await expect(page).toHaveURL('http://localhost:3000/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('properly represented')
})

test('admin stays reachable while the site is gated', async ({ page }) => {
  await page.goto('/admin/login')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})
