import { LanguageTools } from '../Navigation/LanguageTools';
import { text, useLocale } from '../../i18n/locale';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { BackgroundMusic } from '../Effects/BackgroundMusic';
import { MatrixRain } from '../Effects/MatrixRain';
import { Snowfall } from '../Effects/Snowfall';
import { SantaHat } from '../Effects/SantaHat';
import { useTerminalContext } from '../../hooks/TerminalContext';
import { useAutoRun } from '../../hooks/useAutoRun';
import { useKeyboardViewport } from '../../hooks/useKeyboardViewport';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { getPromptConfig } from '../../hooks/useTerminal';
import { BP } from '../../config/breakpoints';
import { SYSTEM_CONFIG } from '../../config';

import { MusicToggleButton } from './MusicToggleButton';
import { PlaygroundOverlay } from '../Playground';
import styles from './Terminal.module.css';
import { TerminalInput } from './TerminalInput';
import { TerminalOutput } from './TerminalOutput';
import { AchievementToastStack, type AchievementToast } from './AchievementToastStack';
import { KeyboardShortcutsOverlay } from './KeyboardShortcutsOverlay';

const AUTO_SCROLL_BOTTOM_THRESHOLD_PX = 72;

export const Terminal: React.FC = () => {
  const locale = useLocale();
  const {
    christmasActive,
    bootMode,
    history,
    achievementFeed,
    consumeAchievementFeed,
    isPlaygroundOpen,
    closePlayground,
    playgroundPreset,
    executeCommand,
  } = useTerminalContext();
  const { user } = getPromptConfig(bootMode);
  const isMobile = useMediaQuery(
    `(max-width: ${BP.mobile}px), (hover: none) and (pointer: coarse)`
  );
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isStartupAnimating, setIsStartupAnimating] = useState(true);
  const [toasts, setToasts] = useState<AchievementToast[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomAnchorRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);
  const previousHistoryLengthRef = useRef(0);
  const toastTimeoutsRef = useRef<Map<string, number>>(new Map());
  const { keyboardInsetPx, isKeyboardOpen, isViewportSettled } = useKeyboardViewport({
    enabled: isMobile,
  });

  useAutoRun(executeCommand);

  const updateAutoScrollState = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      shouldAutoScrollRef.current = true;
      return;
    }

    const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    shouldAutoScrollRef.current = distanceToBottom <= AUTO_SCROLL_BOTTOM_THRESHOLD_PX;
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      shouldAutoScrollRef.current = true;
      return;
    }

    updateAutoScrollState();
    container.addEventListener('scroll', updateAutoScrollState, { passive: true });

    return () => {
      container.removeEventListener('scroll', updateAutoScrollState);
    };
  }, [updateAutoScrollState]);

  useEffect(() => {
    const previousLength = previousHistoryLengthRef.current;
    previousHistoryLengthRef.current = history.length;
    // Mobile refocus also scrolls the input into view. Keep history scrolling in
    // the same direction so the two effects cannot leave the prompt off-screen.
    if (
      isMobile &&
      history.length > 0 &&
      document.activeElement?.matches('[data-terminal-input="true"]')
    ) {
      bottomAnchorRef.current?.scrollIntoView({ behavior: 'instant', block: 'end' });
      return;
    }
    const newCommand = history.slice(previousLength).find((line) => line.type === 'command');
    if (newCommand) {
      // An explicit command should reveal its result, even from the launch panel.
      document
        .getElementById(`terminal-line-${newCommand.id}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (history.length === 0 || !shouldAutoScrollRef.current) {
      return;
    }

    bottomAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [history, isMobile]);

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
    if (achievementFeed.length === 0) {
      return;
    }

    achievementFeed.forEach((achievement) => {
      const toastId = `${achievement.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      setToasts((prev) => [...prev, { ...achievement, toastId }]);

      const timeout = window.setTimeout(() => {
        dismissToast(toastId);
      }, 4800);
      toastTimeoutsRef.current.set(toastId, timeout);
    });

    consumeAchievementFeed(achievementFeed.length);
  }, [achievementFeed, consumeAchievementFeed, dismissToast]);

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
  const windowActions = (
    <div className={styles.windowActions}>
      <button
        type="button"
        className={styles.iconButton}
        aria-label={text('Open keyboard shortcuts', 'Ouvrir les raccourcis clavier', locale)}
        onClick={() => setIsShortcutsOpen(true)}
      >
        ?
      </button>
      <MusicToggleButton />
    </div>
  );

  return (
    <>
      {christmasActive ? <Snowfall /> : <MatrixRain />}
      <BackgroundMusic />
      <div className={`${styles.frame} ${christmasActive ? styles.christmasFrame : ''}`}>
        <div className={`${styles.window} ${isStartupAnimating ? styles.windowWillChange : ''}`}>
          <div className={styles.scanline} />
          <div className={styles.scanlineBeam} />
          <div className={styles.overlay} />
          {/* macOS-style title bar */}
          <div
            className={styles.titleBar}
            role="toolbar"
            aria-label={text('Terminal window controls', 'Contrôles du terminal', locale)}
          >
            <div className={styles.windowControls}>
              <span
                className={`${styles.windowButton} ${styles.closeButton}`}
                aria-hidden="true"
                role="presentation"
              />
              <span
                className={`${styles.windowButton} ${styles.minimizeButton}`}
                aria-hidden="true"
                role="presentation"
              />
              <span
                className={`${styles.windowButton} ${styles.maximizeButton}`}
                aria-hidden="true"
                role="presentation"
              />
            </div>
            <span className={`${styles.windowTitle} ${styles.windowTitleGlitch}`}>
              {user}@{SYSTEM_CONFIG.hostname} - bash
            </span>
            {!christmasActive && windowActions}
          </div>

          <div className={styles.portfolioToolbar}>
            {christmasActive && windowActions}
            <LanguageTools className={styles.languageTools} />
          </div>

          {/* Terminal body */}
          <div
            ref={scrollContainerRef}
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
            <div ref={bottomAnchorRef} aria-hidden="true" className={styles.scrollAnchor} />
          </div>
        </div>
        {christmasActive && <SantaHat className={styles.santaHat} />}
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
