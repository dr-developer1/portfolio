import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { StartPrompt } from './StartPrompt';

vi.mock('../../i18n/locale', () => ({
  useLocale: () => 'en',
  text: (en: string) => en,
}));

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it('does not steal language-button focus after the prompt mounts', async () => {
  vi.useFakeTimers();
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  try {
    await act(async () =>
      root.render(
        <>
          <button>Français</button>
          <StartPrompt />
        </>
      )
    );
    const language = container.querySelector('button')!;
    language.focus();
    await act(async () => vi.advanceTimersByTime(100));
    expect(document.activeElement).toBe(language);
  } finally {
    await act(async () => root.unmount());
    container.remove();
  }
});

it('preserves focus already placed on another control when mounting', async () => {
  vi.useFakeTimers();
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  const language = document.createElement('button');
  document.body.append(language);
  language.focus();
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  try {
    await act(async () => root.render(<StartPrompt />));
    await act(async () => vi.advanceTimersByTime(100));
    expect(document.activeElement).toBe(language);
  } finally {
    await act(async () => root.unmount());
    container.remove();
    language.remove();
  }
});
