import React, { useEffect, useRef, useState } from 'react';

import styles from './Banner3D.module.css';

type Particle = {
  x: number;
  y: number;
  z: number;
  tx: number;
  ty: number;
  tz: number;
  phase: number;
};

const TEXT_LINES = ['AHMAD', 'IBRAHIM'];
const PARTICLE_LIMIT = 1200;
const SAMPLE_STEP = 4;

function createTargets(
  width: number,
  height: number,
  count: number
): Array<[number, number, number]> {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(320, Math.floor(width));
  canvas.height = Math.max(160, Math.floor(height));

  const context = canvas.getContext('2d');
  if (!context) {
    return [];
  }

  const fontSize = Math.floor(Math.min(canvas.width * 0.16, canvas.height * 0.34));
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#ffffff';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = `700 ${fontSize}px "JetBrains Mono Banner", "JetBrains Mono", monospace`;

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const lineGap = fontSize * 0.72;

  TEXT_LINES.forEach((line, index) => {
    const offset = (index - (TEXT_LINES.length - 1) / 2) * lineGap;
    context.fillText(line, centerX, centerY + offset);
  });

  const image = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const points: Array<[number, number, number]> = [];

  for (let y = 0; y < canvas.height; y += SAMPLE_STEP) {
    for (let x = 0; x < canvas.width; x += SAMPLE_STEP) {
      const alpha = image[(y * canvas.width + x) * 4 + 3];
      if (alpha > 20) {
        points.push([x - canvas.width / 2, y - canvas.height / 2, (Math.random() - 0.5) * 36]);
      }
    }
  }

  if (points.length <= count) {
    return points;
  }

  const stride = points.length / count;
  return Array.from(
    { length: count },
    (_, index) => points[Math.floor(index * stride)] ?? points[0]
  );
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

const Banner3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry?.isIntersecting ?? true);
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    const reduceMotion = prefersReducedMotion();
    let animationFrame = 0;
    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let startTime = performance.now();
    let lastWidth = 0;
    let lastHeight = 0;

    const render = (time: number) => {
      const elapsed = time - startTime;
      const rotation = reduceMotion ? 0 : Math.sin(elapsed * 0.00055) * 0.18;
      const hoverRadius = 48;
      const pointer = pointerRef.current;

      context.clearRect(0, 0, width, height);
      context.fillStyle = 'rgba(8, 12, 20, 0.18)';
      context.fillRect(0, 0, width, height);
      context.shadowBlur = 0;

      for (let index = 0; index < particles.length; index += 1) {
        const particle = particles[index];
        const delay = reduceMotion ? 1 : Math.min(1, elapsed / 1150 - index * 0.0016);
        const eased = delay <= 0 ? 0 : 1 - Math.pow(2, -10 * delay);

        const rotatedTargetX = particle.tx * Math.cos(rotation) + particle.tz * Math.sin(rotation);
        const rotatedTargetZ = particle.tz * Math.cos(rotation) - particle.tx * Math.sin(rotation);
        const breathingZ =
          rotatedTargetZ + (reduceMotion ? 0 : Math.sin(elapsed * 0.0012 + particle.phase) * 8);

        const targetX = particle.tx + (rotatedTargetX - particle.tx) * (reduceMotion ? 1 : 0.92);
        const targetY = particle.ty;
        const targetZ = particle.tz + (breathingZ - particle.tz) * (reduceMotion ? 1 : 0.9);

        const settleX = targetX * eased;
        const settleY = targetY * eased;
        const settleZ = targetZ * eased;

        particle.x += (settleX - particle.x) * (reduceMotion ? 0.26 : 0.08);
        particle.y += (settleY - particle.y) * (reduceMotion ? 0.26 : 0.08);
        particle.z += (settleZ - particle.z) * (reduceMotion ? 0.26 : 0.08);

        if (!reduceMotion && pointer) {
          const dx = particle.x - pointer.x;
          const dy = particle.y - pointer.y;
          const distance = Math.hypot(dx, dy);

          if (distance > 0 && distance < hoverRadius) {
            const force = ((hoverRadius - distance) / hoverRadius) * 1.9;
            particle.x += (dx / distance) * force * 3.4;
            particle.y += (dy / distance) * force * 3.4;
          }
        }

        const perspective = 320;
        const scale = perspective / (perspective + particle.z + 90);
        const screenX = width / 2 + particle.x * scale;
        const screenY = height / 2 + particle.y * scale;
        const radius = Math.max(0.8, scale * 1.8);

        context.beginPath();
        context.fillStyle = `rgba(88, 166, 255, ${0.48 + scale * 0.32})`;
        context.arc(screenX, screenY, radius, 0, Math.PI * 2);
        context.fill();
      }

      const glow = context.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        width * 0.42
      );
      glow.addColorStop(0, 'rgba(88, 166, 255, 0.08)');
      glow.addColorStop(0.55, 'rgba(88, 166, 255, 0.03)');
      glow.addColorStop(1, 'rgba(88, 166, 255, 0)');

      context.globalCompositeOperation = 'lighter';
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);
      context.globalCompositeOperation = 'source-over';

      if (!reduceMotion && isVisible) {
        animationFrame = window.requestAnimationFrame(render);
      }
    };

    const setup = () => {
      dpr = window.devicePixelRatio || 1;
      width = Math.max(320, Math.floor(container.clientWidth));
      height = Math.max(160, Math.floor(container.clientHeight));
      const needsRebuild = width !== lastWidth || height !== lastHeight;

      if (needsRebuild) {
        lastWidth = width;
        lastHeight = height;

        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);

        context.setTransform(dpr, 0, 0, dpr, 0, 0);

        const targets = createTargets(width, height, PARTICLE_LIMIT);
        particles = targets.map(([tx, ty, tz], index) => ({
          x: (Math.random() - 0.5) * width * 1.35,
          y: (Math.random() - 0.5) * height * 1.4,
          z: (Math.random() - 0.5) * 280,
          tx,
          ty,
          tz,
          phase: (index / Math.max(1, targets.length)) * Math.PI * 2,
        }));

        startTime = performance.now();
      }

      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(render);
    };

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            setup();
          })
        : null;

    resizeObserver?.observe(container);
    if (!resizeObserver) {
      window.addEventListener('resize', setup);
    }
    setup();

    return () => {
      resizeObserver?.disconnect();
      if (!resizeObserver) {
        window.removeEventListener('resize', setup);
      }
      window.cancelAnimationFrame(animationFrame);
    };
  }, [isVisible]);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    pointerRef.current = {
      x: event.clientX - rect.left - rect.width / 2,
      y: event.clientY - rect.top - rect.height / 2,
    };
  };

  return (
    <div
      ref={containerRef}
      className={styles.container}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        pointerRef.current = null;
      }}
    >
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <div className={styles.meta}>
        <span className={styles.label}>Interactive Terminal Portfolio</span>
        <span>Lyon, France</span>
      </div>
    </div>
  );
};

export default Banner3D;
