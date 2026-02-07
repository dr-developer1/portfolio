/**
 * DOM Manipulation Helper Utilities
 *
 * Utilities for measuring and manipulating DOM elements.
 */

/**
 * Calculate the cursor position in pixels for a given input element
 * @param input - The input element to measure
 * @param cursorPosition - The character position of the cursor
 * @returns The cursor position in pixels from the left edge
 */
export function getCursorPixelPosition(input: HTMLInputElement, cursorPosition: number): number {
  // Create a temporary span to measure text width up to cursor position
  const span = document.createElement('span');
  const computedStyle = window.getComputedStyle(input);

  // Copy font styles to ensure accurate measurement
  span.style.font = computedStyle.font;
  span.style.fontSize = computedStyle.fontSize;
  span.style.fontFamily = computedStyle.fontFamily;
  span.style.letterSpacing = computedStyle.letterSpacing;
  span.style.position = 'absolute';
  span.style.visibility = 'hidden';
  span.style.whiteSpace = 'pre';

  // Set text content to the substring up to cursor position
  span.textContent = input.value.substring(0, cursorPosition);

  document.body.appendChild(span);
  const width = span.offsetWidth;
  document.body.removeChild(span);

  return width;
}
