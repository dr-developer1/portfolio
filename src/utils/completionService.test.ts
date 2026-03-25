import { beforeEach, describe, expect, it } from 'vitest';

import { initializeCommands } from '../data/commands';
import { getCompletions } from './completionService';

describe('completionService', () => {
  beforeEach(() => {
    initializeCommands();
  });

  it('completes command names', () => {
    const result = getCompletions('hi', '~', 'visitor');
    expect(result?.matches).toContain('highlights');
  });

  it('completes path names', () => {
    const result = getCompletions('cat bio', '~', 'visitor');
    expect(result?.matches).toContain('bio.txt');
  });
});
