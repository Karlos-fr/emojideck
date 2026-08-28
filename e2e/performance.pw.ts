import { expect, test } from '@playwright/test';

const viewports = [
  { width: 320, height: 640 },
  { width: 390, height: 844 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
];

test('keeps a stable, overflow-free picker across target viewports', async ({ page }) => {
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.locator('.app-shell')).toBeVisible();
    await expect(page.locator('[data-emoji-button]').first()).toBeVisible();

    const layout = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll<HTMLElement>('[data-emoji-button]'));
      const dimensions = buttons.slice(0, 20).map((button) => {
        const rect = button.getBoundingClientRect();
        return `${rect.width}x${rect.height}`;
      });
      return {
        overflowX: document.body.scrollWidth > document.body.clientWidth,
        overflowY: document.body.scrollHeight > document.body.clientHeight,
        dimensions: [...new Set(dimensions)],
      };
    });

    expect(layout.overflowX).toBe(false);
    expect(layout.overflowY).toBe(false);
    expect(layout.dimensions).toHaveLength(1);
  }
});

test('loads only the active locale and fetches another locale on selection', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('emojideck.language', 'fr'));
  const localeRequests: string[] = [];
  page.on('response', (response) => {
    if (/emojis\.[a-z]{2}\.json/.test(response.url())) {
      localeRequests.push(response.url());
    }
  });

  await page.goto('/');
  await expect(page.locator('.app-shell')).toBeVisible();
  expect(localeRequests.some((url) => url.includes('emojis.fr.json'))).toBe(true);
  expect(localeRequests.some((url) => url.includes('emojis.en.json'))).toBe(false);

  await page.locator('[data-language-select="desktop"]').selectOption('de');
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  expect(localeRequests.some((url) => url.includes('emojis.de.json'))).toBe(true);
});

test('renders large categories progressively and completes them for keyboard End', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.app-shell')).toBeVisible();
  const initialCount = await page.evaluate(() => {
    document
      .querySelector<HTMLButtonElement>('.desktop-sidebar [data-category-id="people"]')
      ?.click();
    return document.querySelectorAll('[data-emoji-button]').length;
  });

  expect(initialCount).toBe(24);
  const firstEmoji = page.locator('[data-emoji-button]').first();
  await firstEmoji.focus();
  await firstEmoji.press('End');

  await expect(page.locator('[data-emoji-button]')).toHaveCount(388);
  await expect(page.locator('[data-emoji-button]').last()).toBeFocused();
});

test('uses only same-origin runtime resources', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.app-shell')).toBeVisible();
  const origins = await page.evaluate(() =>
    [...new Set(performance.getEntriesByType('resource').map((entry) => new URL(entry.name).origin))],
  );

  expect(origins).toEqual(['http://127.0.0.1:4173']);
});

test('keeps preference controls inside the shell in light and dark themes', async ({ page }) => {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.locator('.app-shell')).toBeVisible();
    const location = viewport.width < 900 ? 'mobile' : 'desktop';
    if (location === 'mobile') {
      await page.locator('.mobile-menu-button').click();
    }

    for (const theme of ['dark', 'light']) {
      await page.locator(`[data-theme-select="${location}"]`).selectOption(theme);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      const controlsFit = await page.evaluate((selector) => {
        const shell = document.querySelector('.app-shell')?.getBoundingClientRect();
        const control = document.querySelector(selector)?.getBoundingClientRect();
        return !!shell && !!control && control.left >= shell.left && control.right <= shell.right;
      }, `[data-theme-select="${location}"]`);
      expect(controlsFit).toBe(true);
    }
  }
});
