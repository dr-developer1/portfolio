import { STORAGE_KEYS } from '../config';

/**
 * Storage keys exported for use in commands
 * Separated from useTerminal to avoid react-refresh issues
 */

/** Storage key for matrix effect preference */
export const MATRIX_STORAGE_KEY = STORAGE_KEYS.matrix;

/** Storage key for music preference */
export const MUSIC_STORAGE_KEY = STORAGE_KEYS.music;

/** Storage key for playground workspace persistence */
export const PLAYGROUND_STORAGE_KEY = STORAGE_KEYS.playground;

/** Storage key for visitor progression and stats */
export const PROGRESS_STORAGE_KEY = STORAGE_KEYS.progress;
