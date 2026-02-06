/**
 * BootScreen Component
 *
 * Main orchestrator for the boot sequence experience.
 * Handles keyboard/click events, secret code detection, and phase transitions.
 *
 * @example
 * <BootScreen onBootComplete={() => setShowTerminal(true)} />
 */

import React, { useCallback, useEffect, useRef } from 'react';

import { useBootSequence } from '../../hooks/useBootSequence';
import { useSecretCode } from '../../hooks/useSecretCode';
import type { BootMode, BootScreenProps } from '../../types/boot';

import { BootMessages } from './BootMessages';
import styles from './BootScreen.module.css';
import { StartPrompt } from './StartPrompt';

/**
 * Full-screen boot sequence component
 */
export const BootScreen: React.FC<BootScreenProps> = ({ onBootComplete, onModeDetected }) => {
  const { state, startBoot, messages } = useBootSequence();
  const { detectedMode, typedText, reset: resetSecretCode } = useSecretCode();
  const hasStartedRef = useRef(false);

  /**
   * Handle starting the boot sequence
   */
  const handleStart = useCallback(
    (mode: BootMode = 'normal') => {
      if (hasStartedRef.current) return;
      hasStartedRef.current = true;
      resetSecretCode();
      // Notify parent of the selected boot mode
      onModeDetected?.(mode);
      startBoot(mode);
    },
    [startBoot, resetSecretCode, onModeDetected]
  );

  // Handle Enter key to start boot (during waiting phase)
  // Only Enter triggers boot - user must press Enter after typing secret code
  useEffect(() => {
    if (state.phase !== 'waiting') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Only trigger boot on Enter
      if (event.key === 'Enter') {
        event.preventDefault();
        // Use detected secret mode if available, otherwise normal
        handleStart(detectedMode ?? 'normal');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.phase, detectedMode, handleStart]);

  // Notify parent when boot completes
  useEffect(() => {
    if (state.phase === 'complete') {
      onBootComplete();
    }
  }, [state.phase, onBootComplete]);

  // Don't render anything once complete (parent will switch to terminal)
  if (state.phase === 'complete') {
    return null;
  }

  return (
    <div
      className={styles.bootScreen}
      data-mode={state.mode}
      role="main"
      aria-label="System boot screen"
    >
      <div className={styles.bootContainer}>
        {/* Header with logo */}
        <header className={styles.header}>
          <h1 className={styles.logo}>PORTFOLIO OS</h1>
          <p className={styles.version}>v2.0.0</p>
        </header>

        {/* Phase-dependent content */}
        {state.phase === 'waiting' && (
          <StartPrompt hint="or try typing a secret code..." typedText={typedText} />
        )}

        {state.phase === 'booting' && (
          <BootMessages messages={messages} currentIndex={state.currentMessageIndex} />
        )}
      </div>

      {/* Screen reader announcement */}
      <div className={styles.visuallyHidden} role="status" aria-live="assertive">
        {state.phase === 'waiting' && 'Type a command and press Enter to start the system'}
        {state.phase === 'booting' && 'System is booting, please wait'}
      </div>
    </div>
  );
};
