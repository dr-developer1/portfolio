import React from 'react';

import type { Achievement } from '../../types';

import styles from './AchievementToastStack.module.css';

export interface AchievementToast extends Achievement {
  toastId: string;
}

interface AchievementToastStackProps {
  toasts: AchievementToast[];
  onDismiss: (toastId: string) => void;
}

export const AchievementToastStack: React.FC<AchievementToastStackProps> = ({
  toasts,
  onDismiss,
}) => {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className={styles.stack} role="status" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <section key={toast.toastId} className={styles.toast}>
          <div className={styles.kicker}>Achievement unlocked</div>
          <h2 className={styles.title}>{toast.title}</h2>
          <p className={styles.description}>{toast.description}</p>
          <button
            type="button"
            className={styles.dismissButton}
            onClick={() => onDismiss(toast.toastId)}
            aria-label={`Dismiss ${toast.title} notification`}
          >
            Dismiss
          </button>
        </section>
      ))}
    </div>
  );
};
