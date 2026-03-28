import React, { useEffect, useRef, useState } from 'react';
import { CommandShortcutList } from '../Output';
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
║               AHMAD IBRAHIM • FRANCE                      ║
║               Ingénieur Développeur Full-Stack            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`;

const BANNER_FONT_FAMILY = 'JetBrains Mono Banner';

export const TerminalOutput: React.FC = () => {
  const { history, visitorMode } = useTerminalContext();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isBannerFontReady, setIsBannerFontReady] = useState(false);

  // Auto-scroll to bottom when new content is added
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  useEffect(() => {
    let isActive = true;

    const loadBannerFont = async () => {
      if (typeof document === 'undefined' || !('fonts' in document)) {
        return;
      }

      const fontSpec = `400 1em "${BANNER_FONT_FAMILY}"`;

      try {
        await document.fonts.load(fontSpec);
        await document.fonts.ready;

        if (isActive && document.fonts.check(fontSpec)) {
          setIsBannerFontReady(true);
        }
      } catch {
        // Keep banner hidden if the deterministic font cannot be confirmed.
      }
    };

    void loadBannerFont();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className={styles.output}>
      {isBannerFontReady ? (
        <div className={styles.bannerScroll}>
          <pre className={styles.banner}>{ASCII_BANNER}</pre>
        </div>
      ) : null}
      <div className={styles.line}>
        <span className={styles.muted}>
          Tapez &apos;<span className={styles.highlight}>help</span>&apos; pour explorer mes projets
          et compétences
        </span>
      </div>
      <div className={styles.quickActions}>
        <CommandShortcutList
          title={visitorMode === 'recruiter' ? 'Recruiter quick start' : 'Quick start'}
          compact
          items={[
            { label: 'Help', command: 'help' },
            { label: 'Highlights', command: 'highlights' },
            { label: 'Tour', command: 'tour' },
            { label: 'Projects', command: 'top-projects' },
            { label: 'Contact', command: 'contact' },
          ]}
        />
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
