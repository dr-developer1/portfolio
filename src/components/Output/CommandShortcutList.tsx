import React from 'react';

import { useTerminalContext } from '../../hooks/TerminalContext';
import styles from '../../styles/outputUtilities.module.css';

export interface CommandShortcut {
  label: string;
  command: string;
  description?: string;
}

interface CommandShortcutListProps {
  title?: string;
  items: CommandShortcut[];
  compact?: boolean;
}

export const CommandShortcutList: React.FC<CommandShortcutListProps> = ({
  title,
  items,
  compact = false,
}) => {
  const { executeCommand, isLoading } = useTerminalContext();

  return (
    <div className={styles.panel}>
      {title && <div className={styles.panelTitle}>{title}</div>}
      <div className={compact ? styles.actionRowCompact : styles.actionRow}>
        {items.map((item) => (
          <button
            key={`${item.label}-${item.command}`}
            type="button"
            className={styles.actionButton}
            disabled={isLoading}
            onClick={() => executeCommand(item.command)}
            title={item.description ?? item.command}
          >
            <span className={styles.actionLabel}>{item.label}</span>
            {!compact && <span className={styles.actionCommand}>{item.command}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};
