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
import { UI_CONSTANTS } from '../config';

/**
 * Time in ms after which the buffer resets if no key is pressed
 */
const BUFFER_TIMEOUT = 2000;

/**
 * Pre-sorted secret codes by length (descending) to check longer codes first
 * This prevents prefix collisions (e.g., "dev" matching before "developer")
 * Computed once at module load for performance
 */
const SORTED_SECRET_CODES = Object.entries(SECRET_CODES).sort((a, b) => b[0].length - a[0].length);

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
   * Uses pre-sorted codes (longest first) to avoid prefix collisions
   */
  const checkForSecretCode = useCallback((buffer: string): BootMode | null => {
    const lowerBuffer = buffer.toLowerCase();

    // Use pre-sorted codes (computed once at module level)
    for (const [code, mode] of SORTED_SECRET_CODES) {
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
      // Handle Backspace to allow deleting characters
      if (event.key === 'Backspace') {
        // Reset timeout on backspace
        if (timeoutRef.current !== undefined) {
          clearTimeout(timeoutRef.current);
        }

        // Remove last character from buffer
        bufferRef.current = bufferRef.current.slice(0, -1);
        setTypedText(bufferRef.current);

        // Clear detected mode if buffer changes
        if (detectedMode !== null) {
          setDetectedMode(null);
        }

        // Set timeout to reset buffer after inactivity
        if (bufferRef.current.length > 0) {
          timeoutRef.current = setTimeout(() => {
            bufferRef.current = '';
            setTypedText('');
            setDetectedMode(null);
          }, BUFFER_TIMEOUT);
        }

        return;
      }

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
      bufferRef.current = (bufferRef.current + event.key).slice(
        -UI_CONSTANTS.SECRET_CODE_BUFFER_LENGTH
      );
      setTypedText(bufferRef.current);

      // Check for secret codes
      const mode = checkForSecretCode(bufferRef.current);
      if (mode !== null) {
        setDetectedMode(mode);
        // Don't reset buffer immediately - let the consumer handle it
      }

      // Set timeout to reset buffer after inactivity
      timeoutRef.current = setTimeout(() => {
        bufferRef.current = ''; // Clear the actual buffer ref
        setTypedText(''); // Clear the visual display
        setDetectedMode(null); // Clear the detected mode state
      }, BUFFER_TIMEOUT);
    },
    [checkForSecretCode, detectedMode]
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
