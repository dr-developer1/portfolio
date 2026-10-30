import { expect, test } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

test('boot shows oscilloscope and quiet command hints', async ({ page }) => {
  await page.goto('./');
  await page.getByLabel('Type a secret code or press Enter to boot').press('Enter');
  await expect(page.getByText('Oscilloscope Name Trace', { exact: true })).toBeVisible();
  await expect(page.getByTestId('command-hint')).toBeVisible();
  await page
    .getByTestId('command-hint')
    .getByRole('button', { name: 'about', exact: true })
    .click();
  await expect(page.getByTestId('command-hint')).toHaveCount(0);
});

test('help and ls commands produce output', async ({ page }) => {
  await page.goto('./');
  await page.getByLabel('Type a secret code or press Enter to boot').press('Enter');

  const input = page.getByLabel('Terminal command input');

  await input.fill('help');
  await input.press('Enter');
  await expect(
    page.getByRole('heading', { name: 'Available commands', exact: true })
  ).toBeVisible();

  const reference = page.locator('dl').filter({
    has: page.getByRole('button', { name: 'about', exact: true }),
  });
  await expect(reference).toBeVisible();
  await expect(page.getByText(/Click a shortcut or type a command/)).toHaveCount(0);
  await reference.getByRole('button', { name: 'about', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Ahmad Ibrahim', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Français', exact: true }).click();
  await expect(reference.getByText('Découvrir mon profil', { exact: true })).toBeAttached();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  await input.fill('clear');
  await input.press('Enter');
  await expect(page.getByTestId('command-hint')).toHaveCount(0);

  await input.fill('ls');
  await input.press('Enter');
  await expect(page.getByText(/bio\.txt/i)).toBeVisible();
});
