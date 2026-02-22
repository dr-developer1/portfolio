/**
 * Tree Renderer Utility
 *
 * Renders a directory tree structure with proper indentation and connectors.
 */

import type { ReactNode } from 'react';

import type { FileSystemNode } from './fileSystem';
import { UI_CONSTANTS } from '../config';
import styles from '../styles/outputUtilities.module.css';

/**
 * Render a directory tree recursively
 * @param node - The filesystem node to render
 * @param prefix - The prefix string for indentation
 * @param depth - Current depth in the tree
 * @param currentPath - Current path for unique keys
 * @returns Tuple of [ReactNode array, wasDepthLimited boolean]
 */
export function renderDirectoryTree(
  node: FileSystemNode,
  prefix: string = '',
  depth: number = 0,
  currentPath: string = ''
): [ReactNode[], boolean] {
  if (!node.children || depth >= UI_CONSTANTS.MAX_TREE_DEPTH) {
    return [[], depth >= UI_CONSTANTS.MAX_TREE_DEPTH];
  }

  const entries = Array.from(node.children.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  const lines: ReactNode[] = [];
  let wasLimited = false;

  entries.forEach(([name, child], index) => {
    const isLast = index === entries.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    const childPrefix = prefix + (isLast ? '    ' : '│   ');
    const childPath = `${currentPath}/${name}`;

    lines.push(
      <div key={childPath}>
        <span className={styles.textMuted}>
          {prefix}
          {connector}
        </span>
        <span
          className={
            child.type === 'directory' ? `${styles.accentBlue} ${styles.bold}` : styles.textPrimary
          }
        >
          {name}
          {child.type === 'directory' ? '/' : ''}
        </span>
      </div>
    );

    if (child.type === 'directory') {
      const [childLines, childLimited] = renderDirectoryTree(
        child,
        childPrefix,
        depth + 1,
        childPath
      );
      lines.push(...childLines);
      if (childLimited) wasLimited = true;
    }
  });

  return [lines, wasLimited];
}
