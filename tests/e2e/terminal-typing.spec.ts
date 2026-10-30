import { expect, test } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

test.beforeEach(async ({ page }) => {
  await page.goto('./?lang=en');
  await page.getByLabel('Type a secret code or press Enter to boot').press('Enter');
  await expect(page.getByTestId('command-hint')).toBeVisible();
});

test('caret and selection follow edits in the middle and at the beginning', async ({ page }) => {
  const input = page.getByLabel('Terminal command input');
  const display = page.getByTestId('terminal-input-display');
  await input.fill('hep');
  await input.press('ArrowLeft');
  await page.keyboard.type('l');
  await expect(input).toHaveValue('help');
  await expect(display).toHaveText('help');
  await expect(display.locator('span').last()).toHaveText('p');

  // Use native offsets so this also covers keyboards without a Home key.
  await input.evaluate((element: HTMLInputElement) => element.setSelectionRange(0, 0));
  await page.keyboard.type('x');
  await expect(input).toHaveValue('xhelp');
  await expect(display.locator('span').last()).toHaveText('h');

  await input.press('Shift+ArrowRight');
  await expect(display.locator('span').last()).toHaveText('h');
  // Copy must preserve both the selection and the command on Ctrl-based systems.
  await input.press('Control+c');
  await expect(input).toHaveValue('xhelp');
  await page.keyboard.type('H');
  await expect(input).toHaveValue('xHelp');
  await expect(display).toHaveText('xHelp');
});

test('composition does not submit or complete until committed', async ({ page }) => {
  const input = page.getByLabel('Terminal command input');
  await input.fill('help');
  await input.dispatchEvent('compositionstart');
  await input.press('Enter');
  await input.press('Tab');
  await expect(input).toHaveValue('help');
  await expect(page.getByTestId('command-hint')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Available commands', exact: true })).toHaveCount(
    0
  );
  await input.dispatchEvent('compositionend', { data: 'help' });
  await input.press('Enter');
  await expect(
    page.getByRole('heading', { name: 'Available commands', exact: true })
  ).toBeVisible();
});

test('completion and command history still work after editing', async ({ page }) => {
  const input = page.getByLabel('Terminal command input');
  await input.fill('hel');
  await input.press('Tab');
  await expect(input).toHaveValue('help');
  await input.press('Enter');
  await expect(
    page.getByRole('heading', { name: 'Available commands', exact: true })
  ).toBeVisible();
  await input.press('ArrowUp');
  await expect(input).toHaveValue('help');
  await input.press('ArrowLeft');
  await page.keyboard.type('x');
  await expect(input).toHaveValue('helxp');
  await expect(page.getByTestId('terminal-input-display')).toHaveText('helxp');
});
