import type { FC } from 'react';
import { useEffect, useRef, useCallback } from 'react';
import { useTerminalContext } from '../../hooks/TerminalContext';

// Path to the background music file in public folder
const MUSIC_SRC = '/audio/background.mp3';

/**
 * BackgroundMusic component handles audio playback at fixed 50% volume.
 *
 * Audio only plays when both conditions are met:
 * 1. musicEnabled is true (user preference)
 * 2. hasUserInteracted is true (user has clicked/pressed a key)
 *
 * This solves browser autoplay restrictions - the boot sequence triggers
 * hasUserInteracted when the user interacts to start the system.
 */
export const BackgroundMusic: FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { musicEnabled, hasUserInteracted } = useTerminalContext();

  /**
   * Attempt to play audio - only works after user interaction
   */
  const attemptPlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      await audio.play();
    } catch (error) {
      // Log non-autoplay errors for debugging
      if (
        error instanceof Error &&
        error.name !== 'NotAllowedError' &&
        error.name !== 'AbortError'
      ) {
        console.error('Error playing audio:', error);
      }
    }
  }, []);

  /**
   * Pause audio playback
   */
  const pauseAudio = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
  }, []);

  // Create and configure audio element on mount
  useEffect(() => {
    const audio = new Audio(MUSIC_SRC);
    audio.loop = true;
    audio.volume = 0.5; // Set to 50% volume
    audio.preload = 'none';
    audioRef.current = audio;

    // Cleanup on unmount
    return () => {
      audio.pause();
      audio.removeAttribute('src');
      audio.load(); // Abort any pending network requests
      audioRef.current = null;
    };
  }, []);

  // Sync playback with musicEnabled AND hasUserInteracted
  // Audio will only play when both conditions are true
  useEffect(() => {
    if (musicEnabled && hasUserInteracted) {
      attemptPlay();
    } else {
      pauseAudio();
    }
  }, [musicEnabled, hasUserInteracted, attemptPlay, pauseAudio]);

  // This component doesn't render anything visible
  return null;
};
