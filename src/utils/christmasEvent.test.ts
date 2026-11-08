import { afterEach, describe, expect, it, vi } from 'vitest';
import { isChristmasEventActive, isChristmasSeason } from './christmasEvent';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  window.history.replaceState({}, '', '/');
});

describe('annual Christmas season', () => {
  it.each([
    [2026, 10, 14, 23, 59, false],
    [2026, 10, 15, 0, 0, true],
    [2026, 11, 25, 12, 0, true],
    [2027, 0, 1, 0, 0, true],
    [2027, 0, 15, 23, 59, true],
    [2027, 0, 16, 0, 0, false],
    [2027, 5, 15, 12, 0, false],
    [2027, 10, 15, 0, 0, true],
  ])('%i/%i/%i %i:%i active=%s', (year, month, day, hour, minute, active) => {
    expect(isChristmasSeason(new Date(year, month, day, hour, minute))).toBe(active);
  });

  it('allows development previews only', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 1));
    window.history.replaceState({}, '', '/?season=christmas');
    vi.stubEnv('DEV', true);
    expect(isChristmasEventActive()).toBe(true);
    vi.stubEnv('DEV', false);
    expect(isChristmasEventActive()).toBe(false);
  });

  it('allows the normal appearance in development during the season', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 11, 25));
    vi.stubEnv('DEV', true);
    window.history.replaceState({}, '', '/?season=normal');
    expect(isChristmasEventActive()).toBe(false);
  });
});
