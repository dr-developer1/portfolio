import { describe, expect, it } from 'vitest';
import { createHatPhysics } from './hatPhysics';

const rest = [
  { x: 0.01658, y: 0.05766 },
  { x: 0.44031, y: 0.44567 },
  { x: 1.00915, y: 0.54223 },
  { x: 1.37254, y: 0.17761 },
  { x: 1.37852, y: -0.34437 },
  { x: 1.27074, y: -0.71918 },
];

describe('fixed-brim hat physics', () => {
  it('keeps both collar joints fixed and preserves fabric lengths while dragging', () => {
    const hat = createHatPhysics(rest);
    hat.dragTo({ x: 0.7, y: 0.9 }, 100);
    expect(hat.points.slice(0, 2)).toEqual(rest.slice(0, 2));
    for (let i = 1; i < rest.length; i++) {
      expect(
        Math.hypot(hat.points[i].x - hat.points[i - 1].x, hat.points[i].y - hat.points[i - 1].y)
      ).toBeCloseTo(Math.hypot(rest[i].x - rest[i - 1].x, rest[i].y - rest[i - 1].y), 6);
    }
    expect(hat.tip().y).toBeGreaterThan(rest[5].y + 0.5);
  });

  it('falls after being lifted and settles back into the hanging pose', () => {
    const hat = createHatPhysics(rest);
    hat.dragTo({ x: 1.2, y: 0.4 }, 100);
    const lifted = hat.tip().y;
    for (let i = 0; i < 30; i++) hat.step(1 / 120);
    expect(hat.tip().y).toBeLessThan(lifted);
    for (let i = 0; i < 1200; i++) hat.step(1 / 120);
    expect(hat.tip()).toEqual(rest[5]);
    expect(hat.points.slice(0, 2)).toEqual(rest.slice(0, 2));
  });

  it('stays stable across low frame rates and unreachable pointer targets', () => {
    const hat = createHatPhysics(rest);
    hat.dragTo({ x: 100, y: 100 }, 100);
    hat.flick();
    for (let i = 0; i < 200; i++) hat.step(0.1);
    expect(hat.tip()).toEqual(rest[5]);
    expect(hat.points.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y))).toBe(true);
  });

  it('can reset immediately when motion is reduced or interaction is cancelled', () => {
    const hat = createHatPhysics(rest);
    hat.flick();
    hat.step(0.1);
    hat.reset();
    expect(hat.points).toEqual(rest);
    expect(hat.step(1 / 60)).toBe(false);
  });
});
