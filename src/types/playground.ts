/**
 * Playground Types
 *
 * Shared types for the coding playground feature.
 */

export type PlaygroundLanguage = 'javascript' | 'typescript' | 'python';

export interface PlaygroundFile {
  id: string;
  name: string;
  language: PlaygroundLanguage;
  content: string;
}

export interface PlaygroundWorkspace {
  files: PlaygroundFile[];
  activeFileId: string;
  activeLanguage: PlaygroundLanguage;
}

export type PlaygroundOutputType = 'stdout' | 'stderr' | 'result' | 'status';

export interface PlaygroundOutputEntry {
  id: string;
  type: PlaygroundOutputType;
  message: string;
  timestamp: number;
}
