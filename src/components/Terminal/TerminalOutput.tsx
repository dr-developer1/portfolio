import React, { Suspense, lazy } from 'react';

import { useTerminalContext } from '../../hooks/TerminalContext';
import { RECRUITER_TOUR } from '../../data/guides';
import { text, useLocale } from '../../i18n/locale';
import { PathLauncher } from '../Navigation/PathLauncher';
import styles from './TerminalOutput.module.css';

const ASCII_BANNER = String.raw`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  ██████╗ ██╗  ██╗███╗   ███╗ █████╗ ██████╗               ║
║  ██╔══██╗██║  ██║████╗ ████║██╔══██╗██╔══██╗              ║
║  ███████║███████║██╔████╔██║███████║██║  ██║              ║
║  ██╔══██║██╔══██║██║╚██╔╝██║██╔══██║██║  ██║              ║
║  ██║  ██║██║  ██║██║ ╚═╝ ██║██║  ██║██████╔╝              ║
║  ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚═════╝               ║
║                                                           ║
║  ██╗██████╗ ██████╗  █████╗ ██╗  ██╗██╗███╗   ███╗        ║
║  ██║██╔══██╗██╔══██╗██╔══██╗██║  ██║██║████╗ ████║        ║
║  ██║██████╔╝██████╔╝███████║███████║██║██╔████╔██║        ║
║  ██║██╔══██╗██╔══██╗██╔══██║██╔══██║██║██║╚██╔╝██║        ║
║  ██║██████╔╝██║  ██║██║  ██║██║  ██║██║██║ ╚═╝ ██║        ║
║  ╚═╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝     ╚═╝        ║
║                                                           ║
║               AHMAD IBRAHIM • LYON, FRANCE                ║
║               Full Stack Software Engineer                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`;

const Banner3D = lazy(() => import('../Banner/Banner3D'));
function AsciiBanner() {
  return (
    <div className={styles.bannerScroll}>
      <pre className={styles.banner}>{ASCII_BANNER}</pre>
    </div>
  );
}

export const TerminalOutput: React.FC = () => {
  const locale = useLocale();
  const { history, visitorMode, visitorProgress } = useTerminalContext();
  const isReturningVisitor = visitorProgress.visits > 1;
  const recruiterTourProgress = RECRUITER_TOUR.filter((command) =>
    visitorProgress.discoveredCommands.includes(command)
  ).length;
  const recruiterTourNext = RECRUITER_TOUR.find(
    (command) => !visitorProgress.discoveredCommands.includes(command)
  );

  return (
    <div className={styles.output}>
      <Suspense fallback={<AsciiBanner />}>
        <Banner3D />
      </Suspense>
      <div className={styles.line}>
        <span className={styles.muted}>
          {text('Type', 'Tapez', locale)} <span className={styles.highlight}>help</span>{' '}
          {text(
            'to explore projects, skills, and experience.',
            'pour découvrir les projets, compétences et expériences.',
            locale
          )}
        </span>
      </div>
      {isReturningVisitor && (
        <div className={styles.line}>
          <span className={`${styles.muted} ${styles.returningHint}`}>
            {text('Welcome back. Try', 'Bon retour. Essayez', locale)}{' '}
            <span className={styles.highlight}>recommend</span>{' '}
            {text(
              'for the next best commands.',
              'pour découvrir les prochaines commandes.',
              locale
            )}
          </span>
        </div>
      )}
      <div className={styles.quickActions}>
        <PathLauncher />
      </div>
      {visitorMode !== 'standard' && (
        <div className={styles.line}>
          <span className={`${styles.muted} ${styles.pathHint}`}>
            {text('Change path with', 'Changez de parcours avec', locale)}{' '}
            <span className={styles.highlight}>mode standard</span> /{' '}
            <span className={styles.highlight}>mode recruiter</span>,{' '}
            <span className={styles.highlight}>mode engineer</span>,{' '}
            <span className={styles.highlight}>mode founder</span> /{' '}
            <span className={styles.highlight}>mode client</span>.
          </span>
        </div>
      )}
      {visitorMode === 'recruiter' && (
        <div className={styles.line}>
          <span className={`${styles.muted} ${styles.tourHint}`}>
            {text('Recruiter tour progress', 'Progression de la visite recruteur', locale)}:{' '}
            {recruiterTourProgress}/{RECRUITER_TOUR.length}
            {recruiterTourNext ? (
              <>
                {' '}
                • {text('Next', 'Ensuite', locale)}:{' '}
                <span className={styles.highlight}>{recruiterTourNext}</span>
              </>
            ) : (
              text(' • Tour completed.', ' • Visite terminée.', locale)
            )}
          </span>
        </div>
      )}
      <div className={styles.line}>&nbsp;</div>
      {history.map((line) => (
        <div
          id={`terminal-line-${line.id}`}
          key={line.id}
          className={`${styles.line} ${styles[line.type] || ''}`}
        >
          {line.content}
        </div>
      ))}
    </div>
  );
};
