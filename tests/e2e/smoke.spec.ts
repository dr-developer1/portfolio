import { expect, test } from '@playwright/test';

test('boot to guided recruiter flow', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /start/i }).click();
  await expect(page.getByText(/help/i)).toBeVisible();
});
