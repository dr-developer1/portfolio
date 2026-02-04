import { useEffect, useRef, useCallback } from 'react';
import { useTerminalContext } from '../../hooks/TerminalContext';

// Path to the background music file in public folder
const MUSIC_SRC = '/audio/background.mp3';

/**
 * BackgroundMusic component handles audio playback.
 *
 * Audio only plays when both conditions are met:
 * 1. musicEnabled is true (user preference)
 * 2. hasUserInteracted is true (user has clicked/pressed a key)
 *
 * This solves browser autoplay restrictions - the boot sequence triggers
 * hasUserInteracted when the user interacts to start the system.
 */
export const BackgroundMusic: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { musicEnabled, musicVolume, hasUserInteracted } = useTerminalContext();

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
      if (error instanceof Error && error.name !== 'NotAllowedError') {
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
    audio.volume = musicVolume;
    audio.preload = 'auto';
    audioRef.current = audio;

    // Cleanup on unmount
    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- Only create audio once on mount

  // Sync volume with context
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = musicVolume;
    }
  }, [musicVolume]);

  // Sync playback with musicEnabled AND hasUserInteracted
  // Audio will only play when both conditions are true
  useEffect(() => {
    if (musicEnabled && hasUserInteracted) {
      attemptPlay();
    } else {
      pauseAudio();
    }
  }, [musicEnabled, hasUserInteracted, attemptPlay, pauseAudio]);

  // Listen for direct music control events (for programmatic control)
  useEffect(() => {
    const handleMusicControl = (e: Event) => {
      const customEvent = e as CustomEvent<{ action: 'play' | 'pause' | 'toggle' }>;
      const action = customEvent.detail.action;

      // Only allow play actions if user has interacted
      if (action === 'play' && hasUserInteracted) {
        attemptPlay();
      } else if (action === 'pause') {
        pauseAudio();
      } else if (action === 'toggle' && hasUserInteracted) {
        if (audioRef.current?.paused) {
          attemptPlay();
        } else {
          pauseAudio();
        }
      }
    };

    window.addEventListener('music-control', handleMusicControl);
    return () => window.removeEventListener('music-control', handleMusicControl);
  }, [attemptPlay, pauseAudio, hasUserInteracted]);

  // This component doesn't render anything visible
  return null;
};
