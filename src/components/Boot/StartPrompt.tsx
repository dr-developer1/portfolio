/**
 * StartPrompt Component
 *
 * Displays the "Press Enter to boot" prompt with a blinking cursor.
 * Shown during the 'waiting' phase of the boot sequence.
 */

import { text, useLocale } from '../../i18n/locale';
import React, { useEffect, useRef } from 'react';

import type { StartPromptProps } from '../../types/boot';

import styles from './BootScreen.module.css';

/**
 * Interactive prompt that waits for user input to start boot
 */
export const StartPrompt: React.FC<StartPromptProps> = ({
  hint,
  typedText = '',
  onStart,
  onInputChange,
}) => {
  const locale = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the hidden input on mount for mobile keyboard accessibility
  useEffect(() => {
    // Small delay to ensure the component is rendered before focusing
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  /**
   * Handle tap on the container — focus input to open keyboard,
   * or start boot directly if double-tapped / long-pressed
   */
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  /**
   * Handle input changes from virtual keyboard.
   * This is the primary input path on mobile since keydown events
   * may not fire reliably with virtual keyboards.
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onInputChange?.(e.target.value);
  };

  /**
   * Handle Enter key from the hidden input (works on both mobile and desktop)
   * Also stop propagation to prevent useSecretCode's global listener from firing (double typing fix)
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Stop propagation so the global window listener doesn't process this key event
    // This prevents "double typing" where both this input and the global listener add the character
    e.stopPropagation();

    if (e.key === 'Enter') {
      e.preventDefault();
      onStart?.();
    }
  };

  return (
    <div
      className={styles.promptContainer}
      role="status"
      aria-live="polite"
      onClick={handleContainerClick}
    >
      {/* Desktop prompt */}
      <p className={styles.promptText}>
        <span className={styles.desktopOnly}>
          {text(
            'Press Enter to boot system...',
            'Appuyez sur Entrée pour démarrer le système…',
            locale
          )}
        </span>
        <span className={styles.mobileOnly}>
          {text(
            'Tap here to open keyboard, then press Enter',
            'Touchez ici pour ouvrir le clavier, puis appuyez sur Entrée',
            locale
          )}
        </span>
      </p>

      {/* Mobile tap-to-start button */}
      <button
        type="button"
        className={styles.tapToStart}
        onClick={(e) => {
          e.stopPropagation();
          onStart?.();
        }}
        aria-label={text('Tap to start system', 'Toucher pour démarrer le système', locale)}
      >
        ▶ {text('Tap to Start', 'Toucher pour démarrer', locale)}
      </button>

      {hint && <p className={styles.promptHint}>{hint}</p>}

      <div className={styles.inputLine}>
        <span className={styles.inputPrompt}>&gt;</span>
        <span className={styles.typedText}>{typedText}</span>
        <span className={styles.cursor} aria-hidden="true" />

        {/* Hidden input for virtual keyboard support on mobile */}
        <input
          ref={inputRef}
          type="text"
          className={styles.hiddenInput}
          value={typedText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Type a secret code or press Enter to boot"
          enterKeyHint="go"
        />
      </div>
    </div>
  );
};
