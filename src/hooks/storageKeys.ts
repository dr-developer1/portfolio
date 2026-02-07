import { STORAGE_KEYS } from '../config';

/**
 * Storage keys exported for use in commands
 * Separated from useTerminal to avoid react-refresh issues
 */

/** Storage key for matrix effect preference */
export const MATRIX_STORAGE_KEY = STORAGE_KEYS.matrix;

/** Storage key for music preference */
export const MUSIC_STORAGE_KEY = STORAGE_KEYS.music;
