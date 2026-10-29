import { text, useLocale } from '../../i18n/locale';
import React, { useEffect, useRef } from 'react';

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
  const locale = useLocale();
  const translations = [
    'Ouvrir ou fermer les raccourcis',
    'Annuler la ligne de commande',
    'Effacer la sortie du terminal',
    'Compléter une commande ou un chemin',
    'Parcourir l’historique des commandes',
    'Fermer le panneau',
  ];
  const panelRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();

    return () => {
      previouslyFocusedRef.current?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) {
        return;
      }

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
      <section ref={panelRef} className={styles.panel} onClick={(event) => event.stopPropagation()}>
        <header className={styles.header}>
          <h2 id="terminal-shortcuts-title" className={styles.title}>
            {text('Keyboard shortcuts', 'Raccourcis clavier', locale)}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            className={styles.closeButton}
            onClick={onClose}
          >
            {text('Close', 'Fermer', locale)}
          </button>
        </header>

        <p className={styles.hint}>
          {text(
            'Press Ctrl + / to toggle this panel. On touch devices, use the ? button in the title bar.',
            'Appuyez sur Ctrl + / pour ouvrir ou fermer ce panneau. Sur écran tactile, utilisez le bouton ? dans la barre de titre.',
            locale
          )}
        </p>

        <div className={styles.grid}>
          {SHORTCUTS.map((item, index) => (
            <React.Fragment key={item.keys}>
              <kbd className={styles.keys}>{item.keys}</kbd>
              <span className={styles.description}>
                {locale === 'fr' ? translations[index] : item.description}
              </span>
            </React.Fragment>
          ))}
        </div>
      </section>
    </div>
  );
};
