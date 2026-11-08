import { useEffect, useRef } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import styles from './Snowfall.module.css';

export function Snowfall() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    let frame = 0;
    let previousTime = 0;
    let width = 0;
    let height = 0;
    const deposits = new Float32Array(65);
    const flakes = Array.from({ length: 300 }, (_, index) => {
      const depth = ((index % 3) + 1) / 3;
      return {
        x: Math.random(),
        y: Math.random(),
        radius: 0.65 + depth * 2.6 + Math.random() * 0.8,
        speed: 14 + depth * 36 + Math.random() * 14,
        opacity: 0.22 + depth * 0.5,
        drift: Math.random() * Math.PI * 2,
      };
    });

    const groundHeight = () => (width < 600 ? 22 : 32);
    const surface = (x: number) => {
      const bin = Math.min(64, Math.max(0, Math.round((x / width) * 64)));
      return (
        height -
        groundHeight() -
        Math.sin((x / width) * Math.PI * 5) * 3 -
        Math.sin((x / width) * Math.PI * 11 + 1) * 2 -
        deposits[bin]
      );
    };
    const drawGround = () => {
      // A blue shadow at the foot gives the drifts depth, with a fresh white crest.
      const gradient = context.createLinearGradient(0, height - 45, 0, height);
      gradient.addColorStop(0, '#fff9ec');
      gradient.addColorStop(0.45, '#e6f0ed');
      gradient.addColorStop(1, '#9cbab9');
      context.fillStyle = gradient;
      context.beginPath();
      context.moveTo(0, height);
      for (let x = 0; x <= width + 8; x += 8) context.lineTo(x, surface(x));
      context.lineTo(width, height);
      context.closePath();
      context.fill();
      context.strokeStyle = 'rgba(255, 255, 248, 0.8)';
      context.lineWidth = 2;
      context.beginPath();
      for (let x = 0; x <= width + 8; x += 8) {
        if (x === 0) context.moveTo(x, surface(x) + 1);
        else context.lineTo(x, surface(x) + 1);
      }
      context.stroke();
    };

    const draw = (time: number) => {
      const elapsed = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 0;
      previousTime = time;
      context.clearRect(0, 0, width, height);
      const visibleFlakes = width < 600 ? flakes.slice(0, 180) : flakes;
      for (const flake of visibleFlakes) {
        if (!reducedMotion) {
          flake.y += (flake.speed * elapsed) / height;
          flake.x =
            (flake.x + (Math.sin(time / 3000 + flake.drift) * elapsed * 12) / width + 1) % 1;
          if (flake.y * height >= surface(flake.x * width)) {
            const bin = Math.min(64, Math.floor(flake.x * 65));
            deposits[bin] = Math.min(12, deposits[bin] + flake.radius * 0.1);
            flake.y = -flake.radius / height;
          }
        }
        context.beginPath();
        context.fillStyle = `rgba(255, 248, 234, ${flake.opacity})`;
        context.arc(flake.x * width, flake.y * height, flake.radius, 0, Math.PI * 2);
        context.fill();
      }
      drawGround();
      if (!reducedMotion && !document.hidden) frame = requestAnimationFrame(draw);
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      if (reducedMotion) draw(0);
    };
    const resume = () => {
      cancelAnimationFrame(frame);
      previousTime = 0;
      if (!document.hidden) draw(0);
    };

    resize();
    resume();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', resume);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', resume);
    };
  }, [reducedMotion]);

  return (
    <canvas ref={canvasRef} className={styles.snow} aria-hidden="true" data-testid="snowfall" />
  );
}
