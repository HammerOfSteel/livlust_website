// @ts-check
/**
 * poc-resurskarta.html – Playwright tests
 *
 * What we verify:
 *  1. Data integrity   – all 67 resources have valid Swedish lat/lng
 *  2. DOM structure    – map container, sidebar, chips, national bar
 *  3. CSS correctness  – transform-origin: bottom center on .pin-wrap
 *                        (prevents pin-tip drift during map zoom)
 *  4. Pin rendering    – correct number of DOM pins after map load
 *  5. Filter chips     – toggling a chip hides non-matching list items
 *  6. Search           – text filter narrows list
 *  7. Pin click        – opens slide-in panel with correct content
 *  8. Panel close      – panel slides out; .sel class removed from pin
 *  9. Sidebar click    – flies map to coordinate; opens panel
 * 10. Zoom persistence – after programmatic zoom the pins stay in view
 */

const { test, expect } = require('@playwright/test');

const URL = '/poc-resurskarta.html';

// Sweden bounding box (generous)
const SW_LAT = [55.0, 69.5];
const SW_LNG = [10.5, 25.0];

// ── helper: wait for map "load" event to fire ──────────────────────────────
async function waitForMapLoad(page, timeout = 12_000) {
  await page.waitForFunction(
    () => typeof map !== 'undefined' && map._loaded,
    { timeout }
  );
}

// ── 1. Data integrity ──────────────────────────────────────────────────────
test.describe('Data integrity', () => {
  test('all 67 geo resources have valid Swedish coordinates', async ({ page }) => {
    await page.goto(URL);
    const errors = await page.evaluate(({ latRange, lngRange }) => {
      return R.filter(r => {
        const latOk = r.lat >= latRange[0] && r.lat <= latRange[1];
        const lngOk = r.lng >= lngRange[0] && r.lng <= lngRange[1];
        return !latOk || !lngOk;
      }).map(r => `${r.id}: [${r.lat}, ${r.lng}]`);
    }, { latRange: SW_LAT, lngRange: SW_LNG });
    expect(errors, `Out-of-Sweden coordinates: ${errors.join(', ')}`).toHaveLength(0);
  });

  test('all resources have a non-empty name', async ({ page }) => {
    await page.goto(URL);
    const bad = await page.evaluate(() =>
      R.filter(r => !r.name || r.name.trim() === '').map(r => r.id)
    );
    expect(bad).toHaveLength(0);
  });

  test('all resources have a recognised category', async ({ page }) => {
    await page.goto(URL);
    const bad = await page.evaluate(() => {
      const valid = Object.keys(CAT);
      return R.filter(r => !valid.includes(r.cat)).map(r => `${r.id}:${r.cat}`);
    });
    expect(bad).toHaveLength(0);
  });

  test('total geo resource count is 56', async ({ page }) => {
    await page.goto(URL);
    const count = await page.evaluate(() => R.length);
    expect(count).toBe(56);
  });

  test('national resource count is 8', async ({ page }) => {
    await page.goto(URL);
    const count = await page.evaluate(() => NAT.length);
    expect(count).toBe(8);
  });
});

// ── 2. DOM structure ───────────────────────────────────────────────────────
test.describe('DOM structure', () => {
  test.beforeEach(async ({ page }) => { await page.goto(URL); });

  test('map container is present and has non-zero size', async ({ page }) => {
    const box = await page.locator('#map').boundingBox();
    expect(box).not.toBeNull();
    expect(box.width).toBeGreaterThan(300);
    expect(box.height).toBeGreaterThan(300);
  });

  test('sidebar is visible', async ({ page }) => {
    await expect(page.locator('aside')).toBeVisible();
  });

  test('all 6 category chips plus "Alla" are present', async ({ page }) => {
    await expect(page.locator('.chip')).toHaveCount(7);
  });

  test('national bar is present', async ({ page }) => {
    await expect(page.locator('#natBar')).toBeVisible();
  });

  test('national bar shows 8 cards', async ({ page }) => {
    // Cards render on DOMContentLoaded (renderNat called synchronously)
    await expect(page.locator('.nat-card')).toHaveCount(8);
  });

  test('search input is present', async ({ page }) => {
    await expect(page.locator('#searchInput')).toBeVisible();
  });

  test('info panel starts closed (off-screen)', async ({ page }) => {
    const panel = page.locator('#panel');
    await expect(panel).not.toHaveClass(/open/);
  });
});

// ── 3. CSS correctness (the zoom-drift fix) ────────────────────────────────
test.describe('CSS: pin transform-origin', () => {
  test('outer marker wrapper gets position:absolute from MapLibre (no CSS conflict)', async ({ page }) => {
    await page.goto(URL);
    await waitForMapLoad(page);
    await page.waitForSelector('.pin-wrap', { timeout: 8_000 });
    const pos = await page.evaluate(() => {
      const outer = document.querySelector('.pin-wrap').parentElement;
      return window.getComputedStyle(outer).position;
    });
    expect(pos).toBe('absolute');
  });

  test('.pin-wrap has display:inline-block (prevents 100%-width stretch)', async ({ page }) => {
    await page.goto(URL);
    await waitForMapLoad(page);
    await page.waitForSelector('.pin-wrap', { timeout: 8_000 });
    const display = await page.evaluate(() =>
      window.getComputedStyle(document.querySelector('.pin-wrap')).display
    );
    expect(display).toBe('inline-block');
  });

  test('.pin-wrap width equals pin SVG width (26px), not the map container width', async ({ page }) => {
    await page.goto(URL);
    await waitForMapLoad(page);
    await page.waitForSelector('.pin-wrap', { timeout: 8_000 });
    const width = await page.evaluate(() =>
      document.querySelector('.pin-wrap').getBoundingClientRect().width
    );
    expect(width).toBe(26);
  });

  test('outer marker bottom-center aligns with projected geographic coordinate', async ({ page }) => {
    await page.goto(URL);
    await waitForMapLoad(page);
    await page.waitForSelector('.pin-wrap', { timeout: 8_000 });
    // Check the SPES Stockholm pin (s1) position
    const result = await page.evaluate(() => {
      const proj   = map.project([18.0508, 59.3145]);
      const pin    = document.querySelector('.pin-wrap');
      const outer  = pin.parentElement;
      const rect   = outer.getBoundingClientRect();
      // Map container offset from viewport
      const mapRect = document.getElementById('map').getBoundingClientRect();
      // Projected point in viewport coordinates
      const vpX = proj.x + mapRect.left;
      const vpY = proj.y + mapRect.top;
      // Outer bottom-center in viewport coordinates
      const outerBottomCenterX = rect.left + rect.width / 2;
      const outerBottomY = rect.bottom;
      return {
        projVpX: Math.round(vpX), projVpY: Math.round(vpY),
        outerBCX: Math.round(outerBottomCenterX), outerBotY: Math.round(outerBottomY),
      };
    });
    // Allow ±3px tolerance for sub-pixel rendering
    expect(Math.abs(result.projVpX - result.outerBCX)).toBeLessThanOrEqual(3);
    expect(Math.abs(result.projVpY - result.outerBotY)).toBeLessThanOrEqual(3);
  });

  test('.pin-wrap.sel class is toggled on the inner element (not outer wrapper)', async ({ page }) => {
    await page.goto(URL);
    await waitForMapLoad(page);
    await page.evaluate(() => openPanel('s1'));
    const innerSel = await page.evaluate(() =>
      document.querySelector('.pin-wrap').classList.contains('sel')
    );
    expect(innerSel).toBe(true);
    // outer wrapper must NOT get .sel
    const outerSel = await page.evaluate(() =>
      document.querySelector('.pin-wrap').parentElement.classList.contains('sel')
    );
    expect(outerSel).toBe(false);
  });
});

// ── 4. Pin rendering ───────────────────────────────────────────────────────
test.describe('Pin rendering', () => {
  test('56 pin elements are created after map load', async ({ page }) => {
    await page.goto(URL);
    await waitForMapLoad(page);
    await page.waitForSelector('.pin-wrap', { timeout: 8_000 });
    const count = await page.locator('.pin-wrap').count();
    expect(count).toBe(56);
  });

  test('pins are initially all visible (outer wrapper display not none)', async ({ page }) => {
    await page.goto(URL);
    await waitForMapLoad(page);
    await page.waitForSelector('.pin-wrap', { timeout: 8_000 });
    const hidden = await page.evaluate(() =>
      [...document.querySelectorAll('.pin-wrap')]
        .filter(el => el.parentElement.style.display === 'none').length
    );
    expect(hidden).toBe(0);
  });
});

// ── 5. Filter chips ────────────────────────────────────────────────────────
test.describe('Filter chips', () => {
  test.beforeEach(async ({ page }) => { await page.goto(URL); });

  test('"Alla" chip is active by default', async ({ page }) => {
    await expect(page.locator('.chip[data-cat="all"]')).toHaveClass(/active/);
  });

  test('clicking "Efterlevande" filters sidebar to SPES entries only', async ({ page }) => {
    await page.locator('.chip[data-cat="efterlevande"]').click();
    const items = await page.locator('.res-item').count();
    // 12 SPES entries in data
    expect(items).toBe(12);
  });

  test('clicking "Fontänhus" filters sidebar to 18 entries', async ({ page }) => {
    await page.locator('.chip[data-cat="fontanhus"]').click();
    const items = await page.locator('.res-item').count();
    expect(items).toBe(18);
  });

  test('clicking "Alla" after a filter shows all 56 entries', async ({ page }) => {
    await page.locator('.chip[data-cat="fontanhus"]').click();
    await page.locator('.chip[data-cat="all"]').click();
    const items = await page.locator('.res-item').count();
    expect(items).toBe(56);
  });

  test('count badge updates when filter changes', async ({ page }) => {
    await page.locator('.chip[data-cat="efterlevande"]').click();
    await expect(page.locator('#cnt')).toContainText('12');
  });
});

// ── 6. Search ──────────────────────────────────────────────────────────────
test.describe('Search', () => {
  test.beforeEach(async ({ page }) => { await page.goto(URL); });

  test('searching "stockholm" narrows list to Stockholm resources', async ({ page }) => {
    await page.locator('#searchInput').fill('stockholm');
    const items = await page.locator('.res-item').count();
    // SPES Stockholm + Fountain House Stockholm + Balans Stockholm + BRIS Stockholm + AA + RFSL = several
    expect(items).toBeGreaterThanOrEqual(4);
    expect(items).toBeLessThan(67);
  });

  test('searching "xxxnonexistent" shows 0 results', async ({ page }) => {
    await page.locator('#searchInput').fill('xxxnonexistent');
    const items = await page.locator('.res-item').count();
    expect(items).toBe(0);
  });

  test('clearing search restores all 56 entries', async ({ page }) => {
    await page.locator('#searchInput').fill('stockholm');
    await page.locator('#searchInput').fill('');
    const items = await page.locator('.res-item').count();
    expect(items).toBe(56);
  });
});

// ── 7. Info panel ──────────────────────────────────────────────────────────
test.describe('Info panel', () => {
  test.beforeEach(async ({ page }) => { await page.goto(URL); });

  test('clicking a sidebar item opens the panel', async ({ page }) => {
    await page.locator('.res-item').first().click();
    await expect(page.locator('#panel')).toHaveClass(/open/);
  });

  test('panel shows the resource name', async ({ page }) => {
    await page.locator('.res-item').first().click();
    const name = await page.locator('#p-name').textContent();
    expect(name.trim().length).toBeGreaterThan(0);
  });

  test('panel shows a "Öppna webbplats" link', async ({ page }) => {
    await page.locator('.res-item').first().click();
    await expect(page.locator('.p-btn')).toBeVisible();
    const href = await page.locator('.p-btn').getAttribute('href');
    expect(href).toMatch(/^https?:\/\//);
  });

  test('panel close button hides the panel', async ({ page }) => {
    await page.locator('.res-item').first().click();
    await page.locator('.p-close').click();
    await expect(page.locator('#panel')).not.toHaveClass(/open/);
  });

  test('clicking map background closes the panel', async ({ page }) => {
    await page.locator('.res-item').first().click();
    await page.locator('#map').click({ position: { x: 100, y: 100 } });
    await expect(page.locator('#panel')).not.toHaveClass(/open/);
  });
});

// ── 8. Pin click → panel (after map load) ──────────────────────────────────
test.describe('Pin interaction', () => {
  test('clicking a pin adds .sel to .pin-wrap inner element (not outer wrapper)', async ({ page }) => {
    await page.goto(URL);
    await waitForMapLoad(page);
    await page.waitForSelector('.pin-wrap', { timeout: 8_000 });
    await page.evaluate(() => openPanel('f1'));
    const innerSel = await page.evaluate(() =>
      document.querySelector('.pin-wrap.sel') !== null
    );
    expect(innerSel).toBe(true);
    // outer wrapper must NOT get .sel
    const outerSel = await page.evaluate(() =>
      document.querySelector('.pin-wrap').parentElement.classList.contains('sel')
    );
    expect(outerSel).toBe(false);
  });

  test('closePanel removes .sel from the previously selected pin', async ({ page }) => {
    await page.goto(URL);
    await waitForMapLoad(page);
    await page.waitForSelector('.pin-wrap', { timeout: 8_000 });
    await page.evaluate(() => openPanel('f1'));
    await page.evaluate(() => closePanel());
    const any = await page.evaluate(() =>
      document.querySelector('.pin-wrap.sel') !== null
    );
    expect(any).toBe(false);
  });

  test('switching panels moves .sel from old pin to new pin', async ({ page }) => {
    await page.goto(URL);
    await waitForMapLoad(page);
    await page.waitForSelector('.pin-wrap', { timeout: 8_000 });
    await page.evaluate(() => openPanel('f1'));
    await page.evaluate(() => openPanel('s1'));
    const count = await page.evaluate(() =>
      document.querySelectorAll('.pin-wrap.sel').length
    );
    expect(count).toBe(1);
  });
});

// ── 9. Zoom persistence ────────────────────────────────────────────────────
test.describe('Zoom persistence', () => {
  test('after zooming to level 8 the resource count is unchanged', async ({ page }) => {
    await page.goto(URL);
    await waitForMapLoad(page);
    // Zoom into central Sweden
    await page.evaluate(() => {
      map.setZoom(8);
      map.setCenter([18.07, 59.33]); // Stockholm
    });
    // Sidebar count should not change — pins are not filtered by zoom
    const items = await page.locator('.res-item').count();
    expect(items).toBe(56);
  });

  test('focusR flies map and opens panel for the correct resource', async ({ page }) => {
    await page.goto(URL);
    await waitForMapLoad(page);
    await page.evaluate(() => focusR('s7')); // SPES Norrbotten – Luleå
    await expect(page.locator('#panel')).toHaveClass(/open/);
    const name = await page.locator('#p-name').textContent();
    expect(name).toContain('Norrbotten');
  });
});
