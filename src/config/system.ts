import type { BootMode } from '../types/boot';

/**
 * System-wide configuration
 * Centralized definition of application metadata
 */
export const SYSTEM_CONFIG = {
  /** The hostname displayed in terminal prompts (user@hostname) */
  hostname: 'portfolio',

  /** Application name for window titles, etc. */
  appName: 'Portfolio Terminal',

  /** Default user mode on initial load */
  defaultMode: 'normal' as BootMode,

  /** Default username (fallback) */
  defaultUser: 'visitor',
} as const;
