import { describe, expect, it } from 'vitest';

import { parseCommand } from './commandParser';

describe('parseCommand', () => {
  it('parses a plain command', () => {
    expect(parseCommand('help')).toEqual({
      name: 'help',
      args: [],
      raw: 'help',
    });
  });

  it('keeps quoted arguments together', () => {
    expect(parseCommand('grep "hello world" projects')).toEqual({
      name: 'grep',
      args: ['hello world', 'projects'],
      raw: 'grep "hello world" projects',
    });
  });
});
