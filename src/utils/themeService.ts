/**
 * Service for managing application themes
 * Handles persistence to localStorage and application to the DOM
 */

export const AVAILABLE_THEMES = ['dark', 'light', 'dracula', 'nord', 'monokai', 'matrix'] as const;

export type ThemeName = (typeof AVAILABLE_THEMES)[number];

const THEME_STORAGE_KEY = 'portfolio_theme';
const DEFAULT_THEME: ThemeName = 'dark';

/**
 * Checks if a string is a valid theme name
 */
export function isValidTheme(theme: string): theme is ThemeName {
  return AVAILABLE_THEMES.includes(theme as ThemeName);
}

/**
 * Gets the stored theme from localStorage or returns default
 */
export function getStoredTheme(): ThemeName {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && isValidTheme(stored)) {
      return stored;
    }
  } catch (e) {
    console.warn('Failed to access localStorage for theme', e);
  }
  return DEFAULT_THEME;
}

/**
 * Saves the theme to localStorage
 */
export function setStoredTheme(theme: ThemeName): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (e) {
    console.warn('Failed to save theme to localStorage', e);
  }
}

/**
 * Applies the theme to the document root
 */
export function applyTheme(theme: ThemeName): void {
  document.documentElement.setAttribute('data-theme', theme);
}

/**
 * Get the default theme name (pure helper, no side effects)
 * Use the theme-change event to actually apply and persist the reset
 */
export function getDefaultTheme(): ThemeName {
  return DEFAULT_THEME;
}
