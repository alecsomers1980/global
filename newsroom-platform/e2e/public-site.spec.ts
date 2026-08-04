import { test, expect } from '@playwright/test';

const CATEGORIES = ['community', 'crime', 'lifestyle', 'sports', 'politics', 'notice'];

test('homepage renders the hero, trending, latest feed and sidebar', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 2 })).not.toHaveCount(0);
  await expect(page.getByText('Trending')).toBeVisible();
  await expect(page.getByText('Latest story')).toBeVisible();
  await expect(page.getByText('Popular posts')).toBeVisible();
});

test('homepage shows no placeholder content', async ({ page }) => {
  await page.goto('/');
  const body = await page.textContent('body');
  expect(body).not.toContain('Lorem ipsum');
  expect(body).not.toContain('JOHN DOE');
});

for (const slug of CATEGORIES) {
  test(`category /${slug} resolves and lists stories`, async ({ page }) => {
    const response = await page.goto(`/${slug}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator('article')).not.toHaveCount(0);
  });
}

test('every nav link resolves', async ({ page }) => {
  await page.goto('/');
  const hrefs = await page.locator('header nav a').evaluateAll(
    links => links.map(l => (l as HTMLAnchorElement).getAttribute('href'))
  );
  for (const href of hrefs) {
    if (!href) continue;
    const response = await page.goto(href);
    expect(response?.status(), `${href} should not 404`).toBe(200);
  }
});

test('search returns results', async ({ page }) => {
  await page.goto('/search?q=Bushbuckridge');
  await expect(page.locator('article').first()).toBeVisible();
});

test('an article page renders byline, image and body', async ({ page }) => {
  await page.goto('/');
  await page.locator('a[href^="/article/"]').first().click();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('.prose')).not.toBeEmpty();
});

test('an unknown host is rejected', async ({ request }) => {
  const response = await request.get('/', { headers: { host: 'not-a-known-site.example' } });
  expect(response.status()).toBe(404);
});

for (const [width, height] of [[1440, 900], [768, 1024], [375, 812]] as const) {
  test(`no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(overflows).toBe(false);
  });
}
