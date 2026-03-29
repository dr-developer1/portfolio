const AudioContextConstructor =
  typeof window !== 'undefined'
    ? window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    : null;

let ctx: AudioContext | null = null;
let lastKeyClickAt = 0;

const KEY_CLICK_THROTTLE_MS = 35;

function getCtx(): AudioContext | null {
  if (!AudioContextConstructor) return null;
  if (!ctx) ctx = new AudioContextConstructor();
  if (ctx.state === 'suspended') {
    void ctx.resume();
  }
  return ctx;
}

export function playKeyClick(): void {
  try {
    const now = performance.now();
    if (now - lastKeyClickAt < KEY_CLICK_THROTTLE_MS) {
      return;
    }
    lastKeyClickAt = now;

    const c = getCtx();
    if (!c) return;

    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);

    osc.frequency.setValueAtTime(1200, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, c.currentTime + 0.03);
    gain.gain.setValueAtTime(0.03, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.04);

    osc.start(c.currentTime);
    osc.stop(c.currentTime + 0.04);
  } catch {
    // Silently fail: audio feedback is non-critical.
  }
}

export function playCommandFire(): void {
  try {
    const c = getCtx();
    if (!c) return;

    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, c.currentTime + 0.1);
    gain.gain.setValueAtTime(0.05, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.12);

    osc.start(c.currentTime);
    osc.stop(c.currentTime + 0.12);
  } catch {
    // Silently fail: audio feedback is non-critical.
  }
}
