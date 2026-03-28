import { expect, test, type Page } from '@playwright/test';

const bootToTerminal = async (page: Page) => {
  await page.goto('/');

  const startButton = page.getByRole('button', { name: /start/i }).first();

  if (await startButton.isVisible().catch(() => false)) {
    await startButton.click();
  }

  const inputContainer = page.getByTestId('terminal-input-mobile');

  if (!(await inputContainer.isVisible().catch(() => false))) {
    if (await startButton.isVisible().catch(() => false)) {
      await startButton.click();
    }

    await inputContainer.waitFor({ state: 'visible', timeout: 30000 });
  }
};

const focusTerminalInput = async (page: Page) => {
  await page.getByTestId('terminal-input-mobile').click();
  await expect.poll(
    async () =>
      page.evaluate(() => {
        const input = document.querySelector('input[aria-label="Terminal input"]');
        return document.activeElement === input;
      }),
    { timeout: 3000 }
  ).toBe(true);
};

const assertInputDisplayInViewport = async (page: Page) => {
  await expect.poll(
    async () =>
      page.evaluate(() => {
        const el = document.querySelector('[data-testid="terminal-input-display"]');
        if (!el) {
          return false;
        }

        const rect = el.getBoundingClientRect();
        const viewport = window.visualViewport;
        const viewportTop = viewport?.offsetTop ?? 0;
        const viewportBottom = viewportTop + (viewport?.height ?? window.innerHeight);

        return rect.top >= viewportTop && rect.bottom <= viewportBottom;
      }),
    { timeout: 5000 }
  ).toBe(true);
};

const runCommand = async (page: Page, command: string) => {
  await page.keyboard.type(command);
  await page.keyboard.press('Enter');
};

test('mobile input stays visible after focus and command refocus cycles', async ({ page }) => {
  test.skip(!test.info().project.name.includes('mobile'), 'Mobile keyboard behavior is mobile-only');

  await bootToTerminal(page);
  await focusTerminalInput(page);
  await assertInputDisplayInViewport(page);

  await runCommand(page, 'help');
  await assertInputDisplayInViewport(page);

  await runCommand(page, 'top-projects');
  await assertInputDisplayInViewport(page);
});

test('mobile input remains visible with long terminal history', async ({ page }) => {
  test.skip(!test.info().project.name.includes('mobile'), 'Mobile keyboard behavior is mobile-only');

  await bootToTerminal(page);
  await focusTerminalInput(page);

  for (let i = 0; i < 6; i += 1) {
    await runCommand(page, 'help');
  }

  await assertInputDisplayInViewport(page);
});
