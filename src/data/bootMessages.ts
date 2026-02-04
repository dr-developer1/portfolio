/**
 * Boot Messages Data
 *
 * Contains all boot messages for different boot modes and secret codes mapping.
 * Each boot mode provides a unique sequence of messages for the boot animation.
 */

import { version as reactVersion } from 'react';

import type { BootMessage, BootMode } from '../types/boot';

/**
 * Default delay between messages in milliseconds
 */
export const DEFAULT_MESSAGE_DELAY = 600;

/**
 * Delay before transitioning to terminal after boot completes
 */
export const BOOT_COMPLETE_DELAY = 2000;

/**
 * Probability of a random boot failure (0.0 to 1.0)
 * Set to ~8% chance for occasional failures without being annoying
 */
const FAILURE_PROBABILITY = 0.4;

/**
 * Get time-based greeting message
 */
function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 6) return 'Working late? Impressive dedication.';
  if (hour < 12) return 'Good morning! Coffee initialized.';
  if (hour < 18) return 'Good afternoon!';
  return 'Burning the midnight oil? Respect.';
}

/**
 * Boot messages for each mode
 */
export const BOOT_MESSAGES: Record<BootMode, BootMessage[]> = {
  normal: [
    { text: 'Initializing portfolio system...', delay: 800 },
    { text: 'Loading kernel modules...', status: 'ok', delay: 500 },
    { text: 'Mounting file systems...', status: 'ok', delay: 450 },
    { text: 'Starting network services...', status: 'ok', delay: 550 },
    { text: 'Loading user profile...', status: 'ok', delay: 400 },
    { text: 'Initializing audio system...', status: 'ok', delay: 500 },
    { text: 'Loading projects database...', status: 'ok', delay: 600 },
    { text: 'Starting terminal interface...', status: 'ok', delay: 500 },
    { text: '', delay: 300 },
    { text: `System boot complete. ${getTimeBasedGreeting()}`, delay: 1000 },
  ],

  admin: [
    { text: '⚠️  ADMIN MODE DETECTED', delay: 1000 },
    { text: 'Bypassing security protocols...', status: 'ok', delay: 600 },
    { text: 'Granting elevated privileges...', status: 'ok', delay: 550 },
    { text: 'Loading secret projects...', status: 'ok', delay: 500 },
    { text: 'Enabling developer mode...', status: 'ok', delay: 450 },
    { text: 'Unlocking hidden features...', status: 'ok', delay: 500 },
    { text: '', delay: 300 },
    { text: 'Welcome, Administrator. All access granted.', delay: 1000 },
  ],

  dev: [
    { text: '🔧 DEVELOPER MODE ACTIVATED', delay: 1000 },
    { text: 'Loading debug symbols...', status: 'ok', delay: 500 },
    { text: `React version: ${reactVersion}`, status: 'ok', delay: 450 },
    { text: `Build time: ${new Date().toISOString()}`, status: 'ok', delay: 500 },
    { text: 'Enabling verbose logging...', status: 'ok', delay: 450 },
    { text: 'Mounting development tools...', status: 'ok', delay: 550 },
    { text: '', delay: 300 },
    { text: 'Developer environment ready. Happy hacking!', delay: 1000 },
  ],

  matrix: [
    { text: 'Wake up, Neo...', delay: 1500 },
    { text: 'The Matrix has you...', delay: 1200 },
    { text: 'Follow the white rabbit.', delay: 1000 },
    { text: '', delay: 500 },
    { text: 'Knock, knock.', delay: 1500 },
    { text: '', delay: 400 },
    { text: 'Initializing reality distortion...', status: 'ok', delay: 600 },
    { text: 'Unplugging from the Matrix...', status: 'ok', delay: 700 },
    { text: '', delay: 300 },
    { text: 'Welcome to the real world.', delay: 1000 },
  ],
};

/**
 * Secret codes that trigger special boot modes
 * Keys are the typed sequences, values are the boot mode to activate
 */
export const SECRET_CODES: Record<string, BootMode> = {
  admin: 'admin',
  sudo: 'admin',
  root: 'admin',
  dev: 'dev',
  debug: 'dev',
  developer: 'dev',
  matrix: 'matrix',
  neo: 'matrix',
  rabbit: 'matrix',
};

/**
 * Get the delay for a specific message, falling back to default
 */
export function getMessageDelay(message: BootMessage): number {
  return message.delay ?? DEFAULT_MESSAGE_DELAY;
}

/**
 * Get messages for a specific boot mode with optional random failures
 * Failures only occur on messages with status: 'ok' (not first/last messages)
 * When a failure occurs, adds a retry sequence that eventually succeeds
 */
export function getBootMessages(mode: BootMode): BootMessage[] {
  const baseMessages = BOOT_MESSAGES[mode];

  // Matrix mode doesn't get failures (preserve the mystical vibe)
  if (mode === 'matrix') {
    return baseMessages;
  }

  // Find messages that can fail (have status: 'ok')
  const failableIndices: number[] = [];
  baseMessages.forEach((msg, index) => {
    if (msg.status === 'ok') {
      failableIndices.push(index);
    }
  });

  // No failable messages, return as-is
  if (failableIndices.length === 0) {
    return baseMessages;
  }

  // Determine if we should have a failure this boot
  if (Math.random() >= FAILURE_PROBABILITY) {
    return baseMessages; // No failure this time
  }

  // Pick a random message to fail (not the last failable one for better UX)
  const candidateIndices = failableIndices.slice(0, -1);
  if (candidateIndices.length === 0) {
    return baseMessages;
  }

  const failIndex = candidateIndices[Math.floor(Math.random() * candidateIndices.length)];
  const failingMessage = baseMessages[failIndex];

  // Build new message array with failure and retry sequence
  const result: BootMessage[] = [];

  for (let i = 0; i < baseMessages.length; i++) {
    if (i === failIndex) {
      // Add the failing message
      result.push({
        text: failingMessage.text,
        status: 'fail',
        delay: failingMessage.delay,
      });
      // Add retry message
      result.push({
        text: `Retrying: ${failingMessage.text.toLowerCase()}`,
        status: 'warn',
        delay: 400,
      });
      // Add success after retry
      result.push({
        text: failingMessage.text,
        status: 'ok',
        delay: 300,
      });
    } else {
      result.push(baseMessages[i]);
    }
  }

  return result;
}
