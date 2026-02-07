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
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.name}>{project.name}</span>
        {project.url && (
          <a href={project.url} target="_blank" rel="noopener noreferrer" className={styles.link}>
            Live Demo
          </a>
        )}
        {project.repo && (
          <a href={project.repo} target="_blank" rel="noopener noreferrer" className={styles.link}>
            Source Code
          </a>
        )}
      </div>
      <div className={styles.description}>{project.description}</div>
      <div className={styles.technologies}>[{project.technologies.join(', ')}]</div>
    </div>
  );
};
