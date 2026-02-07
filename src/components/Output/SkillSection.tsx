/**
 * SkillSection Component
 *
 * Displays a category of skills with a colored label and comma-separated list.
 */

import React from 'react';

import styles from './SkillSection.module.css';

export interface SkillSectionProps {
  /** Section title (e.g., "Languages", "Frameworks") */
  title: string;
  /** Array of skill items to display */
  items: string[];
  /** Color name for the items (orange, green, cyan, purple) */
  color: 'orange' | 'green' | 'cyan' | 'purple';
}

const colorMap = {
  orange: 'var(--color-accent-orange)',
  green: 'var(--color-accent-green)',
  cyan: 'var(--color-accent-cyan)',
  purple: 'var(--color-accent-purple)',
};

/**
 * Renders a skill category with title and items
 */
export const SkillSection: React.FC<SkillSectionProps> = ({ title, items, color }) => {
  return (
    <div className={styles.container}>
      <span className={styles.title}>{title}:</span>
      <span style={{ color: colorMap[color] }}>{items.join(', ')}</span>
    </div>
  );
};
