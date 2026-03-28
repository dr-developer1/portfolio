import React from 'react';

import { BackgroundMusic } from '../Effects/BackgroundMusic';
import { MatrixRain } from '../Effects/MatrixRain';
import { useTerminalContext } from '../../hooks/TerminalContext';
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

export const Terminal: React.FC = () => {
  const { bootMode, isPlaygroundOpen, closePlayground, playgroundPreset } = useTerminalContext();
  const { user } = getPromptConfig(bootMode);
  const isMobile = useMediaQuery(
    `(max-width: ${BP.mobile}px), (hover: none) and (pointer: coarse)`
  );
  const { keyboardInsetPx, isKeyboardOpen, isViewportSettled } = useKeyboardViewport({
    enabled: isMobile,
  });

  const containerStyle = isMobile
    ? ({ '--keyboard-inset': `${keyboardInsetPx}px` } as React.CSSProperties)
    : undefined;

  return (
    <>
      <MatrixRain />
      <BackgroundMusic />
      <div className={styles.window}>
        <div className={styles.scanline} />
        <div className={styles.overlay} />
        {/* macOS-style title bar */}
        <div className={styles.titleBar}>
          <div className={styles.windowControls}>
            <button
              className={`${styles.windowButton} ${styles.closeButton}`}
              aria-label="Close"
              tabIndex={-1}
            />
            <button
              className={`${styles.windowButton} ${styles.minimizeButton}`}
              aria-label="Minimize"
              tabIndex={-1}
            />
            <button
              className={`${styles.windowButton} ${styles.maximizeButton}`}
              aria-label="Maximize"
              tabIndex={-1}
            />
          </div>
          <span className={styles.windowTitle}>
            {user}@{SYSTEM_CONFIG.hostname} — bash
          </span>
          <div className={styles.windowActions}>
            <MusicToggleButton />
          </div>
        </div>

        {/* Terminal body */}
        <div
          className={`${styles.container} ${isKeyboardOpen ? styles.keyboardOpen : ''}`}
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
    </>
  );
};
