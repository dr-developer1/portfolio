import { describe, expect, it } from 'vitest';

import { detectSecretMode } from './useSecretCode';

describe('detectSecretMode', () => {
  it('detects known secret codes', () => {
    expect(detectSecretMode('debug')).toBe('dev');
    expect(detectSecretMode('rabbit')).toBe('matrix');
  });

  it('prefers the longest matching code', () => {
    expect(detectSecretMode('developer')).toBe('dev');
  });
});
