import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BackgroundMusic } from './BackgroundMusic';

const context = vi.hoisted(() => ({
  musicEnabled: false,
  hasUserInteracted: true,
  christmasActive: true,
}));
vi.mock('../../hooks/TerminalContext', () => ({ useTerminalContext: () => context }));

class FakeAudio extends EventTarget {
  src = '';
  preload = '';
  volume = 1;
  loop = false;
  play = vi.fn().mockResolvedValue(undefined);
  pause = vi.fn();
  load = vi.fn();
  removeAttribute = vi.fn();
}

let root: Root;
let element: HTMLDivElement;
let audio: FakeAudio;
let fetchMock: ReturnType<typeof vi.fn>;

async function render() {
  await act(async () => root.render(<BackgroundMusic />));
}

beforeEach(() => {
  context.musicEnabled = false;
  context.hasUserInteracted = true;
  context.christmasActive = true;
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal(
    'Audio',
    vi.fn(function () {
      const instance = new FakeAudio();
      audio = instance;
      return instance;
    })
  );
  fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    headers: new Headers({ 'content-type': 'audio/mpeg' }),
  });
  vi.stubGlobal('fetch', fetchMock);
  element = document.createElement('div');
  document.body.append(element);
  root = createRoot(element);
});

afterEach(async () => {
  await act(async () => root.unmount());
  element.remove();
  vi.unstubAllGlobals();
});

describe('seasonal music', () => {
  it('fetches nothing until music is enabled and the user has interacted', async () => {
    await render();
    expect(fetchMock).not.toHaveBeenCalled();
    context.musicEnabled = true;
    context.hasUserInteracted = false;
    await render();
    expect(fetchMock).not.toHaveBeenCalled();
    context.hasUserInteracted = true;
    await render();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(audio.play).toHaveBeenCalledOnce();
  });

  it('alternates both tracks, loops, and preserves the current track when muted', async () => {
    context.musicEnabled = true;
    await render();
    expect(audio.src).toContain('let-it-snow.mp3');
    await act(async () => audio.dispatchEvent(new Event('ended')));
    expect(audio.src).toContain('all-i-want-for-christmas-is-you.mp3');
    context.musicEnabled = false;
    await render();
    expect(audio.pause).toHaveBeenCalled();
    context.musicEnabled = true;
    await render();
    expect(audio.src).toContain('all-i-want-for-christmas-is-you.mp3');
    await act(async () => audio.dispatchEvent(new Event('ended')));
    expect(audio.src).toContain('let-it-snow.mp3');
  });

  it('stays silent when the static host returns HTML instead of missing MP3s', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'text/html' }),
    });
    context.musicEnabled = true;
    await render();
    expect(audio.play).not.toHaveBeenCalled();
    expect(audio.src).toBe('');
  });

  it('plays the available song when the other file is absent', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, headers: new Headers() });
    context.musicEnabled = true;
    await render();
    expect(audio.src).toContain('all-i-want-for-christmas-is-you.mp3');
    await act(async () => audio.dispatchEvent(new Event('ended')));
    expect(audio.src).toContain('all-i-want-for-christmas-is-you.mp3');
  });

  it('skips corrupt audio without retrying forever', async () => {
    context.musicEnabled = true;
    await render();
    await act(async () => audio.dispatchEvent(new Event('error')));
    expect(audio.src).toContain('all-i-want-for-christmas-is-you.mp3');
    const plays = audio.play.mock.calls.length;
    await act(async () => audio.dispatchEvent(new Event('error')));
    expect(audio.play).toHaveBeenCalledTimes(plays);
  });

  it('returns to the regular soundtrack after the season changes', async () => {
    context.musicEnabled = true;
    await render();
    const seasonalAudio = audio;
    context.christmasActive = false;
    await render();
    expect(seasonalAudio.pause).toHaveBeenCalled();
    expect(seasonalAudio.removeAttribute).toHaveBeenCalledWith('src');
    expect(audio.src).toContain('/audio/background.mp3');
    expect(audio.loop).toBe(true);
    expect(audio.play).toHaveBeenCalledOnce();
  });
});
