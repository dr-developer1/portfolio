import { getLocale } from '../i18n/locale';
import {
  getContent,
  type ExperienceItem,
  type ProjectItem,
  type EducationItem,
} from '../data/content';
import { getAllUsernames, getUserHomePath } from '../config';

export type NodeType = 'file' | 'directory';

export interface FileSystemNode {
  name: string;
  type: NodeType;
  content?: string;
  children?: Map<string, FileSystemNode>;
  parent?: FileSystemNode;
}

/**
 * Sanitize a string to be used as a filename
 * Handles accented characters by normalizing and removing diacritics
 */
function sanitizeFilename(name: string): string {
  const sanitized = name
    .toLowerCase()
    // Normalize Unicode to decompose accented characters (é → e + combining accent)
    .normalize('NFD')
    // Remove diacritical marks (combining accents)
    .replace(/[\u0300-\u036f]/g, '')
    // Replace any remaining non-alphanumeric characters with dashes
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading/trailing dashes
    .replace(/^-+|-+$/g, '');

  return sanitized || 'untitled';
}

/**
 * Create unique filenames by tracking counts and appending numbers for duplicates
 */
function createUniqueFilename(baseName: string, counts: Map<string, number>): string {
  const currentCount = (counts.get(baseName) ?? 0) + 1;
  counts.set(baseName, currentCount);
  return `${baseName}-${currentCount}.txt`;
}

/**
 * Initialize the file system from the content data
 */
function createFileSystem(): FileSystemNode {
  const root = createDirectory('/', null);
  const home = createDirectory('home', root);

  // Create user directories for all profiles (from centralized config)
  // Deduplicate to prevent map overwrites if usernames are not unique
  const users = Array.from(new Set(getAllUsernames()));

  users.forEach((username) => {
    const user = createDirectory(username, home);

    // ~ (Home) content
    createFile('bio.txt', user, formatBio());
    createFile('skills.txt', user, formatSkills());
    createFile('contact.md', user, formatContact());

    // Experience directory
    const expDir = createDirectory('experience', user);
    const expCounts = new Map<string, number>();
    getContent().experience.forEach((job) => {
      const baseName = sanitizeFilename(job.company);
      const filename = createUniqueFilename(baseName, expCounts);
      createFile(filename, expDir, formatExperience(job));
    });

    // Projects directory
    const projDir = createDirectory('projects', user);
    const projCounts = new Map<string, number>();
    getContent().projects.forEach((proj, index) => {
      const baseName = sanitizeFilename(getContent('en').projects[index].name);
      const filename = createUniqueFilename(baseName, projCounts);
      createFile(filename, projDir, formatProject(proj));
    });

    // Education directory
    const eduDir = createDirectory('education', user);
    const eduCounts = new Map<string, number>();
    getContent().education.forEach((edu, index) => {
      const baseName = sanitizeFilename(getContent('en').education[index].school);
      const filename = createUniqueFilename(baseName, eduCounts);
      createFile(filename, eduDir, formatEducation(edu));
    });
  });

  return root;
}

// Helper to create directory
function createDirectory(name: string, parent: FileSystemNode | null): FileSystemNode {
  const node: FileSystemNode = {
    name,
    type: 'directory',
    children: new Map(),
    parent: parent || undefined,
  };
  if (parent && parent.children) {
    parent.children.set(name, node);
  }
  return node;
}

// Helper to create file
function createFile(name: string, parent: FileSystemNode, content: string): FileSystemNode {
  const node: FileSystemNode = {
    name,
    type: 'file',
    content,
    parent,
  };
  if (parent.children) {
    parent.children.set(name, node);
  }
  return node;
}

// Formatters for content
function formatBio(): string {
  return `${getContent().bio.name}\n${getContent().bio.tagline}\n\n${getContent().bio.description.join('\n')}`;
}

function formatSkills(): string {
  const skills = getContent().skills;
  return `LANGUAGES:\n${skills.languages.join(', ')}\n\nFRAMEWORKS:\n${skills.frameworks.join(', ')}\n\nTOOLS:\n${skills.tools.join(', ')}\n\nSOFT SKILLS:\n${skills.softSkills.join(', ')}`;
}

function formatContact(): string {
  return getContent()
    .socials.map((s) => `${s.platform}: ${s.username} (${s.url})`)
    .join('\n');
}

function formatExperience(job: ExperienceItem): string {
  return (
    `ROLE: ${job.role}\n` +
    `COMPANY: ${job.company}\n` +
    `DATE: ${job.date}\n` +
    `LOCATION: ${job.location}\n\n` +
    `DETAILS:\n${job.description.map((detail: string) => `- ${detail}`).join('\n')}\n\n` +
    `TECH: ${job.technologies?.join(', ') || 'N/A'}`
  );
}

function formatProject(proj: ProjectItem): string {
  return `NAME: ${proj.name}\n\nDESCRIPTION:\n${proj.description}\n\nTECH: ${proj.technologies.join(', ')}\n\nURL: ${proj.url || 'N/A'}\nREPO: ${proj.repo || 'N/A'}`;
}

function formatEducation(edu: EducationItem): string {
  return `DEGREE: ${edu.degree}\nSCHOOL: ${edu.school}\nDATE: ${edu.date}\nLOCATION: ${edu.location}`;
}

// Cache the two localized trees; executable virtual paths stay stable.
const fileSystems = new Map([[getLocale(), createFileSystem()]]);
export const fileSystem = fileSystems.get(getLocale())!;

function currentFileSystem(): FileSystemNode {
  const locale = getLocale();
  if (!fileSystems.has(locale)) fileSystems.set(locale, createFileSystem());
  return fileSystems.get(locale)!;
}

/**
 * Normalize a path by removing multiple slashes and trailing slashes
 */
function normalizePath(path: string): string {
  if (!path) return '/';
  // Replace multiple slashes with single slash
  let normalized = path.replace(/\/+/g, '/');
  // Remove trailing slash unless it's root
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }
  return normalized || '/';
}

/**
 * Resolve a path string to an absolute path
 */
export function resolvePath(
  currentPath: string,
  targetPath: string,
  user: string = 'visitor'
): string {
  // Normalize currentPath to handle ~
  const normalizedCurrent = currentPath === '~' ? getUserHomePath(user) : currentPath;

  if (!targetPath) return normalizePath(normalizedCurrent);

  if (targetPath === '~') return getUserHomePath(user);
  if (targetPath.startsWith('~/'))
    return normalizePath(`${getUserHomePath(user)}/${targetPath.slice(2)}`);

  let parts: string[];
  if (targetPath.startsWith('/')) {
    parts = targetPath.split('/').filter(Boolean);
  } else {
    const currentParts = normalizedCurrent.split('/').filter(Boolean);
    const targetParts = targetPath.split('/').filter(Boolean);
    parts = [...currentParts, ...targetParts];
  }

  const resolvedStack: string[] = [];
  for (const part of parts) {
    if (part === '.') continue;
    if (part === '..') {
      resolvedStack.pop();
    } else {
      resolvedStack.push(part);
    }
  }

  return normalizePath('/' + resolvedStack.join('/'));
}

/**
 * Get a node at a resolved absolute path
 */
export function getNode(absolutePath: string): FileSystemNode | null {
  if (absolutePath === '/') return currentFileSystem();

  const parts = absolutePath.split('/').filter(Boolean);
  let current = currentFileSystem();

  for (const part of parts) {
    const children = current.children;
    if (!children) {
      return null;
    }
    const next = children.get(part);
    if (!next) {
      return null;
    }
    current = next;
  }

  return current;
}

/**
 * Get contents of a directory (names only)
 */
export function getDirectoryContents(absolutePath: string): string[] {
  const node = getNode(absolutePath);
  if (!node || node.type !== 'directory' || !node.children) {
    return [];
  }
  return Array.from(node.children.keys()).sort();
}
