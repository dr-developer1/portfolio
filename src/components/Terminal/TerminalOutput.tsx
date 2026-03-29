import React, { useEffect, useRef, useState } from 'react';
import { CommandShortcutList } from '../Output';
import { useTerminalContext } from '../../hooks/TerminalContext';
import { RECRUITER_TOUR } from '../../data/guides';
import { getVisitorProgress } from '../../utils/progressService';
import styles from './TerminalOutput.module.css';

const ASCII_BANNER = String.raw`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  ██████╗ ██╗  ██╗███╗   ███╗ █████╗ ██████╗              ║
║  ██╔══██╗██║  ██║████╗ ████║██╔══██╗██╔══██╗             ║
║  ███████║███████║██╔████╔██║███████║██║  ██║             ║
║  ██╔══██║██╔══██║██║╚██╔╝██║██╔══██║██║  ██║             ║
║  ██║  ██║██║  ██║██║ ╚═╝ ██║██║  ██║██████╔╝             ║
║  ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚═════╝              ║
║                                                           ║
║  ██╗██████╗ ██████╗  █████╗ ██╗  ██╗██╗███╗   ███╗       ║
║  ██║██╔══██╗██╔══██╗██╔══██╗██║  ██║██║████╗ ████║       ║
║  ██║██████╔╝██████╔╝███████║███████║██║██╔████╔██║       ║
║  ██║██╔══██╗██╔══██╗██╔══██║██╔══██║██║██║╚██╔╝██║       ║
║  ██║██████╔╝██║  ██║██║  ██║██║  ██║██║██║ ╚═╝ ██║       ║
║  ╚═╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝     ╚═╝       ║
║                                                           ║
║               AHMAD IBRAHIM • LYON, FRANCE                ║
║               Full Stack Software Engineer                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`;

const BANNER_FONT_FAMILY = 'JetBrains Mono Banner';

export const TerminalOutput: React.FC = () => {
  const { history, visitorMode } = useTerminalContext();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isBannerFontReady, setIsBannerFontReady] = useState(false);
  const progress = getVisitorProgress();
  const isReturningVisitor = progress.visits > 1;
  const recruiterTourProgress = RECRUITER_TOUR.filter((command) =>
    progress.discoveredCommands.includes(command)
  ).length;
  const recruiterTourNext = RECRUITER_TOUR.find(
    (command) => !progress.discoveredCommands.includes(command)
  );

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
      <div className={styles.bannerScroll}>
        <pre
          className={styles.banner}
          style={
            isBannerFontReady
              ? undefined
              : { fontFamily: 'monospace', opacity: 0.75, filter: 'blur(0.2px)' }
          }
        >
          {ASCII_BANNER}
        </pre>
      </div>
      <div className={styles.line}>
        <span className={styles.muted}>
          Type <span className={styles.highlight}>help</span> to explore projects, skills, and
          experience
        </span>
      </div>
      {isReturningVisitor && (
        <div className={styles.line}>
          <span className={`${styles.muted} ${styles.returningHint}`}>
            Welcome back. Try <span className={styles.highlight}>recommend</span> for personalized
            next steps.
          </span>
        </div>
      )}
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
      <div className={styles.quickActions}>
        <CommandShortcutList
          title="Who are you? Choose your path"
          compact
          items={[
            {
              label: 'Recruiter',
              command: 'mode recruiter',
              description: 'Fast overview, experience, contact',
            },
            {
              label: 'Engineer',
              command: 'mode engineer',
              description: 'Architecture, playground, deep dives',
            },
            {
              label: 'Founder',
              command: 'mode founder',
              description: 'Product delivery, ownership, speed',
            },
            {
              label: 'Client',
              command: 'mode client',
              description: 'Outcomes, stack, communication',
            },
          ]}
        />
      </div>
      {visitorMode === 'recruiter' && (
        <div className={styles.line}>
          <span className={`${styles.muted} ${styles.tourHint}`}>
            Recruiter tour progress: {recruiterTourProgress}/{RECRUITER_TOUR.length}
            {recruiterTourNext ? (
              <>
                {' '}
                • Next: <span className={styles.highlight}>{recruiterTourNext}</span>
              </>
            ) : (
              ' • Tour completed.'
            )}
          </span>
        </div>
      )}
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
