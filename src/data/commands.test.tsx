import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

import type { CommandContext, VisitorProgress } from '../types';
import { getCommand } from '../utils/commandRegistry';
import { clearRegistry } from '../utils/commandRegistry';
import { getVisitorProgress } from '../utils/progressService';
import { PROGRESS_STORAGE_KEY } from '../hooks/storageKeys';
import { initializeCommands } from './commands';

function createContext(overrides: Partial<CommandContext> = {}): CommandContext {
  const visitorProgress: VisitorProgress = overrides.visitorProgress ?? getVisitorProgress();

  return {
    bootMode: 'normal',
    currentDirectory: '~',
    commandHistory: [],
    user: 'visitor',
    symbol: '$',
    visitorMode: visitorProgress.activePath,
    visitorProgress,
    sessionStartedAt: 0,
    clearTerminal: vi.fn(),
    setCurrentDirectory: vi.fn(),
    openPlayground: vi.fn(),
    closePlayground: vi.fn(),
    setVisitorMode: vi.fn(),
    setVisitorProgress: vi.fn(),
    setBootMode: vi.fn(),
    ...overrides,
  };
}

describe('commands', () => {
  beforeEach(() => {
    localStorage.clear();
    initializeCommands();
  });

  afterEach(() => {
    clearRegistry();
    localStorage.clear();
  });

  it('history renders recorded commands through the registry path', async () => {
    const outputs: React.ReactNode[] = [];
    const history = getCommand('history');
    const context = createContext({ commandHistory: ['help', 'ls'] });

    await history?.execute([], (content) => outputs.push(content), context);

    const html = outputs.map((output) => renderToStaticMarkup(<>{output}</>)).join('\n');
    expect(html).toContain('help');
    expect(html).toContain('ls');
  });

  it('ls renders virtual filesystem entries through the registry path', async () => {
    const outputs: React.ReactNode[] = [];
    const ls = getCommand('ls');

    await ls?.execute([], (content) => outputs.push(content), createContext());

    const html = outputs.map((output) => renderToStaticMarkup(<>{output}</>)).join('\n');
    expect(html).toContain('bio.txt');
    expect(html).toContain('projects/');
  });

  it('sudo without unlock keeps admin progression locked', async () => {
    const sudo = getCommand('sudo');
    const context = createContext();

    await sudo?.execute([], () => undefined, context);

    expect(context.setBootMode).toHaveBeenCalledWith('admin');
    expect(getVisitorProgress().adminUnlocked).toBe(false);
    expect(getVisitorProgress().unlockedVault).toBe(false);
  });

  it('sudo unlock persists admin and vault progression', async () => {
    const sudo = getCommand('sudo');
    const context = createContext();

    await sudo?.execute(['unlock'], () => undefined, context);

    const stored = JSON.parse(
      localStorage.getItem(PROGRESS_STORAGE_KEY) ?? '{}'
    ) as VisitorProgress;
    expect(stored.adminUnlocked).toBe(true);
    expect(stored.unlockedVault).toBe(true);
    expect(context.setVisitorProgress).toHaveBeenCalled();
  });
});
