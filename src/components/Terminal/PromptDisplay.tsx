/**
 * PromptDisplay Component
 *
 * Reusable component for rendering terminal prompts.
 * Displays user@hostname:directory$ format with consistent styling.
 */

import React, { type ReactNode } from 'react';

import styles from '../../styles/TerminalOutput.module.css';

export interface PromptDisplayProps {
  /** Username to display */
  user: string;
  /** Hostname to display */
  hostname: string;
  /** Current directory path */
  directory: string;
  /** Prompt symbol ($ for normal, # for root, etc.) */
  symbol: string;
  /** Optional content after prompt (e.g., command text) */
  children?: ReactNode;
}

/**
 * Renders a terminal prompt in the format: user@hostname:directory$
 */
export const PromptDisplay: React.FC<PromptDisplayProps> = ({
  user,
  hostname,
  directory,
  symbol,
  children,
}) => {
  return (
    <span>
      <span className={styles.promptUser}>{user}</span>
      <span className={styles.promptUser}>@</span>
      <span className={styles.promptHost}>{hostname}</span>
      <span className={styles.promptHost}>:</span>
      <span className={styles.promptPath}>{directory}</span>
      <span className={styles.promptSymbol}>{symbol} </span>
      {children}
    </span>
  );
};
