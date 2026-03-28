/**
 * UI Constants
 * Centralized definition of magic numbers and configuration values
 */
export const UI_CONSTANTS = {
  /** Maximum depth for tree command directory traversal */
  MAX_TREE_DEPTH: 10,

  /** Buffer length for secret code detection on boot screen */
  SECRET_CODE_BUFFER_LENGTH: 20,

  /** Probability of random boot failure (0.0 to 1.0) */
  BOOT_FAILURE_PROBABILITY: 0.15,

  /** Font size for Matrix rain effect */
  MATRIX_FONT_SIZE: 16,

  /** Default delay between boot messages (ms) */
  DEFAULT_MESSAGE_DELAY: 600,

  /** Delay before transitioning to terminal after boot completes (ms) */
  BOOT_COMPLETE_DELAY: 2000,

  /** Mobile keyboard and viewport coordination settings */
  MOBILE_KEYBOARD: {
    /** Minimum viewport inset required to consider keyboard as open */
    OPEN_THRESHOLD_PX: 56,

    /** Delay used to align scrollIntoView with virtual keyboard animation */
    FOCUS_SCROLL_DELAY_MS: 320,

    /** Debounce delay before considering viewport changes as settled */
    VIEWPORT_SETTLE_DELAY_MS: 140,
  },
} as const;
