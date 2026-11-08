import { expect, test } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

test('Christmas desktop and mobile screenshots preserve the frame and ornament', async ({
  page,
  isMobile,
}) => {
  await page.clock.setFixedTime(new Date(2026, 11, 20, 12));
  await page.addInitScript(() => {
    // Freeze random snow placement without masking the ornament or controls.
    let seed = 24;
    Math.random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) | 0) >>> 0) / 4294967296;
  });
  await page.setViewportSize(isMobile ? { width: 390, height: 844 } : { width: 1440, height: 900 });
  await page.goto('./?lang=en');
  await page.getByLabel('Type a secret code or press Enter to boot').press('Enter');
  await expect(page.getByTestId('santa-hat')).toHaveAttribute('data-renderer', 'webgl');
  await expect(page.getByTestId('command-hint')).toBeVisible();
  await page.getByLabel('Terminal command input').blur();
  await expect(page).toHaveScreenshot('christmas-frame.png', { maxDiffPixelRatio: 0.01 });
});
