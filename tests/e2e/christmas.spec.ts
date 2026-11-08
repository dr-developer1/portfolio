import { expect, test } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

test('Christmas locks the theme, replaces Matrix, and restores preferences after the event', async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date(2026, 10, 15, 12));
  await page.addInitScript(() => {
    localStorage.setItem('portfolio_theme', 'nord');
    localStorage.setItem('portfolio_matrix_effect', 'true');
  });
  await page.goto('./');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'christmas');
  await page.getByLabel('Type a secret code or press Enter to boot').press('Enter');
  await expect(page.getByTestId('santa-hat')).toBeVisible();
  await expect(page.getByTestId('snowfall')).toBeAttached();
  const input = page.getByLabel('Terminal command input');
  for (const command of ['theme light', 'theme reset', 'theme list']) {
    await input.fill(command);
    await input.press('Enter');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'christmas');
  }
  await expect(page.getByText(/Theme switching returns January 16/).first()).toBeAttached();
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme: 'matrix' } }));
  });
  expect(await page.evaluate(() => localStorage.getItem('portfolio_theme'))).toBe('nord');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const snow = page.getByTestId('snowfall');
  const still = await snow.evaluate((node) => (node as HTMLCanvasElement).toDataURL());
  await page.waitForTimeout(120);
  expect(await snow.evaluate((node) => (node as HTMLCanvasElement).toDataURL())).toBe(still);

  await page.clock.setFixedTime(new Date(2027, 0, 16, 0));
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'nord');
  await expect(page.getByTestId('santa-hat')).toHaveCount(0);
  await expect(page.getByTestId('snowfall')).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('portfolio_matrix_effect'))).toBe('true');
  await input.fill('theme dracula');
  await input.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dracula');
});

test('Christmas returns every year and production ignores preview overrides', async ({ page }) => {
  for (const [date, active] of [
    [new Date(2027, 0, 15, 23, 59), true],
    [new Date(2027, 10, 14, 23, 59), false],
    [new Date(2027, 10, 15, 0), true],
  ] as const) {
    await page.clock.setFixedTime(date);
    await page.goto(`./?season=${active ? 'normal' : 'christmas'}`);
    if (active) await expect(page.locator('html')).toHaveAttribute('data-theme', 'christmas');
    else await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'christmas');
  }
});

test('3D hat sits on the right, drags by its tip, and respects reduced motion', async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date(2026, 11, 20, 12));
  await page.goto('./');
  await page.getByLabel('Type a secret code or press Enter to boot').press('Enter');
  const hat = page.getByTestId('santa-hat');
  await expect(hat).toHaveAttribute('data-renderer', 'webgl');
  const tip = page.getByRole('button', { name: 'Play with Santa hat' });
  const hatBox = (await hat.boundingBox())!;
  const before = (await tip.boundingBox())!;
  const viewport = page.viewportSize()!;
  expect(hatBox.x).toBeGreaterThan(viewport.width / 2);
  await page.mouse.move(before.x + 22, before.y + 22);
  await page.mouse.down();
  await expect(hat).toHaveAttribute('data-motion', 'dragging');
  await page.mouse.move(before.x + 4, before.y - 12, { steps: 8 });
  const dragged = (await tip.boundingBox())!;
  expect(before.y - dragged.y).toBeGreaterThan(10);
  expect(await hat.boundingBox()).toEqual(hatBox);
  await page.mouse.up();
  await expect(hat).toHaveAttribute('data-motion', 'resting');
  await expect.poll(async () => Math.abs((await tip.boundingBox())!.y - before.y)).toBeLessThan(1);
  await tip.focus();
  await tip.press('Enter');
  await expect(tip).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  if (viewport.width > 768) {
    for (const size of [{ width: 320, height: 640 }, viewport]) {
      await page.setViewportSize(size);
      await expect
        .poll(() =>
          tip.evaluate((node) => {
            const box = node.getBoundingClientRect();
            return document.elementFromPoint(box.x + 22, box.y + 22) === node;
          })
        )
        .toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true
      );
    }
  }
});

test('hat springs back after release and supports keyboard play', async ({ page, isMobile }) => {
  await page.clock.setFixedTime(new Date(2026, 11, 20, 12));
  await page.goto('./');
  await page.getByLabel('Type a secret code or press Enter to boot').press('Enter');
  await expect(page.getByLabel('Terminal command input')).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const tip = page.getByRole('button', { name: 'Play with Santa hat' });
  await expect(tip).toBeVisible();
  if (isMobile) {
    const box = (await tip.boundingBox())!;
    await page.touchscreen.tap(box.x + 22, box.y + 22);
    await expect(page.getByTestId('santa-hat')).toHaveAttribute('data-motion', 'settling');
    await expect(page.getByTestId('santa-hat')).toHaveAttribute('data-motion', 'resting', {
      timeout: 8000,
    });
  }
  await tip.focus();
  await tip.press('Enter');
  await expect(page.getByTestId('santa-hat')).toHaveAttribute('data-motion', 'settling');
  await expect(page.getByTestId('santa-hat')).toHaveAttribute('data-motion', 'resting', {
    timeout: 8000,
  });
});

test('hat illustration remains if the 3D asset cannot load', async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 11, 20, 12));
  await page.route('**/models/santa-hat.bin', (route) => route.fulfill({ status: 404, body: '' }));
  await page.goto('./');
  await page.getByLabel('Type a secret code or press Enter to boot').press('Enter');
  await expect(page.getByTestId('santa-hat').locator('svg')).toBeVisible();
  await expect(page.getByLabel('Terminal command input')).toBeVisible();
});
