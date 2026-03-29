import React, { useCallback, useEffect, useRef, useState } from 'react';

import { BackgroundMusic } from '../Effects/BackgroundMusic';
import { MatrixRain } from '../Effects/MatrixRain';
import { useTerminalContext } from '../../hooks/TerminalContext';
import { useAutoRun } from '../../hooks/useAutoRun';
import { useKeyboardViewport } from '../../hooks/useKeyboardViewport';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { getPromptConfig } from '../../hooks/useTerminal';
import { BP } from '../../config/breakpoints';
import { SYSTEM_CONFIG } from '../../config';
import type { Achievement } from '../../types';

import { MusicToggleButton } from './MusicToggleButton';
import { PlaygroundOverlay } from '../Playground';
import styles from './Terminal.module.css';
import { TerminalInput } from './TerminalInput';
import { TerminalOutput } from './TerminalOutput';
import { AchievementToastStack, type AchievementToast } from './AchievementToastStack';
import { KeyboardShortcutsOverlay } from './KeyboardShortcutsOverlay';

export const Terminal: React.FC = () => {
  const { bootMode, isPlaygroundOpen, closePlayground, playgroundPreset, executeCommand } =
    useTerminalContext();
  const { user } = getPromptConfig(bootMode);
  const isMobile = useMediaQuery(
    `(max-width: ${BP.mobile}px), (hover: none) and (pointer: coarse)`
  );
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isStartupAnimating, setIsStartupAnimating] = useState(true);
  const [toasts, setToasts] = useState<AchievementToast[]>([]);
  const toastTimeoutsRef = useRef<Map<string, number>>(new Map());
  const seenAchievementsRef = useRef<Set<string>>(new Set());
  const { keyboardInsetPx, isKeyboardOpen, isViewportSettled } = useKeyboardViewport({
    enabled: isMobile,
  });

  useAutoRun(executeCommand);

  const dismissToast = useCallback((toastId: string) => {
    const timeout = toastTimeoutsRef.current.get(toastId);
    if (timeout !== undefined) {
      window.clearTimeout(timeout);
      toastTimeoutsRef.current.delete(toastId);
    }

    setToasts((prev) => prev.filter((toast) => toast.toastId !== toastId));
  }, []);

  useEffect(() => {
    const animationTimeout = window.setTimeout(() => {
      setIsStartupAnimating(false);
    }, 700);

    return () => {
      window.clearTimeout(animationTimeout);
    };
  }, []);

  useEffect(() => {
    const handleAchievementUnlocked = (event: Event) => {
      const achievement = (event as CustomEvent<Achievement>).detail;
      if (!achievement?.id || seenAchievementsRef.current.has(achievement.id)) {
        return;
      }

      seenAchievementsRef.current.add(achievement.id);
      const toastId = `${achievement.id}-${Date.now()}`;

      setToasts((prev) => [...prev, { ...achievement, toastId }]);

      const timeout = window.setTimeout(() => {
        dismissToast(toastId);
      }, 4800);
      toastTimeoutsRef.current.set(toastId, timeout);
    };

    window.addEventListener('achievement-unlocked', handleAchievementUnlocked);
    return () => {
      window.removeEventListener('achievement-unlocked', handleAchievementUnlocked);
    };
  }, [dismissToast]);

  useEffect(() => {
    const timeoutMap = toastTimeoutsRef.current;

    return () => {
      for (const timeoutId of timeoutMap.values()) {
        window.clearTimeout(timeoutId);
      }
      timeoutMap.clear();
    };
  }, []);

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.code === 'Slash') {
        event.preventDefault();
        if (isPlaygroundOpen) {
          return;
        }
        setIsShortcutsOpen((prev) => !prev);
        return;
      }

      if (event.key === 'Escape') {
        setIsShortcutsOpen(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isPlaygroundOpen]);

  const containerStyle = isMobile
    ? ({ '--keyboard-inset': `${keyboardInsetPx}px` } as React.CSSProperties)
    : undefined;

  return (
    <>
      <MatrixRain />
      <BackgroundMusic />
      <div className={`${styles.window} ${isStartupAnimating ? styles.windowWillChange : ''}`}>
        <div className={styles.scanline} />
        <div className={styles.scanlineBeam} />
        <div className={styles.overlay} />
        {/* macOS-style title bar */}
        <div className={styles.titleBar} role="toolbar" aria-label="Terminal window controls">
          <div className={styles.windowControls}>
            <button
              type="button"
              className={`${styles.windowButton} ${styles.closeButton}`}
              aria-label="Close"
              tabIndex={-1}
            />
            <button
              type="button"
              className={`${styles.windowButton} ${styles.minimizeButton}`}
              aria-label="Minimize"
              tabIndex={-1}
            />
            <button
              type="button"
              className={`${styles.windowButton} ${styles.maximizeButton}`}
              aria-label="Maximize"
              tabIndex={-1}
            />
          </div>
          <span className={`${styles.windowTitle} ${styles.windowTitleGlitch}`}>
            {user}@{SYSTEM_CONFIG.hostname} — bash
          </span>
          <div className={styles.windowActions}>
            <MusicToggleButton />
          </div>
        </div>

        {/* Terminal body */}
        <div
          className={`${styles.container} ${styles.scanlineBeamContainer} ${
            isKeyboardOpen ? styles.keyboardOpen : ''
          }`}
          style={containerStyle}
        >
          <TerminalOutput />
          <TerminalInput
            keyboardInsetPx={keyboardInsetPx}
            isKeyboardOpen={isKeyboardOpen}
            isViewportSettled={isViewportSettled}
          />
        </div>
      </div>
      <PlaygroundOverlay
        isOpen={isPlaygroundOpen}
        onClose={closePlayground}
        preset={playgroundPreset}
      />
      <KeyboardShortcutsOverlay
        isOpen={isShortcutsOpen && !isPlaygroundOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
      <AchievementToastStack toasts={toasts} onDismiss={dismissToast} />
    </>
  );
};
