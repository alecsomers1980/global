import { test, expect } from '@playwright/test'

test('home page renders the positioning line', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('properly represented')
})

test('playwright profile lists their plays', async ({ page }) => {
  await page.goto('/playwrights/paul-slabolepszy')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Paul Slabolepszy')
  await expect(page.getByRole('heading', { name: 'Saturday Night at the Palace' })).toBeVisible()
})

test('contact form adapts its copy to the intent', async ({ page }) => {
  await page.goto('/contact?play=saturday-night-at-the-palace&intent=perusal')
  await expect(page.getByText('we will send a perusal script')).toBeVisible()
})

test('contact form rejects an instant submission silently', async ({ page }) => {
  await page.goto('/contact')
  await page.getByLabel('Your name').fill('Bot')
  await page.getByLabel('Email').fill('bot@example.com')
  await page.getByLabel('Message').fill('spam')
  await page.getByRole('button', { name: 'Send' }).click()
  await expect(page.getByText('Thank you. We will be in touch.')).toBeVisible()
})
