import React, { useEffect, useRef } from 'react';
import { useTerminalContext } from '../../hooks/TerminalContext';
import styles from './TerminalOutput.module.css';

const ASCII_BANNER = `
 ██████╗  ██████╗ ██████╗ ████████╗███████╗ ██████╗ ██╗     ██╗ ██████╗ 
 ██╔══██╗██╔═══██╗██╔══██╗╚══██╔══╝██╔════╝██╔═══██╗██║     ██║██╔═══██╗
 ██████╔╝██║   ██║██████╔╝   ██║   █████╗  ██║   ██║██║     ██║██║   ██║
 ██╔═══╝ ██║   ██║██╔══██╗   ██║   ██╔══╝  ██║   ██║██║     ██║██║   ██║
 ██║     ╚██████╔╝██║  ██║   ██║   ██║     ╚██████╔╝███████╗██║╚██████╔╝
 ╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝      ╚═════╝ ╚══════╝╚═╝ ╚═════╝ 
`;

export const TerminalOutput: React.FC = () => {
  const { history } = useTerminalContext();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new content is added
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  return (
    <div className={styles.output}>
      {/* Welcome banner - always shown */}
      <pre className={styles.welcomeBanner}>{ASCII_BANNER}</pre>
      <div className={styles.line}>
        <span className={styles.welcomeText}>
          Welcome to my interactive portfolio terminal{' '}
          <span className={styles.highlight}>v1.0.0</span>
        </span>
      </div>
      <div className={styles.line}>
        <span className={styles.muted}>
          Type '<span className={styles.highlight}>help</span>' to see available commands.
        </span>
      </div>
      <div className={styles.line}>&nbsp;</div>

      {/* Command history */}
      {history.map((line) => (
        <div key={line.id} className={`${styles.line} ${styles[line.type] || ''}`}>
          {line.content}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};
