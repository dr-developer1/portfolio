import { describe, expect, it } from 'vitest';

import { computeKeyboardInset } from './useKeyboardViewport';

describe('computeKeyboardInset', () => {
  it('returns zero when visible height matches baseline', () => {
    expect(computeKeyboardInset(900, 900)).toBe(0);
  });

  it('returns a positive inset when visible height shrinks', () => {
    expect(computeKeyboardInset(900, 620)).toBe(280);
  });

  it('clamps negative results to zero', () => {
    expect(computeKeyboardInset(620, 900)).toBe(0);
  });

  it('guards against invalid values', () => {
    expect(computeKeyboardInset(Number.NaN, 900)).toBe(0);
    expect(computeKeyboardInset(900, Number.NaN)).toBe(0);
  });
});
