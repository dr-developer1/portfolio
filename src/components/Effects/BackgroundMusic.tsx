import { useEffect, useRef } from 'react';
import { useTerminalContext } from '../../hooks/TerminalContext';
import { resolveSitePath } from '../../utils/sitePaths';

const CHRISTMAS_TRACKS = ['/audio/let-it-snow.mp3', '/audio/all-i-want-for-christmas-is-you.mp3'];

export function BackgroundMusic() {
  const { musicEnabled, hasUserInteracted, christmasActive } = useTerminalContext();
  const playerRef = useRef<{ setPlaying: (enabled: boolean) => void } | null>(null);

  useEffect(() => {
    const audio = new Audio();
    const abort = new AbortController();
    let disposed = false;
    let playing = false;
    let playlist: string[] = [];
    let index = 0;
    let prepared: Promise<void> | undefined;
    audio.preload = 'none';
    audio.volume = 0.5;
    audio.loop = !christmasActive;

    const prepare = () => {
      prepared ??= (async () => {
        if (christmasActive) {
          const available = await Promise.all(
            CHRISTMAS_TRACKS.map(async (path) => {
              const source = resolveSitePath(path);
              try {
                const response = await fetch(source, { method: 'HEAD', signal: abort.signal });
                // Dev/static hosts can return the HTML fallback for a missing MP3.
                return response.ok && response.headers.get('content-type')?.startsWith('audio/')
                  ? source
                  : null;
              } catch {
                return null;
              }
            })
          );
          playlist = available.filter((source): source is string => source !== null);
        } else {
          playlist = [resolveSitePath('/audio/background.mp3')];
        }
        if (!disposed && playlist.length > 0) audio.src = playlist[0];
      })();
      return prepared;
    };

    const play = async () => {
      await prepare();
      if (disposed || !playing || playlist.length === 0) return;
      try {
        await audio.play();
      } catch (error) {
        if (
          import.meta.env.DEV &&
          error instanceof Error &&
          !['NotAllowedError', 'AbortError', 'NotSupportedError'].includes(error.name)
        ) {
          console.error('Error playing audio:', error);
        }
      }
    };

    const next = () => {
      if (disposed || playlist.length === 0) return;
      index = (index + 1) % playlist.length;
      audio.src = playlist[index];
      if (playing) void play();
    };
    const skipFailedTrack = () => {
      // Remove failed tracks for this session so missing/corrupt files cannot retry forever.
      playlist.splice(index, 1);
      index -= 1;
      next();
    };
    audio.addEventListener('ended', next);
    audio.addEventListener('error', skipFailedTrack);
    playerRef.current = {
      setPlaying(enabled) {
        playing = enabled;
        if (enabled) void play();
        else audio.pause();
      },
    };

    return () => {
      disposed = true;
      abort.abort();
      playerRef.current = null;
      audio.removeEventListener('ended', next);
      audio.removeEventListener('error', skipFailedTrack);
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    };
  }, [christmasActive]);

  useEffect(() => {
    playerRef.current?.setPlaying(musicEnabled && hasUserInteracted);
  }, [musicEnabled, hasUserInteracted, christmasActive]);

  return null;
}
