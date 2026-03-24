/**
 * useMatrixAnimation Hook
 *
 * Manages the Matrix rain canvas animation effect.
 * Handles canvas setup, animation loop, resize events, and theme color extraction.
 */

import { useLayoutEffect, useRef } from 'react';

import { UI_CONSTANTS } from '../config';
import { BP } from '../config/breakpoints';

// Default color (dark theme's --color-prompt-host) used as fallback
const DEFAULT_RAIN_COLOR = '#58a6ff';

export interface UseMatrixAnimationReturn {
  /** Ref to attach to the canvas element */
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

/**
 * Get theme color from CSS variables
 * @returns The color to use for matrix rain
 */
function getThemeColor(): string {
  const styles = getComputedStyle(document.documentElement);
  return (
    styles.getPropertyValue('--color-prompt-host').trim() ||
    styles.getPropertyValue('--color-accent-green').trim() ||
    DEFAULT_RAIN_COLOR
  );
}

/**
 * Custom hook for Matrix rain animation
 * @param enabled - Whether the animation is enabled
 * @param theme - Current theme name (to trigger color updates)
 * @returns Object containing canvasRef to attach to canvas element
 */
export function useMatrixAnimation(enabled: boolean, theme: string): UseMatrixAnimationReturn {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // useLayoutEffect runs synchronously after DOM mutations, before paint
  useLayoutEffect(() => {
    // If not enabled, don't run animation
    if (!enabled) return;

    // Respect user's reduced motion preference
    if (typeof window !== 'undefined' && 'matchMedia' in window) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mediaQuery.matches) {
        return;
      }
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Matrix characters
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
    const charArray = chars.split('');
    // Use smaller font on mobile for better density, standard size on desktop
    const isMobile = width <= BP.mobile;
    const fontSize = isMobile ? 14 : UI_CONSTANTS.MATRIX_FONT_SIZE;
    const columns = Math.ceil(width / fontSize);

    // Drops array - one per column
    // Initialize with random starts to avoid "curtain" effect
    const drops = Array(columns)
      .fill(0)
      .map(() => Math.floor(Math.random() * -100));

    // Use undefined to explicitly indicate no frame has been requested yet
    let animationId: number | undefined;

    // Resize handler — debounced to avoid thrashing canvas context on rapid resize
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        const newColumns = Math.ceil(width / fontSize);
        if (newColumns > drops.length) {
          for (let i = drops.length; i < newColumns; i++) {
            drops.push(Math.floor(Math.random() * -100));
          }
        }
      }, 100);
    };

    window.addEventListener('resize', handleResize);

    // Wait for next animation frame to ensure CSS is loaded
    const startFrameId = requestAnimationFrame(() => {
      const themeColor = getThemeColor();

      const draw = () => {
        // Semi-transparent black to create fade effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = themeColor;
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
          const text = charArray[Math.floor(Math.random() * charArray.length)];
          ctx.fillText(text, i * fontSize, drops[i] * fontSize);

          // Reset drop to top randomly
          if (drops[i] * fontSize > height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }

        animationId = requestAnimationFrame(draw);
      };

      draw();
    });

    return () => {
      clearTimeout(resizeTimer);
      if (startFrameId !== undefined) cancelAnimationFrame(startFrameId);
      if (animationId !== undefined) cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [enabled, theme]); // Re-run if enabled status or theme changes

  return { canvasRef };
}
