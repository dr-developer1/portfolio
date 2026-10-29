import { expect, test } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

test('boot to guided recruiter flow', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Type a secret code or press Enter to boot').press('Enter');
  await expect(page.getByText('Oscilloscope Name Trace', { exact: true })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Choose your path', exact: true })).toBeAttached();
});

test('help and ls commands produce output', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Type a secret code or press Enter to boot').press('Enter');

  const input = page.getByLabel('Terminal command input');

  await input.fill('help');
  await input.press('Enter');
  await expect(
    page.getByRole('heading', { name: 'Available commands', exact: true })
  ).toBeVisible();

  await input.fill('ls');
  await input.press('Enter');
  await expect(page.getByText(/bio\.txt/i)).toBeVisible();
});
