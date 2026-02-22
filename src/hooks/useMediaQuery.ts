import { useState, useEffect } from 'react';

/**
 * Subscribes to a CSS media query string and returns whether it currently matches.
 * Avoids SSR issues by defaulting to false until mounted.
 *
 * @example
 *   const isMobile = useMediaQuery('(width <= 768px)');
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

    // Modern API
    mql.addEventListener('change', handler);

    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}
