import { afterEach, describe, expect, it } from 'vitest';

import { clearRegistry, getCommand, registerCommand } from './commandRegistry';

describe('commandRegistry', () => {
  afterEach(() => {
    clearRegistry();
  });

  it('registers and resolves aliases', () => {
    registerCommand({
      name: 'hello',
      description: 'test',
      usage: 'hello',
      category: 'core',
      aliases: ['hi'],
      execute: () => {},
    });

    expect(getCommand('hi')?.name).toBe('hello');
  });

  it('throws on duplicate aliases', () => {
    registerCommand({
      name: 'hello',
      description: 'test',
      usage: 'hello',
      category: 'core',
      aliases: ['hi'],
      execute: () => {},
    });

    expect(() =>
      registerCommand({
        name: 'greet',
        description: 'test',
        usage: 'greet',
        category: 'core',
        aliases: ['hi'],
        execute: () => {},
      })
    ).toThrow(/Duplicate command alias/);
  });
});
