/**
 * useSecretCode Hook
 *
 * Detects secret key sequences typed by the user on the boot screen using keydown events.
 * When a known secret code is detected, it returns the corresponding boot mode.
 * Secret codes are checked from longest to shortest to avoid prefix collisions.
 *
 * @example
 * const { detectedMode, typedText, reset } = useSecretCode();
 * // User types "admin" → detectedMode becomes 'admin', typedText shows "admin"
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { SECRET_CODES } from '../data/bootMessages';
import type { BootMode, UseSecretCodeReturn } from '../types/boot';

/**
 * Maximum length of the input buffer
 * Keeps memory usage constant and ensures old keys are discarded
 */
const BUFFER_MAX_LENGTH = 20;

/**
 * Time in ms after which the buffer resets if no key is pressed
 */
const BUFFER_TIMEOUT = 2000;

/**
 * Hook to detect secret codes typed by the user
 *
 * @returns Object with detectedMode, typedText (visible buffer), and reset function
 */
export function useSecretCode(): UseSecretCodeReturn {
  const [detectedMode, setDetectedMode] = useState<BootMode | null>(null);
  const [typedText, setTypedText] = useState<string>('');
  const bufferRef = useRef<string>('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  /**
   * Reset the input buffer and detection state
   */
  const reset = useCallback(() => {
    bufferRef.current = '';
    setTypedText('');
    setDetectedMode(null);
    if (timeoutRef.current !== undefined) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  /**
   * Check if current buffer ends with any secret code
   * Checks longer codes first to avoid prefix collisions
   */
  const checkForSecretCode = useCallback((buffer: string): BootMode | null => {
    const lowerBuffer = buffer.toLowerCase();

    // Sort codes by length descending to check longer codes first
    // This prevents "dev" from matching before "developer" or "debug"
    const sortedCodes = Object.entries(SECRET_CODES).sort((a, b) => b[0].length - a[0].length);

    for (const [code, mode] of sortedCodes) {
      if (lowerBuffer.endsWith(code)) {
        return mode;
      }
    }

    return null;
  }, []);

  /**
   * Handle keydown events to detect secret codes
   * Filters for printable ASCII characters without modifier keys
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Only track printable ASCII characters without modifiers
      // Using ASCII range \x20-\x7E (space through tilde) to exclude dead keys and composed characters
      const isPrintableASCII = /^[\x20-\x7E]$/.test(event.key);
      if (!isPrintableASCII || event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      // Reset timeout on each keypress
      if (timeoutRef.current !== undefined) {
        clearTimeout(timeoutRef.current);
      }

      // Add key to buffer, keeping it bounded
      bufferRef.current = (bufferRef.current + event.key).slice(-BUFFER_MAX_LENGTH);
      setTypedText(bufferRef.current);

      // Check for secret codes
      const mode = checkForSecretCode(bufferRef.current);
      if (mode !== null) {
        setDetectedMode(mode);
        // Don't reset buffer immediately - let the consumer handle it
      }

      // Set timeout to reset buffer after inactivity
      timeoutRef.current = setTimeout(() => {
        bufferRef.current = '';
        setTypedText('');
      }, BUFFER_TIMEOUT);
    },
    [checkForSecretCode]
  );

  // Set up and clean up event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current !== undefined) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleKeyDown]);

  return { detectedMode, typedText, reset };
}
