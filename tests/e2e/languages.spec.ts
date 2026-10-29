import { expect, test } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

async function boot(page: import('@playwright/test').Page) {
  await page.getByLabel('Type a secret code or press Enter to boot').press('Enter');
  await expect(page.getByText('Oscilloscope Name Trace', { exact: true })).toBeVisible();
}

test('language and matching CV work before boot and persist after reload', async ({ page }) => {
  await page.goto('/?lang=en');
  await page.getByRole('button', { name: 'Français', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  const cv = page.getByRole('link', { name: /Télécharger le CV/ });
  await expect(cv).toHaveAttribute('href', '/CV_Ahmad_IBRAHIM.pdf');
  const downloadPromise = page.waitForEvent('download');
  await cv.click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('CV_Ahmad_IBRAHIM.pdf');
  expect(await download.failure()).toBeNull();
  await expect(
    page.getByText('Appuyez sur Entrée pour démarrer le système…', { exact: true })
  ).toBeAttached();
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await boot(page);
  await expect(
    page.getByRole('region', { name: 'Choisissez votre parcours', exact: true })
  ).toBeAttached();
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.getByRole('link', { name: /Download CV/ })).toHaveAttribute(
    'href',
    '/CV_Ahmad_IBRAHIM_En.pdf'
  );
  const enDownload = page.waitForEvent('download');
  await page.getByRole('link', { name: /Download CV/ }).click();
  expect((await enDownload).suggestedFilename()).toBe('CV_Ahmad_IBRAHIM_En.pdf');
});

test('each perspective is reversible, localized, and preserves career output', async ({ page }) => {
  await page.goto('/?lang=en');
  await boot(page);
  for (const mode of ['recruiter', 'engineer', 'founder', 'client']) {
    await page
      .getByRole('region', { name: 'Choose your path', exact: true })
      .getByRole('button', { name: new RegExp(`^${mode}$`, 'i') })
      .click();
    await page.getByRole('button', { name: 'Change path', exact: true }).click();
  }
  await page
    .getByRole('region', { name: 'Choose your path', exact: true })
    .getByRole('button', { name: 'Recruiter', exact: true })
    .click();
  await page
    .getByRole('region', { name: 'Choose your path', exact: true })
    .getByRole('button', { name: 'Experience', exact: true })
    .click();
  await expect(page.getByRole('heading', { name: 'Professional experience' })).toBeAttached();
  await expect(page.getByRole('listitem').filter({ hasText: 'Sogecommerce' })).toBeAttached();
  await page.getByRole('button', { name: 'Français', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Expériences professionnelles' })).toBeAttached();
  await expect(page.getByRole('heading', { name: 'Professional experience' })).toHaveCount(0);
  await expect(page.getByText('Depuis sept. 2024', { exact: true })).toBeAttached();
  const input = page.getByLabel('Terminal command input');
  await input.fill('resume');
  await input.press('Enter');
  await expect(
    page.getByRole('link', { name: 'Télécharger le CV français (PDF)' })
  ).toHaveAttribute('href', '/CV_Ahmad_IBRAHIM.pdf');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true
  );
});

test('language controls support keyboard activation without starting boot', async ({ page }) => {
  await page.goto('/?lang=en');
  await page.getByRole('button', { name: 'Français', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(
    page.getByText('Appuyez sur Entrée pour démarrer le système…', { exact: true })
  ).toBeAttached();
  await boot(page);
  const input = page.getByLabel('Terminal command input');
  await input.fill('language en');
  await input.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('link', { name: /Download CV/ })).toHaveAttribute(
    'href',
    '/CV_Ahmad_IBRAHIM_En.pdf'
  );
});
