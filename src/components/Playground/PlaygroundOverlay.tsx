import React, { Suspense, useCallback, useEffect, useRef } from 'react';

import styles from './PlaygroundOverlay.module.css';

const PlaygroundLazy = React.lazy(() =>
  import('./Playground').then((module) => ({ default: module.Playground }))
);

interface PlaygroundOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlaygroundOverlay: React.FC<PlaygroundOverlayProps> = ({ isOpen, onClose }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previousActiveRef.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';

    const focusTarget = closeButtonRef.current;
    if (focusTarget) {
      focusTarget.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      previousActiveRef.current?.focus();
    };
  }, [isOpen, onClose]);

  // Basic focus trap: keep Tab within the overlay
  const handleFocusTrap = useCallback((event: React.KeyboardEvent) => {
    if (event.key !== 'Tab' || !panelRef.current) return;

    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Coding Playground"
      onKeyDown={handleFocusTrap}
    >
      <div className={styles.panel} ref={panelRef}>
        <div className={styles.header}>
          <div className={styles.title}>Playground — VSCode Mode</div>
          <button
            className={styles.closeButton}
            type="button"
            onClick={onClose}
            aria-label="Close playground"
            ref={closeButtonRef}
          >
            Close
          </button>
        </div>
        <div className={styles.body}>
          <Suspense
            fallback={
              <span style={{ color: 'var(--color-text-secondary)' }}>Loading playground…</span>
            }
          >
            <PlaygroundLazy />
          </Suspense>
        </div>
      </div>
    </div>
  );
};
