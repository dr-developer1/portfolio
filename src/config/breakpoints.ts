/**
 * Breakpoint constants — single source of truth for both CSS media queries
 * (referenced by documentation / tooling) and JS logic.
 *
 * Values are upper-bound inclusive (i.e. "mobile" means width <= 768px).
 */
export const BP = {
  tablet: 1024,
  mobile: 768,
  phone: 480,
  tiny: 360,
} as const;

export type Breakpoint = keyof typeof BP;
