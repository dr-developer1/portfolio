export interface HatPoint {
  x: number;
  y: number;
}

const GRAVITY = 8;
const STIFFNESS = [0, 0, 52, 36, 22, 12];
const DAMPING = [0, 0, 9, 8, 6, 5];
const difference = (a: number, b: number) => Math.atan2(Math.sin(a - b), Math.cos(a - b));

/** A fixed collar followed by four weighted fabric sections with torsional stiffness. */
export function createHatPhysics(rest: HatPoint[]) {
  if (rest.length !== 6) throw new Error('The Santa hat requires six rig joints');
  const lengths = rest.map((p, i) =>
    i ? Math.hypot(p.x - rest[i - 1].x, p.y - rest[i - 1].y) : 0
  );
  const home = rest.map((p, i) => (i ? Math.atan2(p.y - rest[i - 1].y, p.x - rest[i - 1].x) : 0));
  const angles = [...home];
  const velocities = rest.map(() => 0);
  const points = rest.map((p) => ({ ...p }));
  let previousDragTime = 0;

  const pose = () => {
    for (let i = 2; i < points.length; i++) {
      points[i].x = points[i - 1].x + Math.cos(angles[i]) * lengths[i];
      points[i].y = points[i - 1].y + Math.sin(angles[i]) * lengths[i];
    }
  };
  const reset = () => {
    for (let i = 0; i < rest.length; i++) {
      angles[i] = home[i];
      velocities[i] = 0;
      points[i] = { ...rest[i] };
    }
    previousDragTime = 0;
  };

  return {
    points,
    reset,
    tip: () => points[points.length - 1],
    beginDrag() {
      previousDragTime = 0;
      velocities.fill(0);
    },
    release(time: number) {
      if (time - previousDragTime > 100) velocities.fill(0);
      previousDragTime = 0;
    },
    dragTo(target: HatPoint, time: number) {
      const before = [...angles];
      // CCD keeps each cloth section's length, even when the pointer pulls beyond reach.
      for (let iteration = 0; iteration < 14; iteration++) {
        for (let i = points.length - 1; i >= 2; i--) {
          const pivot = points[i - 1];
          const tip = points[points.length - 1];
          const turn = difference(
            Math.atan2(target.y - pivot.y, target.x - pivot.x),
            Math.atan2(tip.y - pivot.y, tip.x - pivot.x)
          );
          for (let j = i; j < angles.length; j++) {
            const candidate = angles[j] + turn;
            angles[j] = home[j] + Math.max(-1.45, Math.min(1.45, difference(candidate, home[j])));
          }
          pose();
        }
      }
      const dt = previousDragTime ? Math.max(1 / 120, (time - previousDragTime) / 1000) : 0;
      for (let i = 2; i < angles.length; i++) {
        velocities[i] = dt ? Math.max(-5, Math.min(5, difference(angles[i], before[i]) / dt)) : 0;
      }
      previousDragTime = time;
    },
    flick() {
      velocities[3] = 1.5;
      velocities[4] = 3;
      velocities[5] = 4;
    },
    step(elapsed: number): boolean {
      // Catch up after slow rendered frames while retaining stable integration substeps.
      const duration = Math.max(0, Math.min(elapsed, 1));
      const steps = Math.max(1, Math.ceil(duration * 180));
      const dt = duration / steps;
      for (let step = 0; step < steps; step++) {
        for (let i = 2; i < angles.length; i++) {
          const displacement = difference(angles[i], home[i]);
          // Gravity varies with angle. Preload the fabric stiffness so its resting shape hangs naturally.
          const gravity = GRAVITY / lengths[i];
          const acceleration =
            -STIFFNESS[i] * displacement -
            gravity * (Math.cos(angles[i]) - Math.cos(home[i])) -
            DAMPING[i] * velocities[i];
          velocities[i] += acceleration * dt;
          angles[i] += velocities[i] * dt;
        }
      }
      pose();
      const active = angles.some(
        (angle, i) =>
          i >= 2 && Math.abs(difference(angle, home[i])) + Math.abs(velocities[i]) > 0.002
      );
      if (!active) reset();
      return active;
    },
  };
}

export type HatPhysics = ReturnType<typeof createHatPhysics>;
