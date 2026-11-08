import { expect, test } from '@playwright/test';
import { nativeTouch } from './helpers/nativeTouch';

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
  // WebKit can acknowledge input before its composited transform is observable.
  await expect.poll(async () => before.y - (await tip.boundingBox())!.y).toBeGreaterThan(10);
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

test('native mobile touch dragging moves the tip and cancellation restores it', async ({
  page,
  isMobile,
  browserName,
}) => {
  test.skip(!isMobile, 'Native touch requires a touch device');
  await page.clock.setFixedTime(new Date(2026, 11, 20, 12));
  await page.goto('./?lang=en');
  await page.getByLabel('Type a secret code or press Enter to boot').press('Enter');
  const hat = page.getByTestId('santa-hat');
  const tip = page.getByRole('button', { name: 'Play with Santa hat' });
  await expect(hat).toHaveAttribute('data-renderer', 'webgl');
  await expect.poll(() => tip.evaluate((node) => node.style.transform)).not.toBe('');
  await tip.evaluate((node) =>
    node.addEventListener('pointerdown', (event) => {
      node.dataset.nativeTouch = String(event.isTrusted && event.pointerType === 'touch');
    })
  );
  const before = (await tip.boundingBox())!;
  const frame = await hat.boundingBox();
  const touch = await nativeTouch(page, browserName);
  for (const ending of ['touchEnd', 'touchCancel'] as const) {
    await touch('touchStart', before.x + 22, before.y + 22);
    await expect(tip).toHaveAttribute('data-native-touch', 'true');
    await expect(hat).toHaveAttribute('data-motion', 'dragging');
    for (let step = 1; step <= 8; step++)
      await touch('touchMove', before.x + 22 - (18 * step) / 8, before.y + 22 - (34 * step) / 8);
    await expect.poll(async () => before.y - (await tip.boundingBox())!.y).toBeGreaterThan(10);
    expect(await hat.boundingBox()).toEqual(frame);
    await touch(ending, before.x + 4, before.y - 12);
    await expect(hat).toHaveAttribute('data-motion', 'resting');
    await expect
      .poll(async () => Math.abs((await tip.boundingBox())!.y - before.y))
      .toBeLessThan(1);
  }
  await tip.press('Escape');
  await page.getByLabel('Terminal command input').fill('help');
  await expect(page.getByLabel('Terminal command input')).toHaveValue('help');
});

test('seasonal frame uses phone width and keeps complete controls reachable on rotation', async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.clock.setFixedTime(new Date(2026, 11, 20, 12));
  await page.goto('./?lang=en');
  await page.getByLabel('Type a secret code or press Enter to boot').press('Enter');
  const windowControls = page.getByRole('toolbar', { name: 'Terminal window controls' });
  const terminal = windowControls.locator('..');
  for (const [width, height] of [
    [320, 640],
    [375, 812],
    [390, 844],
    [430, 932],
    [768, 1024],
    [740, 360],
  ]) {
    await page.setViewportSize({ width, height });
    await expect
      .poll(async () => (await terminal.boundingBox())!.width)
      .toBeGreaterThan(width * 0.93);
    const box = (await terminal.boundingBox())!;
    expect(Math.abs(box.x - (width - box.x - box.width))).toBeLessThan(2);
    const tip = page.getByRole('button', { name: 'Play with Santa hat' });
    await expect
      .poll(() =>
        tip.evaluate((node) => {
          const b = node.getBoundingClientRect();
          return [
            [2, 22],
            [42, 22],
            [22, 2],
            [22, 42],
          ].every(([x, y]) => document.elementFromPoint(b.x + x, b.y + y) === node);
        })
      )
      .toBe(true);
    for (const control of [
      page.getByRole('button', { name: 'Open keyboard shortcuts' }),
      page.getByRole('button', { name: 'English' }),
      page.getByRole('button', { name: 'Français' }),
      page.getByRole('link', { name: /Download CV/ }),
    ])
      await expect(control).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true
    );
    const input = page.getByLabel('Terminal command input');
    const prompt = page.getByTestId('terminal-input-mobile');
    await prompt.scrollIntoViewIfNeeded();
    await input.focus();
    await expect(prompt).toBeInViewport();
    await expect(input).toBeFocused();
    await input.blur();
  }
});

test('corrupt model falls back and WebGL context loss can recover', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.clock.setFixedTime(new Date(2026, 11, 20, 12));
  await page.route('**/models/santa-hat.bin', (route) =>
    route.fulfill({ status: 200, contentType: 'application/octet-stream', body: 'bad' })
  );
  await page.goto('./?lang=en');
  await page.getByLabel('Type a secret code or press Enter to boot').press('Enter');
  await expect(page.getByTestId('santa-hat').locator('svg')).toBeVisible();
  await page.unroute('**/models/santa-hat.bin');
  await page.reload();
  await page.getByLabel('Type a secret code or press Enter to boot').press('Enter');
  const hat = page.getByTestId('santa-hat');
  await expect(hat).toHaveAttribute('data-renderer', 'webgl');
  await hat.locator('canvas').evaluate((node) => {
    const extension = node.getContext('webgl')!.getExtension('WEBGL_lose_context')!;
    node.addEventListener(
      'webglcontextlost',
      () => setTimeout(() => extension.restoreContext(), 100),
      { once: true }
    );
    extension.loseContext();
  });
  await expect(hat.locator('svg')).toBeVisible();
  await expect(hat).toHaveAttribute('data-renderer', 'webgl');
  await expect(page.getByRole('button', { name: 'Play with Santa hat' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('snow pauses in hidden tabs and resumes when visible', async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 11, 20, 12));
  await page.goto('./?lang=en');
  await page.getByLabel('Type a secret code or press Enter to boot').press('Enter');
  await expect(page.getByTestId('snowfall')).toBeAttached();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  // Wait for actual animation before hiding; a media-query restart clears the canvas.
  await expect
    .poll(() =>
      page.getByTestId('snowfall').evaluate(async (node) => {
        const canvas = node as HTMLCanvasElement;
        const before = canvas.toDataURL();
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        return canvas.toDataURL() !== before;
      })
    )
    .toBe(true);
  const result = await page.getByTestId('snowfall').evaluate(async (node) => {
    let hidden = true;
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
    document.dispatchEvent(new Event('visibilitychange'));
    const canvas = node as HTMLCanvasElement;
    const before = canvas.toDataURL();
    // Observe multiple frame intervals while the document is hidden.
    await new Promise((resolve) => setTimeout(resolve, 120));
    const paused = canvas.toDataURL() === before;
    hidden = false;
    document.dispatchEvent(new Event('visibilitychange'));
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const resumed = canvas.toDataURL() !== before;
    Reflect.deleteProperty(document, 'hidden');
    return { paused, resumed };
  });
  expect(result).toEqual({ paused: true, resumed: true });
});
