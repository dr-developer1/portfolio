/**
 * Local storage keys
 * Centralized definition of all localStorage keys used in the application
 */
export const STORAGE_KEYS = {
  /** Theme preference (dracula, monokai, etc.) */
  theme: 'portfolio_theme',

  /** Matrix rain effect enabled/disabled */
  matrix: 'portfolio_matrix_effect',

  /** Background music enabled/disabled */
  music: 'portfolio_music_enabled',

  /** Playground workspace persistence */
  playground: 'portfolio_playground_workspace',
} as const;
