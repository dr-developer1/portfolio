import React from 'react';
import { useTerminalContext } from '../../hooks/TerminalContext';
import styles from './Terminal.module.css';

/**
 * Speaker/mute toggle button for the terminal title bar
 */
export const MusicToggleButton: React.FC = () => {
  const { musicEnabled, setMusicEnabled } = useTerminalContext();

  const handleClick = () => {
    setMusicEnabled(!musicEnabled);
  };

  return (
    <button
      className={styles.iconButton}
      onClick={handleClick}
      aria-label={musicEnabled ? 'Mute music' : 'Unmute music'}
      title={musicEnabled ? 'Mute music' : 'Unmute music'}
    >
      {musicEnabled ? (
        // Speaker with sound waves (unmuted)
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      ) : (
        // Speaker with X (muted)
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      )}
    </button>
  );
};
