import { text, useLocale } from '../../i18n/locale';
/**
 * ProjectCard Component
 *
 * Displays a project entry with name, description, technologies, and links.
 */

import React from 'react';

import type { ProjectItem } from '../../data/content';
import styles from './ProjectCard.module.css';

export interface ProjectCardProps {
  /** The project data to display */
  project: ProjectItem;
}

/**
 * Renders a single project card
 */
export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const locale = useLocale();
  return (
    <div>
      <div className={styles.header}>
        <span className={styles.name}>{project.name}</span>
        {project.featured && (
          <span className={styles.badge}>{text('Featured', 'À découvrir', locale)}</span>
        )}
        {project.url && (
          <a href={project.url} target="_blank" rel="noopener noreferrer" className={styles.link}>
            {text('Live demo', 'Démo', locale)}
          </a>
        )}
        {project.repo && (
          <a href={project.repo} target="_blank" rel="noopener noreferrer" className={styles.link}>
            {text('Source code', 'Code source', locale)}
          </a>
        )}
      </div>
      <div className={styles.description}>{project.description}</div>
      {project.impact && <div className={styles.impact}>{project.impact}</div>}
      <div className={styles.technologies}>[{project.technologies.join(', ')}]</div>
    </div>
  );
};
