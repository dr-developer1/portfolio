/**
 * localStorage Helper Utilities
 *
 * Centralized localStorage access with error handling.
 * Provides safe get/set operations that won't break if localStorage is unavailable.
 */

/**
 * Safely get a boolean value from localStorage
 * @param key - The localStorage key to retrieve
 * @param defaultValue - The default value if key doesn't exist or storage unavailable
 * @returns The stored boolean value or the default
 */
export function getStoredBoolean(key: string, defaultValue: boolean = true): boolean {
  try {
    const value = localStorage.getItem(key);
    if (value === null) return defaultValue;
    // Strict boolean parsing: only accept exact strings 'true' or 'false'
    if (value === 'true') return true;
    if (value === 'false') return false;
    // Invalid/corrupted data: fall back to default
    return defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Safely set a boolean value in localStorage
 * @param key - The localStorage key to set
 * @param value - The boolean value to store
 */
export function setStoredBoolean(key: string, value: boolean): void {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // Ignore storage errors (e.g., disabled or unavailable localStorage)
  }
}

/**
 * Safely get a string value from localStorage
 * @param key - The localStorage key to retrieve
 * @param defaultValue - The default value if key doesn't exist or storage unavailable
 * @returns The stored string value or the default
 */
export function getStoredString(key: string, defaultValue: string = ''): string {
  try {
    return localStorage.getItem(key) ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Safely set a string value in localStorage
 * @param key - The localStorage key to set
 * @param value - The string value to store
 */
export function setStoredString(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage errors
  }
}
