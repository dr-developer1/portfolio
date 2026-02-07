/**
 * useCursorPosition Hook
 *
 * Manages cursor position visualization in terminal input.
 * Updates cursor DOM element position based on text measurements.
 */

import { useEffect, useRef } from 'react';

import { getCursorPixelPosition } from '../utils/domHelpers';

export interface UseCursorPositionReturn {
  /** Ref to attach to the cursor element */
  cursorRef: React.RefObject<HTMLSpanElement | null>;
}

/**
 * Custom hook for managing cursor position in terminal input
 * @param input - The current input value
 * @param cursorPos - The character position of the cursor
 * @param inputRef - Reference to the input element
 * @returns Object containing cursorRef to attach to cursor element
 */
export function useCursorPosition(
  input: string,
  cursorPos: number,
  inputRef: React.RefObject<HTMLInputElement | null>
): UseCursorPositionReturn {
  const cursorRef = useRef<HTMLSpanElement>(null);

  // Update cursor position in DOM directly (following React pattern for updating external systems)
  useEffect(() => {
    if (!inputRef.current || !cursorRef.current) return;

    const width = getCursorPixelPosition(inputRef.current, cursorPos);

    // Update cursor position directly in DOM (no setState, no cascading renders)
    cursorRef.current.style.left = `${width}px`;
  }, [cursorPos, input, inputRef]);

  return { cursorRef };
}
