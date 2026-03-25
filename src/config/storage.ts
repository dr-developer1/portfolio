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

  /** Visitor progression, achievements, and usage stats */
  progress: 'portfolio_visitor_progress',
} as const;
