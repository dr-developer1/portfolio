import React, { useEffect, useRef } from 'react';
import { useTerminalContext } from '../../hooks/TerminalContext';
import styles from './TerminalOutput.module.css';

const ASCII_BANNER = String.raw`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  ▓█████▄  ██▀███     ▓█████▄ ▓█████ ██▒   █▓▓█████  ██▓     ▒█████   ██▓███  ▓█████  ██▀███  
║  ▒██▀ ██▌▓██ ▒ ██▒   ▒██▀ ██▌▓█   ▀▓██░   █▒▓█   ▀ ▓██▒    ▒██▒  ██▒▓██░  ██▒▓█   ▀ ▓██ ▒ ██▒
║  ░██   █▌▓██ ░▄█ ▒   ░██   █▌▒███   ▓██  █▒░▒███   ▒██░    ▒██░  ██▒▓██░ ██▓▒▒███   ▓██ ░▄█ ▒
║  ░▓█▄   ▌▒██▀▀█▄     ░▓█▄   ▌▒▓█  ▄  ▒██ █░░▒▓█  ▄ ▒██░    ▒██   ██░▒██▄█▓▒ ▒▒▓█  ▄ ▒██▀▀█▄  
║  ░▒████▓ ░██▓ ▒██▒   ░▒████▓ ░▒████▒  ▒▀█░  ░▒████▒░██████▒░ ████▓▒░▒██▒ ░  ░░▒████▒░██▓ ▒██▒
║  ▒▒▓  ▒ ░ ▒▓ ░▒▓░    ▒▒▓  ▒ ░░ ▒░ ░  ░ ▐░  ░░ ▒░ ░░ ▒░▓  ░░ ▒░▒░▒░ ▒▓▒░ ░  ░░░ ▒░ ░░ ▒▓ ░▒▓░
║  ░ ▒  ▒   ░▒ ░ ▒░    ░ ▒  ▒  ░ ░  ░  ░ ░░   ░ ░  ░░ ░ ▒  ░  ░ ▒ ▒░ ░▒ ░      ░ ░  ░  ░▒ ░ ▒░
║  ░ ░  ░   ░░   ░     ░ ░  ░    ░       ░░     ░     ░ ░   ░ ░ ░ ▒  ░░          ░     ░░   ░ 
║    ░       ░           ░       ░  ░     ░     ░  ░    ░  ░    ░ ░              ░  ░   ░     
║  ░                   ░                 ░                                                    
║                                                           ║
║               AHMAD IBRAHIM • LYON, FRANCE                ║
║               Ingénieur Développeur Full-Stack            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
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
        <span className={styles.muted}>
          Tapez '<span className={styles.highlight}>help</span>' pour explorer mes projets et
          compétences
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
