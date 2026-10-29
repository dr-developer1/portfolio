import React, { Suspense, lazy } from 'react';

import { useTerminalContext } from '../../hooks/TerminalContext';
import { text, useLocale } from '../../i18n/locale';
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
  const { history, commandHistory, executeCommand, isLoading } = useTerminalContext();

  return (
    <div className={styles.output}>
      <Suspense fallback={<AsciiBanner />}>
        <Banner3D />
      </Suspense>
      {commandHistory.length === 0 && (
        <p className={`${styles.line} ${styles.muted}`} data-testid="command-hint">
          {text('Try', 'Essayez', locale)}{' '}
          {(['about', 'experience', 'projects', 'help'] as const).map((command, index) => (
            <React.Fragment key={command}>
              {index > 0 && (index === 3 ? text(', or ', ' ou ', locale) : ', ')}
              <button
                type="button"
                className={styles.hintCommand}
                disabled={isLoading}
                onClick={() => executeCommand(command)}
              >
                {command}
              </button>
            </React.Fragment>
          ))}
          .
        </p>
      )}
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
