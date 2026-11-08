import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { text, useLocale } from '../../i18n/locale';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { resolveSitePath } from '../../utils/sitePaths';
import { createHatRenderer, projectHatPoint, unprojectHatPoint } from './hatRenderer';
import type { HatRenderer } from './hatRenderer';
import { createHatPhysics } from './hatPhysics';
import type { HatPhysics } from './hatPhysics';
import styles from './SantaHat.module.css';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function SantaHat({ className }: { className: string }) {
  const locale = useLocale();
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rendererRef = useRef<HatRenderer | null>(null);
  const physicsRef = useRef<HatPhysics | null>(null);
  const frameRef = useRef(0);
  const drag = useRef<{
    id: number;
    x: number;
    y: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [ready, setReady] = useState(false);

  const draw = useCallback(() => {
    const physics = physicsRef.current;
    const canvas = canvasRef.current;
    if (!physics || !canvas) return;
    rendererRef.current?.draw(physics.points);
    const tip = projectHatPoint(physics.tip(), canvas.clientWidth, canvas.clientHeight);
    if (buttonRef.current)
      buttonRef.current.style.transform = `translate(${tip.x - 22}px, ${tip.y - 22}px)`;
  }, []);

  const reset = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    drag.current = null;
    physicsRef.current?.reset();
    draw();
    if (wrapperRef.current) wrapperRef.current.dataset.motion = 'resting';
  }, [draw]);

  const settle = () => {
    cancelAnimationFrame(frameRef.current);
    if (reducedMotion) {
      reset();
      return;
    }
    if (wrapperRef.current) wrapperRef.current.dataset.motion = 'settling';
    let previous = 0;
    const step = (time: number) => {
      const elapsed = previous ? (time - previous) / 1000 : 1 / 60;
      previous = time;
      const active = physicsRef.current?.step(elapsed);
      draw();
      if (active) frameRef.current = requestAnimationFrame(step);
      else if (wrapperRef.current) wrapperRef.current.dataset.motion = 'resting';
    };
    frameRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    const abort = new AbortController();
    let renderer: HatRenderer | null = null;
    let disposed = false;
    const load = async () => {
      try {
        const response = await fetch(resolveSitePath('/models/santa-hat.bin'), {
          signal: abort.signal,
        });
        if (!response.ok || response.headers.get('content-type')?.includes('text/html'))
          throw new Error('Santa hat model unavailable');
        const data = await response.arrayBuffer();
        if (disposed || !canvasRef.current) return;
        renderer = createHatRenderer(canvasRef.current, data);
        rendererRef.current = renderer;
        if (renderer) physicsRef.current = createHatPhysics(renderer.rest);
        draw();
        setReady(renderer !== null);
      } catch (error) {
        if (!disposed && import.meta.env.DEV)
          console.warn('Using the illustrated Santa hat.', error);
      }
    };
    void load();
    const contextLost = () => {
      reset();
      setReady(false);
    };
    const canvas = canvasRef.current;
    const resizeObserver = new ResizeObserver(reset);
    if (canvas) resizeObserver.observe(canvas);
    document.addEventListener('visibilitychange', reset);
    canvas?.addEventListener('webglcontextlost', contextLost);
    return () => {
      disposed = true;
      abort.abort();
      cancelAnimationFrame(frameRef.current);
      renderer?.dispose();
      rendererRef.current = null;
      physicsRef.current = null;
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', reset);
      canvas?.removeEventListener('webglcontextlost', contextLost);
    };
  }, [draw, reset]);

  useEffect(() => {
    draw();
  }, [ready, draw]);
  useEffect(() => {
    if (reducedMotion) reset();
  }, [reducedMotion, reset]);

  const release = (event: PointerEvent<HTMLButtonElement>) => {
    const pointer = drag.current;
    if (!pointer || pointer.id !== event.pointerId) return;
    physicsRef.current?.release(performance.now());
    if (
      event.type === 'pointerup' &&
      !reducedMotion &&
      Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) < 4
    )
      physicsRef.current?.flick();
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    settle();
  };

  return (
    <div
      ref={wrapperRef}
      className={`${className} ${styles.hat}`}
      data-testid="santa-hat"
      data-motion="resting"
      data-renderer={ready ? 'webgl' : 'illustration'}
    >
      {!ready && (
        <svg className={styles.fallback} viewBox="0 0 160 140" aria-hidden="true">
          <g transform="translate(145 -12) rotate(28) scale(-0.75 0.75)">
            <defs>
              <linearGradient id="hat-red">
                <stop stopColor="#ff5c6a" />
                <stop offset="1" stopColor="#a51135" />
              </linearGradient>
            </defs>
            <path
              d="M29 115C39 65 43 20 85 18C119 17 132 44 134 61L115 66C115 50 104 39 92 43C103 66 119 92 129 116Z"
              fill="url(#hat-red)"
            />
            <path d="M25 112Q76 102 131 112L132 130Q78 120 24 130Z" fill="#fff1da" />
            <circle cx="125" cy="66" r="15" fill="#fff1da" />
            <path
              d="M39 105Q82 97 118 106"
              stroke="#efbd58"
              strokeWidth="3"
              strokeDasharray="2 5"
            />
          </g>
        </svg>
      )}
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      {ready && (
        <button
          ref={buttonRef}
          type="button"
          className={styles.tip}
          aria-label={text('Play with Santa hat', 'Jouer avec le bonnet de Noël', locale)}
          title={text(
            'Lift the pom-pom and let it fall, or press Enter',
            'Soulevez le pompon et relâchez-le, ou appuyez sur Entrée',
            locale
          )}
          onPointerDown={(event) => {
            if (!event.isPrimary || event.button !== 0) return;
            cancelAnimationFrame(frameRef.current);
            const box = event.currentTarget.getBoundingClientRect();
            event.currentTarget.setPointerCapture(event.pointerId);
            physicsRef.current?.beginDrag();
            drag.current = {
              id: event.pointerId,
              x: event.clientX,
              y: event.clientY,
              offsetX: event.clientX - box.x - 22,
              offsetY: event.clientY - box.y - 22,
            };
            if (wrapperRef.current) wrapperRef.current.dataset.motion = 'dragging';
          }}
          onPointerMove={(event) => {
            const pointer = drag.current;
            const canvas = canvasRef.current;
            if (!pointer || pointer.id !== event.pointerId || !canvas) return;
            const box = canvas.getBoundingClientRect();
            const target = unprojectHatPoint(
              {
                x: clamp(event.clientX - box.x - pointer.offsetX, 24, canvas.clientWidth - 24),
                y: clamp(event.clientY - box.y - pointer.offsetY, 24, canvas.clientHeight - 24),
              },
              canvas.clientWidth,
              canvas.clientHeight
            );
            physicsRef.current?.dragTo(target, performance.now());
            draw();
          }}
          onPointerUp={release}
          onPointerCancel={release}
          onLostPointerCapture={release}
          onKeyDown={(event) => {
            if (event.key === 'Escape') reset();
          }}
          onClick={(event) => {
            if (event.detail === 0 && !reducedMotion) {
              physicsRef.current?.flick();
              settle();
            }
          }}
        />
      )}
    </div>
  );
}
