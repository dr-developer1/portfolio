/**
 * StartPrompt Component
 *
 * Displays the "Press Enter to boot" prompt with a blinking cursor.
 * Shown during the 'waiting' phase of the boot sequence.
 */

import React from 'react';

import type { StartPromptProps } from '../../types/boot';

import styles from './BootScreen.module.css';

/**
 * Interactive prompt that waits for user input to start boot
 */
export const StartPrompt: React.FC<StartPromptProps> = ({ hint, typedText = '' }) => {
  return (
    <div className={styles.promptContainer} role="status" aria-live="polite">
      <p className={styles.promptText}>Press Enter to boot system...</p>
      {hint && <p className={styles.promptHint}>{hint}</p>}
      <div className={styles.inputLine}>
        <span className={styles.inputPrompt}>&gt;</span>
        <span className={styles.typedText}>{typedText}</span>
        <span className={styles.cursor} aria-hidden="true" />
      </div>
    </div>
  );
};
