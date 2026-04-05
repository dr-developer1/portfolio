import React, { Suspense, lazy } from 'react';

import { CommandShortcutList, type CommandShortcut } from '../Output';
import { useTerminalContext } from '../../hooks/TerminalContext';
import { RECRUITER_TOUR } from '../../data/guides';
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
const PATH_CHOOSER_ITEMS: CommandShortcut[] = [
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
];

function AsciiBanner() {
  return (
    <div className={styles.bannerScroll}>
      <pre className={styles.banner}>{ASCII_BANNER}</pre>
    </div>
  );
}

function getQuickActions(mode: string) {
  switch (mode) {
    case 'recruiter':
      return [
        { label: 'Highlights', command: 'highlights' },
        { label: 'Experience', command: 'experience' },
        { label: 'Top Projects', command: 'top-projects' },
        { label: 'Resume', command: 'resume' },
      ];
    case 'engineer':
      return [
        { label: 'Skills', command: 'skills' },
        { label: 'Projects', command: 'projects' },
        { label: 'Playground', command: 'playground --challenge debugging' },
        { label: 'Legacy', command: 'legacy' },
      ];
    case 'founder':
      return [
        { label: 'Highlights', command: 'highlights' },
        { label: 'Projects', command: 'projects' },
        { label: 'Availability', command: 'availability' },
        { label: 'Contact', command: 'contact' },
      ];
    case 'client':
      return [
        { label: 'About', command: 'about' },
        { label: 'Projects', command: 'projects' },
        { label: 'Skills', command: 'skills' },
        { label: 'Contact Me', command: 'contact-me' },
      ];
    default:
      return [
        { label: 'Help', command: 'help' },
        { label: 'Highlights', command: 'highlights' },
        { label: 'Tour', command: 'tour' },
        { label: 'Projects', command: 'top-projects' },
      ];
  }
}

function getOnboardingPanel(mode: string) {
  if (mode === 'standard') {
    return {
      title: 'Who are you? Choose your path',
      items: PATH_CHOOSER_ITEMS,
    };
  }

  return {
    title: `${mode} quick start`,
    items: getQuickActions(mode),
  };
}

export const TerminalOutput: React.FC = () => {
  const { history, visitorMode, visitorProgress } = useTerminalContext();
  const isReturningVisitor = visitorProgress.visits > 1;
  const onboardingPanel = getOnboardingPanel(visitorMode);
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
          Type <span className={styles.highlight}>help</span> to explore projects, skills, and
          experience.
        </span>
      </div>
      {isReturningVisitor && (
        <div className={styles.line}>
          <span className={`${styles.muted} ${styles.returningHint}`}>
            Welcome back. Try <span className={styles.highlight}>recommend</span> for the next best
            commands.
          </span>
        </div>
      )}
      <div className={styles.quickActions}>
        <CommandShortcutList
          title={onboardingPanel.title}
          compact
          items={onboardingPanel.items}
        />
      </div>
      {visitorMode !== 'standard' && (
        <div className={styles.line}>
          <span className={`${styles.muted} ${styles.pathHint}`}>
            Want a different lens? Try <span className={styles.highlight}>mode standard</span> or{' '}
            <span className={styles.highlight}>mode recruiter</span>,{' '}
            <span className={styles.highlight}>mode engineer</span>,{' '}
            <span className={styles.highlight}>mode founder</span>, or{' '}
            <span className={styles.highlight}>mode client</span>.
          </span>
        </div>
      )}
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
      {history.map((line) => (
        <div key={line.id} className={`${styles.line} ${styles[line.type] || ''}`}>
          {line.content}
        </div>
      ))}
    </div>
  );
};
