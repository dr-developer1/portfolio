import { expect, test } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

for (const [width, height] of [
  [320, 640],
  [375, 812],
  [390, 844],
  [430, 932],
  [440, 956],
  [600, 900],
  [768, 1024],
  [740, 360],
  [1440, 900],
]) {
  test(`seasonal title bar and language toolbar at ${width}x${height}`, async ({
    page,
    isMobile,
  }) => {
    await page.setViewportSize({ width, height });
    await page.clock.setFixedTime(new Date(2026, 11, 20, 12));
    await page.goto('./?lang=en');
    await page.getByLabel('Type a secret code or press Enter to boot').press('Enter');
    await expect(page.getByTestId('santa-hat')).toHaveAttribute('data-renderer', 'webgl');
    for (const locale of ['en', 'fr'] as const) {
      await page
        .getByRole('button', { name: locale === 'en' ? 'English' : 'Français', exact: true })
        .click();
      const bar = page.getByRole('toolbar');
      const help = bar.getByRole('button', { name: /shortcuts|raccourcis/ });
      const music = bar.getByRole('button', { name: /music|musique/ });
      await expect(help).toHaveCount(1);
      await expect(music).toHaveCount(1);
      const download = page.getByRole('link', { name: /CV/ });
      await expect(download).toHaveAttribute(
        'href',
        new RegExp(locale === 'en' ? '/CV_Ahmad_IBRAHIM_En.pdf$' : '/CV_Ahmad_IBRAHIM.pdf$')
      );
      const geometry = await bar.evaluate((node) => {
        const box = (el: Element) => {
          const b = el.getBoundingClientRect();
          return {
            x: b.x,
            y: b.y,
            width: b.width,
            height: b.height,
            right: b.right,
            bottom: b.bottom,
          };
        };
        const buttons = [...node.querySelectorAll('button')];
        const title = node.querySelector('span[class*="windowTitle"]')!;
        const dots = node.firstElementChild!;
        const lower = node.nextElementSibling!;
        const lowerControls = [...lower.querySelectorAll('button, a')];
        const tip = document.querySelector('[data-testid="santa-hat"] button')!;
        const hittable = (el: Element, circular = false) => {
          const b = el.getBoundingClientRect();
          const points = circular
            ? [
                [b.width / 2, 3],
                [b.width - 3, b.height / 2],
                [b.width / 2, b.height - 3],
                [3, b.height / 2],
                [b.width / 2, b.height / 2],
              ]
            : [
                [3, 3],
                [b.width - 3, 3],
                [3, b.height - 3],
                [b.width - 3, b.height - 3],
                [b.width / 2, b.height / 2],
              ];
          return points.every(([x, y]) => el.contains(document.elementFromPoint(b.x + x, b.y + y)));
        };
        return {
          bar: box(node),
          title: box(title),
          dots: box(dots),
          buttons: buttons.map(box),
          lower: box(lower),
          lowerControls: lowerControls.map(box),
          tip: box(tip),
          hittable:
            [...buttons, ...lowerControls].every((el) => hittable(el)) && hittable(tip, true),
          overflow: document.documentElement.scrollWidth > innerWidth,
          window: box(node.parentElement!),
        };
      });
      expect(geometry.hittable).toBe(true);
      expect(geometry.overflow).toBe(false);
      expect(geometry.lowerControls).toHaveLength(3);
      for (const button of geometry.buttons) {
        expect(button.x).toBeGreaterThanOrEqual(geometry.title.right);
        expect(button.right).toBeLessThanOrEqual(geometry.bar.right);
        expect(button.y).toBeGreaterThanOrEqual(geometry.bar.y);
        expect(button.bottom).toBeLessThanOrEqual(geometry.bar.bottom);
        expect(button.width).toBeGreaterThanOrEqual(44);
        expect(button.height).toBeGreaterThanOrEqual(44);
        expect(
          button.right <= geometry.tip.x ||
            button.x >= geometry.tip.right ||
            button.bottom <= geometry.tip.y ||
            button.y >= geometry.tip.bottom
        ).toBe(true);
      }
      expect(geometry.title.width).toBeGreaterThan(60);
      expect(geometry.title.height).toBeGreaterThan(0);
      expect(geometry.title.x).toBeGreaterThanOrEqual(geometry.dots.right);
      const freeStart = geometry.dots.right;
      const freeEnd = geometry.buttons[0].x;
      expect(
        Math.abs((geometry.title.x + geometry.title.right) / 2 - (freeStart + freeEnd) / 2)
      ).toBeLessThan(5);
      expect(geometry.lower.y).toBeGreaterThanOrEqual(geometry.bar.bottom);
      for (const control of geometry.lowerControls)
        expect(control.y).toBeGreaterThanOrEqual(geometry.bar.bottom);
      if (width <= 768) {
        expect(geometry.window.width).toBeGreaterThanOrEqual(width - 20);
        expect(Math.abs(geometry.window.x - (width - geometry.window.right))).toBeLessThan(2);
      }
      if (width === 440) expect(geometry.lower.height).toBeLessThan(75);
      // Keyboard focus rings remain visible; Enter opens Help and Escape restores focus.
      await music.focus();
      await music.press('Shift+Tab');
      await expect(help).toBeFocused();
      expect(await help.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid');
      await help.press('Enter');
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(help).toBeFocused();
      if (isMobile) await music.tap();
      else await music.click();
      await expect(music).toHaveAttribute('aria-label', /Mute|Couper/);
      await music.press('Enter');
      await expect(music).toHaveAttribute('aria-label', /Enable|Activer/);
    }
  });
}

for (const width of [320, 440, 1440]) {
  test(`regular title-bar controls and CV remain usable at ${width}px`, async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 6, 20, 12));
    await page.setViewportSize({ width, height: 900 });
    await page.goto('./?lang=en');
    await page.getByLabel('Type a secret code or press Enter to boot').press('Enter');
    const bar = page.getByRole('toolbar');
    await expect(
      bar.getByRole('button', { name: 'Open keyboard shortcuts', exact: true })
    ).toBeVisible();
    await expect(bar.getByRole('button', { name: 'Enable music', exact: true })).toBeVisible();
    await expect(page.getByTestId('santa-hat')).toHaveCount(0);
    await page.getByRole('button', { name: 'Français', exact: true }).click();
    await expect(
      bar.getByRole('button', { name: 'Ouvrir les raccourcis clavier', exact: true })
    ).toBeVisible();
    await expect(page.getByRole('link', { name: /CV/ })).toHaveAttribute(
      'href',
      /\/CV_Ahmad_IBRAHIM.pdf$/
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true
    );
  });
}

test('seasonal controls and prompt remain reachable in a keyboard-sized viewport', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'Mobile viewport behavior');
  await page.clock.setFixedTime(new Date(2026, 11, 20, 12));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./?lang=en');
  await page.getByLabel('Type a secret code or press Enter to boot').press('Enter');
  await expect(page.getByTestId('santa-hat')).toHaveAttribute('data-renderer', 'webgl');
  // Browser emulation cannot open an OS keyboard; resize to its available content area.
  await page.setViewportSize({ width: 390, height: 480 });
  await page.getByTestId('terminal-input-mobile').tap();
  await expect(page.getByLabel('Terminal command input')).toBeFocused();
  await expect(page.getByTestId('terminal-input-display')).toBeInViewport();
  const bar = page.getByRole('toolbar');
  await bar.getByRole('button', { name: 'Open keyboard shortcuts', exact: true }).tap();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('link', { name: /CV/ })).toBeInViewport();
});
