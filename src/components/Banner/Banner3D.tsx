import React, { useEffect, useRef, useState } from 'react';

import styles from './Banner3D.module.css';

type Point = { x: number; y: number };
type Stroke = Point[];
type LetterSpec = Stroke[];

const LETTER_SPECS: Record<string, LetterSpec> = {
  A: [
    [
      { x: 0.08, y: 1 },
      { x: 0.5, y: 0 },
      { x: 0.92, y: 1 },
    ],
    [
      { x: 0.24, y: 0.58 },
      { x: 0.76, y: 0.58 },
    ],
  ],
  B: [
    [
      { x: 0.14, y: 0 },
      { x: 0.14, y: 1 },
    ],
    [
      { x: 0.14, y: 0 },
      { x: 0.7, y: 0 },
      { x: 0.84, y: 0.14 },
      { x: 0.84, y: 0.38 },
      { x: 0.7, y: 0.5 },
      { x: 0.14, y: 0.5 },
    ],
    [
      { x: 0.14, y: 0.5 },
      { x: 0.72, y: 0.5 },
      { x: 0.88, y: 0.64 },
      { x: 0.88, y: 0.88 },
      { x: 0.72, y: 1 },
      { x: 0.14, y: 1 },
    ],
  ],
  D: [
    [
      { x: 0.14, y: 0 },
      { x: 0.14, y: 1 },
    ],
    [
      { x: 0.14, y: 0 },
      { x: 0.62, y: 0 },
      { x: 0.9, y: 0.24 },
      { x: 0.9, y: 0.76 },
      { x: 0.62, y: 1 },
      { x: 0.14, y: 1 },
    ],
  ],
  H: [
    [
      { x: 0.14, y: 0 },
      { x: 0.14, y: 1 },
    ],
    [
      { x: 0.86, y: 0 },
      { x: 0.86, y: 1 },
    ],
    [
      { x: 0.14, y: 0.54 },
      { x: 0.86, y: 0.54 },
    ],
  ],
  I: [
    [
      { x: 0.18, y: 0 },
      { x: 0.82, y: 0 },
    ],
    [
      { x: 0.5, y: 0 },
      { x: 0.5, y: 1 },
    ],
    [
      { x: 0.18, y: 1 },
      { x: 0.82, y: 1 },
    ],
  ],
  M: [
    [
      { x: 0.1, y: 1 },
      { x: 0.1, y: 0 },
      { x: 0.5, y: 0.44 },
      { x: 0.9, y: 0 },
      { x: 0.9, y: 1 },
    ],
  ],
  R: [
    [
      { x: 0.14, y: 1 },
      { x: 0.14, y: 0 },
    ],
    [
      { x: 0.14, y: 0 },
      { x: 0.72, y: 0 },
      { x: 0.86, y: 0.14 },
      { x: 0.86, y: 0.38 },
      { x: 0.72, y: 0.52 },
      { x: 0.14, y: 0.52 },
    ],
    [
      { x: 0.44, y: 0.52 },
      { x: 0.9, y: 1 },
    ],
  ],
};

const TEXT_LINES = ['AHMAD', 'IBRAHIM'];
const LETTER_GAP = 0.24;
const WORD_GAP = 0.7;
const LINE_GAP = 0.48;
const TRACE_SPEED = 210;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function sampleStroke(stroke: Stroke, density: number): Point[] {
  const points: Point[] = [];

  for (let index = 1; index < stroke.length; index += 1) {
    const from = stroke[index - 1];
    const to = stroke[index];
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const steps = Math.max(4, Math.ceil(Math.hypot(dx, dy) * density));

    for (let step = 0; step < steps; step += 1) {
      const t = step / steps;
      points.push({
        x: from.x + dx * t,
        y: from.y + dy * t,
      });
    }
  }

  points.push(stroke[stroke.length - 1]);
  return points;
}

function buildTrace(width: number, height: number): Point[] {
  const maxLetters = Math.max(...TEXT_LINES.map((line) => line.length));
  const cellWidth = width / (maxLetters + LETTER_GAP * (maxLetters - 1) + 1.2);
  const cellHeight = Math.min(height * 0.34, cellWidth * 1.7);
  const totalTextHeight = cellHeight * TEXT_LINES.length + cellHeight * LINE_GAP;
  const startY = (height - totalTextHeight) / 2;
  const sampled: Point[] = [];

  TEXT_LINES.forEach((line, lineIndex) => {
    const lineWidth =
      line.length * cellWidth +
      (line.length - 1) * cellWidth * LETTER_GAP +
      (line.includes(' ') ? WORD_GAP * cellWidth : 0);
    let cursorX = (width - lineWidth) / 2;
    const baseY = startY + lineIndex * cellHeight * (1 + LINE_GAP);

    for (const char of line) {
      if (char === ' ') {
        cursorX += cellWidth * WORD_GAP;
        continue;
      }

      const spec = LETTER_SPECS[char];
      if (!spec) {
        cursorX += cellWidth * (1 + LETTER_GAP);
        continue;
      }

      spec.forEach((stroke) => {
        const density = Math.max(18, cellWidth * 0.24);
        const sampledStroke = sampleStroke(stroke, density).map((point) => ({
          x: cursorX + point.x * cellWidth,
          y: baseY + point.y * cellHeight,
        }));

        if (sampled.length > 0 && sampledStroke.length > 0) {
          sampled.push(sampled[sampled.length - 1]);
          sampled.push(sampledStroke[0]);
        }

        sampled.push(...sampledStroke);
      });

      cursorX += cellWidth * (1 + LETTER_GAP);
    }
  });

  return sampled;
}

function drawGrid(context: CanvasRenderingContext2D, width: number, height: number) {
  context.save();
  context.strokeStyle = 'rgba(0, 255, 65, 0.06)';
  context.lineWidth = 1;

  for (let x = 0; x <= width; x += 24) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }

  for (let y = 0; y <= height; y += 24) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }

  context.restore();
}

function drawStaticTrace(
  context: CanvasRenderingContext2D,
  points: Point[],
  lineWidth: number
) {
  if (points.length < 2) {
    return;
  }

  context.save();
  context.strokeStyle = 'rgba(0, 255, 65, 0.86)';
  context.lineWidth = lineWidth;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.shadowColor = 'rgba(0, 255, 65, 0.45)';
  context.shadowBlur = 10;
  context.beginPath();
  context.moveTo(points[0].x, points[0].y);

  for (let index = 1; index < points.length; index += 1) {
    context.lineTo(points[index].x, points[index].y);
  }

  context.stroke();
  context.restore();
}

const Banner3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

    const trailCanvas = document.createElement('canvas');
    const trailContext = trailCanvas.getContext('2d');
    if (!trailContext) {
      return;
    }

    const reduceMotion = prefersReducedMotion();
    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let tracePoints: Point[] = [];
    let beamProgress = 0;
    let lastFrameTime = performance.now();
    let lastWidth = 0;
    let lastHeight = 0;

    const drawFrame = () => {
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const background = context.createRadialGradient(
        width * 0.5,
        height * 0.46,
        0,
        width * 0.5,
        height * 0.46,
        width * 0.7
      );
      background.addColorStop(0, 'rgba(10, 28, 16, 0.9)');
      background.addColorStop(0.65, 'rgba(4, 13, 10, 0.96)');
      background.addColorStop(1, 'rgba(1, 4, 6, 1)');

      context.fillStyle = background;
      context.fillRect(0, 0, width, height);
      drawGrid(context, width, height);

      context.save();
      context.globalCompositeOperation = 'screen';
      context.drawImage(trailCanvas, 0, 0, width, height);
      context.restore();

      const beam = tracePoints[Math.floor(beamProgress) % Math.max(1, tracePoints.length)];
      if (beam) {
        context.save();
        context.fillStyle = '#d3ffe2';
        context.shadowColor = 'rgba(0, 255, 65, 0.9)';
        context.shadowBlur = 16;
        context.beginPath();
        context.arc(beam.x, beam.y, Math.max(2.1, width * 0.0038), 0, Math.PI * 2);
        context.fill();
        context.restore();
      }

      const vignette = context.createRadialGradient(
        width / 2,
        height / 2,
        width * 0.18,
        width / 2,
        height / 2,
        width * 0.72
      );
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.28)');
      context.fillStyle = vignette;
      context.fillRect(0, 0, width, height);
    };

    const tick = (time: number) => {
      const deltaSeconds = Math.min(0.05, (time - lastFrameTime) / 1000);
      lastFrameTime = time;

      trailContext.setTransform(dpr, 0, 0, dpr, 0, 0);

      trailContext.save();
      trailContext.globalCompositeOperation = 'source-over';
      trailContext.fillStyle = 'rgba(0, 0, 0, 0.1)';
      trailContext.fillRect(0, 0, width, height);
      trailContext.restore();

      if (tracePoints.length >= 2) {
        const previous = tracePoints[Math.floor(beamProgress) % tracePoints.length];
        beamProgress = (beamProgress + TRACE_SPEED * deltaSeconds) % tracePoints.length;
        const current = tracePoints[Math.floor(beamProgress) % tracePoints.length];

        if (previous && current) {
          trailContext.save();
          trailContext.strokeStyle = 'rgba(0, 255, 65, 0.9)';
          trailContext.lineWidth = Math.max(1.5, width * 0.0025);
          trailContext.lineCap = 'round';
          trailContext.lineJoin = 'round';
          trailContext.shadowColor = 'rgba(0, 255, 65, 0.5)';
          trailContext.shadowBlur = 10;
          trailContext.beginPath();
          trailContext.moveTo(previous.x, previous.y);
          trailContext.lineTo(current.x, current.y);
          trailContext.stroke();
          trailContext.restore();
        }
      }

      drawFrame();

      if (isVisible && !reduceMotion) {
        animationFrame = window.requestAnimationFrame(tick);
      }
    };

    const rebuild = () => {
      dpr = window.devicePixelRatio || 1;
      width = Math.max(320, Math.floor(container.clientWidth));
      height = Math.max(160, Math.floor(container.clientHeight));

      if (width === lastWidth && height === lastHeight && tracePoints.length > 0) {
        return false;
      }

      lastWidth = width;
      lastHeight = height;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      trailCanvas.width = Math.floor(width * dpr);
      trailCanvas.height = Math.floor(height * dpr);

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      trailContext.setTransform(dpr, 0, 0, dpr, 0, 0);

      tracePoints = buildTrace(width, height);
      beamProgress = 0;
      lastFrameTime = performance.now();

      trailContext.setTransform(1, 0, 0, 1, 0, 0);
      trailContext.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
      trailContext.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduceMotion) {
        drawStaticTrace(trailContext, tracePoints, Math.max(1.7, width * 0.0027));
      }

      return true;
    };

    const setup = () => {
      rebuild();
      window.cancelAnimationFrame(animationFrame);

      if (reduceMotion || !isVisible) {
        drawFrame();
        return;
      }

      animationFrame = window.requestAnimationFrame(tick);
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

  return (
    <div ref={containerRef} className={styles.container}>
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <div className={styles.meta}>
        <span className={styles.label}>Oscilloscope Name Trace</span>
        <span>Phosphor Beam Loop</span>
      </div>
    </div>
  );
};

export default Banner3D;
