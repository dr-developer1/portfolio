/**
 * JobEntry Component
 *
 * Displays a work experience entry with role, company, location, dates, and description.
 */

import React from 'react';

import type { ExperienceItem } from '../../data/content';
import styles from './JobEntry.module.css';

export interface JobEntryProps {
  /** The job/experience data to display */
  job: ExperienceItem;
}

/**
 * Renders a single work experience entry
 */
export const JobEntry: React.FC<JobEntryProps> = ({ job }) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.role}>{job.role}</span>
        <span className={styles.date}>{job.date}</span>
      </div>
      <div className={styles.companySection}>
        <span className={styles.company}>@ {job.company}</span>
        <span className={styles.location}> | {job.location}</span>
      </div>
      <ul className={styles.descriptionList}>
        {job.description.map((desc, i) => (
          <li key={i} className={styles.descriptionItem}>
            {desc}
          </li>
        ))}
      </ul>
      {job.technologies && (
        <div className={styles.techSection}>
          <span className={styles.techLabel}>Tech: </span>
          <span className={styles.techItems}>{job.technologies.join(', ')}</span>
        </div>
      )}
    </div>
  );
};
