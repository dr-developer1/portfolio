/**
 * EducationEntry Component
 *
 * Displays an education history entry with school, degree, location, and dates.
 */

import React from 'react';

import type { EducationItem } from '../../data/content';
import styles from './EducationEntry.module.css';

export interface EducationEntryProps {
  /** The education data to display */
  education: EducationItem;
}

/**
 * Renders a single education entry
 */
export const EducationEntry: React.FC<EducationEntryProps> = ({ education }) => {
  return (
    <div>
      <div className={styles.header}>
        <span className={styles.school}>{education.school}</span>
        <span className={styles.date}>{education.date}</span>
      </div>
      <div className={styles.degree}>{education.degree}</div>
      <div className={styles.location}>{education.location}</div>
    </div>
  );
};
