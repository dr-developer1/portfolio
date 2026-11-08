import { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { useTerminalInput } from './useTerminalInput';
import { initializeCommands } from '../data/commands';
import { TerminalContext } from './TerminalContext';
import type { UseTerminalReturn } from '../types';

const context = {
  currentDirectory: '~',
  bootMode: 'normal',
  musicEnabled: false,
  isLoading: false,
  isPlaygroundOpen: false,
  navigateHistory: () => 'help',
  resetHistoryIndex: vi.fn(),
};
function Harness() {
  const [input, setInput] = useState('hel');
  return (
    <TerminalContext.Provider
      value={{ ...context, input, setInput } as unknown as UseTerminalReturn}
    >
      <Editor />
    </TerminalContext.Provider>
  );
}
function Editor() {
  const { inputRef, input, handleInputChange, handleKeyDown, handleSelect } = useTerminalInput();
  return (
    <input
      ref={inputRef}
      value={input}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      onSelect={handleSelect}
    />
  );
}

afterEach(() => vi.unstubAllGlobals());

it.each(['ArrowUp', 'Tab'])('does not overwrite a native caret move after %s', async (key) => {
  initializeCommands();
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  const frames: FrameRequestCallback[] = [];
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => frames.push(callback));
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  try {
    await act(async () => root.render(<Harness />));
    const input = container.querySelector('input')!;
    input.focus();
    await act(async () =>
      input.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
    );
    expect(input.value).toBe('help');
    expect(input.selectionStart).toBe(4);
    // The browser handles ArrowLeft before the next animation frame on fast keystrokes.
    input.setSelectionRange(3, 3);
    await act(async () => frames.forEach((callback) => callback(16)));
    expect(input.selectionStart).toBe(3);
  } finally {
    await act(async () => root.unmount());
    container.remove();
  }
});
