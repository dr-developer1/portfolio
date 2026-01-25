import React from 'react';
import { TerminalLine } from './TerminalLine';
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
  return (
    <div className={styles.output}>
      <pre className={styles.welcomeBanner}>{ASCII_BANNER}</pre>
      <TerminalLine>
        <span className={styles.welcomeText}>
          Welcome to my interactive portfolio terminal <span className={styles.highlight}>v1.0.0</span>
        </span>
      </TerminalLine>
      <TerminalLine>
        <span className={styles.muted}>
          Type '<span className={styles.highlight}>help</span>' to see available commands.
        </span>
      </TerminalLine>
      <TerminalLine>&nbsp;</TerminalLine>
    </div>
  );
};
