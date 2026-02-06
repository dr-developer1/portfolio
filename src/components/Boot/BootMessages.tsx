/**
 * BootMessages Component
 *
 * Displays the animated boot messages during the boot sequence.
 * Each message fades in sequentially with status indicators.
 */

import React, { memo } from 'react';

import type { BootMessage, BootMessagesProps } from '../../types/boot';

import styles from './BootScreen.module.css';

/**
 * Get the CSS class for a status indicator
 */
function getStatusClass(status: BootMessage['status']): string {
  switch (status) {
    case 'ok':
      return styles.statusOk;
    case 'fail':
      return styles.statusFail;
    case 'warn':
      return styles.statusWarn;
    default:
      return '';
  }
}

/**
 * Get the display text for a status indicator
 */
function getStatusText(status: BootMessage['status']): string {
  switch (status) {
    case 'ok':
      return 'OK';
    case 'fail':
      return 'FAIL';
    case 'warn':
      return 'WARN';
    default:
      return '';
  }
}

/**
 * Single boot message line component
 */
const MessageLine: React.FC<{ message: BootMessage; index: number }> = memo(
  ({ message, index }) => {
    // Empty messages create spacing
    if (!message.text) {
      return <div className={styles.messageEmpty} aria-hidden="true" />;
    }

    return (
      <div className={styles.message} style={{ animationDelay: `${index * 50}ms` }}>
        <span className={styles.messageText}>{message.text}</span>
        {message.status && message.status !== 'none' && (
          <span className={getStatusClass(message.status)}>{getStatusText(message.status)}</span>
        )}
      </div>
    );
  }
);

MessageLine.displayName = 'MessageLine';

/**
 * Container for all boot messages, showing only up to currentIndex
 */
export const BootMessages: React.FC<BootMessagesProps> = memo(({ messages, currentIndex }) => {
  // Only show messages up to and including currentIndex
  const visibleMessages = messages.slice(0, currentIndex + 1);

  return (
    <div className={styles.messagesContainer} role="log" aria-label="Boot sequence messages">
      {visibleMessages.map((message, index) => (
        <MessageLine key={index} message={message} index={index} />
      ))}
    </div>
  );
});

BootMessages.displayName = 'BootMessages';
