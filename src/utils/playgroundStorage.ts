/**
 * Playground Storage Utilities
 */

import type { PlaygroundLanguage, PlaygroundWorkspace } from '../types/playground';
import { PLAYGROUND_STORAGE_KEY } from '../hooks/storageKeys';

const VALID_LANGUAGES: ReadonlyArray<PlaygroundLanguage> = ['javascript', 'typescript', 'python'];

function isPlaygroundLanguage(value: unknown): value is PlaygroundLanguage {
  return typeof value === 'string' && VALID_LANGUAGES.includes(value as PlaygroundLanguage);
}

function isValidWorkspace(value: unknown): value is PlaygroundWorkspace {
  if (!value || typeof value !== 'object') return false;
  const workspace = value as PlaygroundWorkspace;

  if (!Array.isArray(workspace.files) || workspace.files.length === 0) return false;
  if (typeof workspace.activeFileId !== 'string') return false;
  if (!isPlaygroundLanguage(workspace.activeLanguage)) return false;

  for (const file of workspace.files) {
    if (!file || typeof file !== 'object') return false;
    if (typeof file.id !== 'string') return false;
    if (typeof file.name !== 'string') return false;
    if (typeof file.content !== 'string') return false;
    if (!isPlaygroundLanguage(file.language)) return false;
  }

  return workspace.files.some((file) => file.id === workspace.activeFileId);
}

export function loadPlaygroundWorkspace(): PlaygroundWorkspace | null {
  try {
    const raw = localStorage.getItem(PLAYGROUND_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return isValidWorkspace(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function savePlaygroundWorkspace(workspace: PlaygroundWorkspace): void {
  try {
    localStorage.setItem(PLAYGROUND_STORAGE_KEY, JSON.stringify(workspace));
  } catch {
    // ignore storage failures
  }
}
