/**
 * Generate a unique ID for terminal lines
 */
export function generateLineId(): string {
  return `line-${globalThis.crypto.randomUUID()}`;
}
