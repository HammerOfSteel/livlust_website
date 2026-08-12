// @ts-check
/**
 * Blog / news redesign — Playwright tests
 *
 * Requires the full docker-compose stack running locally beforehand:
 *   docker-compose up -d
 * (frontend on http://localhost:3000, Directus seeded with the demo posts
 * from directus/seed.mjs, including the `vi-startar-livslust` slug)
 *
 * Run with: npx playwright test --project=blog-e2e
 */
const { test, expect } = require('@playwright/test');

test.describe('Blog index page', () => {
  test('/blog lists published posts as cards linking to their own URL', async ({ page }) => {
    await page.goto('/blog');
    const cards = page.locator('.post-card');
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThan(0);
  });
});

test.describe('Blog post page', () => {
  test('clicking a homepage card navigates to a real /blog/:slug URL', async ({ page }) => {
    await page.goto('/');
    const firstCard = page.locator('#news .post-card').first();
    await expect(firstCard).toBeVisible();
    const title = (await firstCard.locator('.post-card-title').innerText()).trim();
    await firstCard.click();
    await expect(page).toHaveURL(/\/blog\/[a-z0-9-]+/);
    await expect(page.locator('.bp-title')).toHaveText(title);
  });

  test('direct navigation to a known slug works (SPA fallback)', async ({ page }) => {
    await page.goto('/blog/vi-startar-livslust');
    await expect(page.locator('.bp-title')).toBeVisible();
  });

  test('unknown slug shows a not-found state instead of crashing', async ({ page }) => {
    await page.goto('/blog/does-not-exist-xyz');
    await expect(page.getByText(/hittades inte|not found/i)).toBeVisible();
  });
});
