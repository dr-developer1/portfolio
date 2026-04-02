import React from 'react';

import styles from './KeyboardShortcutsOverlay.module.css';

interface KeyboardShortcutsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { keys: 'Ctrl + /', description: 'Toggle shortcuts panel' },
  { keys: 'Ctrl + C', description: 'Cancel current input line' },
  { keys: 'Ctrl + L', description: 'Clear terminal output' },
  { keys: 'Tab', description: 'Autocomplete command/path' },
  { keys: 'Arrow Up/Down', description: 'Navigate command history' },
  { keys: 'Esc', description: 'Close overlay/panel' },
] as const;

export const KeyboardShortcutsOverlay: React.FC<KeyboardShortcutsOverlayProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="terminal-shortcuts-title"
      onClick={onClose}
    >
      <section className={styles.panel} onClick={(event) => event.stopPropagation()}>
        <header className={styles.header}>
          <h2 id="terminal-shortcuts-title" className={styles.title}>
            Keyboard shortcuts
          </h2>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            Close
          </button>
        </header>

        <p className={styles.hint}>Press Ctrl + / at any time to toggle this panel.</p>

        <div className={styles.grid}>
          {SHORTCUTS.map((item) => (
            <React.Fragment key={item.keys}>
              <kbd className={styles.keys}>{item.keys}</kbd>
              <span className={styles.description}>{item.description}</span>
            </React.Fragment>
          ))}
        </div>
      </section>
    </div>
  );
};
