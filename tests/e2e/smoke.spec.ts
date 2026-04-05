import { expect, test } from '@playwright/test';

test('boot to guided recruiter flow', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /start/i }).click();
  await expect(page.getByText(/help/i)).toBeVisible();
});

test('help and ls commands produce output', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /start/i }).click();

  const input = page.getByLabel('Terminal command input');

  await input.fill('help');
  await input.press('Enter');
  await expect(page.getByText(/Available commands/i)).toBeVisible();

  await input.fill('ls');
  await input.press('Enter');
  await expect(page.getByText(/bio\.txt/i)).toBeVisible();
});
