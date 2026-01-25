import React from 'react';
import { TerminalOutput } from './TerminalOutput';
import { TerminalInput } from './TerminalInput';
import styles from './Terminal.module.css';

export const Terminal: React.FC = () => {
  return (
    <div className={styles.window}>
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
        <span className={styles.windowTitle}>visitor@portfolio — bash</span>
        <div className={styles.windowActions} />
      </div>
      
      {/* Terminal body */}
      <div className={styles.container}>
        <div className={styles.scanline} />
        <div className={styles.overlay} />
        <TerminalOutput />
        <TerminalInput />
      </div>
    </div>
  );
};
