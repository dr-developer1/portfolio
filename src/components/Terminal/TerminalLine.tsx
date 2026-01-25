import React from 'react';
import styles from './TerminalOutput.module.css';

interface TerminalLineProps {
  children: React.ReactNode;
  type?: 'output' | 'error' | 'success' | 'warning' | 'info' | 'command';
}

export const TerminalLine: React.FC<TerminalLineProps> = ({ children, type = 'output' }) => {
  const getTypeClass = () => {
    switch (type) {
      case 'error':
        return styles.error;
      case 'success':
        return styles.success;
      case 'warning':
        return styles.warning;
      case 'info':
        return styles.info;
      default:
        return '';
    }
  };

  return (
    <div className={`${styles.line} ${getTypeClass()}`}>
      {type === 'command' && <span className={styles.commandPrompt}>$ </span>}
      {children}
    </div>
  );
};
