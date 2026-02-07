import type { BootMode } from '../types/boot';

/**
 * User profile configuration
 * Centralized definition of all user profiles in the system
 * This is the SINGLE SOURCE OF TRUTH for user data
 */
export interface UserProfile {
  username: string;
  symbol: string;
}

/**
 * All user profiles mapped by boot mode
 * When adding a new user, add it here ONCE and it will be available everywhere
 */
export const USER_PROFILES = {
  normal: { username: 'visitor', symbol: '$' },
  admin: { username: 'root', symbol: '#' },
  dev: { username: 'developer', symbol: '$' },
  matrix: { username: 'neo', symbol: '$' },
} as const satisfies Record<BootMode, UserProfile>;

/**
 * Get all usernames (for filesystem initialization, etc.)
 */
export function getAllUsernames(): string[] {
  return Object.values(USER_PROFILES).map((profile) => profile.username);
}

/**
 * Get user profile for a specific boot mode
 */
export function getUserProfile(mode: BootMode): UserProfile {
  return USER_PROFILES[mode];
}

/**
 * Get home path for a user
 */
export function getUserHomePath(username: string): string {
  return `/home/${username}`;
}
