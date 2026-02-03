import React, { useLayoutEffect, useRef } from 'react';
import { useTerminalContext } from '../../hooks/TerminalContext';

// Default color (dark theme's --color-prompt-host) used as fallback
const DEFAULT_RAIN_COLOR = '#58a6ff';

export const MatrixRain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { matrixEnabled, theme } = useTerminalContext();

  // useLayoutEffect runs synchronously after DOM mutations, before paint
  // This gives CSS more time to load compared to useEffect
  useLayoutEffect(() => {
    // If not enabled, don't run animation
    if (!matrixEnabled) return;

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
    const fontSize = 16;
    const columns = Math.ceil(width / fontSize);

    // Drops array - one per column
    // Initialize with random starts to avoid "curtain" effect
    const drops = Array(columns)
      .fill(0)
      .map(() => Math.floor(Math.random() * -100));

    // Use undefined to explicitly indicate no frame has been requested yet
    let animationId: number | undefined;

    // Get theme color from CSS variables
    // Uses requestAnimationFrame to ensure CSS is fully loaded and parsed
    const getThemeColor = (): string => {
      const styles = getComputedStyle(document.documentElement);
      return (
        styles.getPropertyValue('--color-prompt-host').trim() ||
        styles.getPropertyValue('--color-accent-green').trim() ||
        DEFAULT_RAIN_COLOR
      );
    };

    // Resize handler
    const handleResize = () => {
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
    };

    window.addEventListener('resize', handleResize);

    // Wait for next animation frame to ensure CSS is loaded
    // This is crucial for the initial render when CSS might still be loading
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
      if (startFrameId !== undefined) cancelAnimationFrame(startFrameId);
      if (animationId !== undefined) cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [matrixEnabled, theme]); // Re-run if enabled status or theme changes

  if (!matrixEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1, // Behind everything
        opacity: 0.8, // Slight transparency
        pointerEvents: 'none', // Don't block clicks
      }}
    />
  );
};
