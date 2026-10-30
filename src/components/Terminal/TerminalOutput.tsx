import React from 'react';
import Banner3D from '../Banner/Banner3D';

import { useTerminalContext } from '../../hooks/TerminalContext';
import { text, useLocale } from '../../i18n/locale';
import { focusTerminalInput } from '../../utils/domHelpers';
import styles from './TerminalOutput.module.css';

export const TerminalOutput: React.FC = () => {
  const locale = useLocale();
  const { history, commandHistory, executeCommand, isLoading } = useTerminalContext();

  const executeHint = (command: string) => {
    // The hint unmounts on execution, so transfer focus while the user gesture is active.
    focusTerminalInput();
    executeCommand(command);
  };

  return (
    <div className={styles.output}>
      <Banner3D />
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
                onClick={() => executeHint(command)}
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
