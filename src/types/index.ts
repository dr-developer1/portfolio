import type { ReactNode } from 'react';

import type { BootMode } from './boot';
import type { PlaygroundPresetId } from './playground';

export type CommandCategory = 'core' | 'career' | 'projects' | 'playground' | 'fun' | 'system';

export type VisitorMode = 'standard' | 'recruiter' | 'engineer' | 'founder' | 'client';

export interface Achievement {
  id: string;
  title: string;
  description: string;
}

export interface VisitorProgress {
  visits: number;
  totalCommands: number;
  lastCommandAt: number | null;
  discoveredCommands: string[];
  hiddenCommands: string[];
  achievements: string[];
  unlockedVault: boolean;
  adminUnlocked: boolean;
  activePath: VisitorMode;
}

export interface GuidedPath {
  id: VisitorMode;
  label: string;
  summary: string;
  commands: string[];
}

/**
 * Represents the type of a terminal output line
 */
export type LineType = 'output' | 'error' | 'success' | 'warning' | 'info' | 'command';

/**
 * Represents a single line in the terminal output history
 */
export interface TerminalLine {
  id: string;
  content: ReactNode;
  type: LineType;
  timestamp: number;
}

/**
 * Represents a parsed command from user input
 */
export interface ParsedCommand {
  name: string;
  args: string[];
  raw: string;
}

/**
 * Context provided to commands for accessing terminal state
 */
export interface CommandContext {
  bootMode: BootMode;
  currentDirectory: string;
  commandHistory: string[];
  user: string;
  symbol: string;
  visitorMode: VisitorMode;
  visitorProgress: VisitorProgress;
  sessionStartedAt: number;
  clearTerminal: () => void;
  setCurrentDirectory: (path: string) => void;
  openPlayground: (preset?: PlaygroundPresetId) => void;
  closePlayground: () => void;
  setVisitorMode: (mode: VisitorMode) => void;
  setVisitorProgress: (progress: VisitorProgress) => void;
  setBootMode: (mode: BootMode) => void;
}

/**
 * Represents a command that can be executed in the terminal
 */
export interface Command {
  name: string;
  description: string;
  usage: string;
  category: CommandCategory;
  aliases?: string[];
  hidden?: boolean;
  featured?: boolean;
  execute: (
    args: string[],
    addOutput: OutputFunction,
    context: CommandContext
  ) => void | Promise<void>;
  autocomplete?: (partial: string) => string[];
}

/**
 * Function signature for adding output to the terminal
 */
export type OutputFunction = (content: ReactNode, type?: LineType) => void;

/**
 * Represents the current state of the terminal
 */
export interface TerminalState {
  /** History of output lines displayed in the terminal */
  history: TerminalLine[];
  /** History of commands entered by the user */
  commandHistory: string[];
  /** Index for navigating command history (-1 means not navigating) */
  historyIndex: number;
  /** Current virtual directory path */
  currentDirectory: string;
  /** Current theme name */
  theme: string;
  /** Whether a command is currently executing */
  isLoading: boolean;
  /** Whether the Matrix background effect is enabled */
  matrixEnabled: boolean;
  /** Whether background music is enabled */
  musicEnabled: boolean;
  /** Whether the user has interacted with the page (enables audio) */
  hasUserInteracted: boolean;
  /** Current boot mode (determines prompt style and permissions) */
  bootMode: BootMode;
  /** Whether the playground overlay is open */
  isPlaygroundOpen: boolean;
  /** Active visitor mode for guided flows */
  visitorMode: VisitorMode;
  /** Persisted visitor progress synced from localStorage */
  visitorProgress: VisitorProgress;
  /** Newly unlocked achievements emitted through React state */
  achievementFeed: Achievement[];
  /** Current input value in the terminal */
  input: string;
  /** Requested playground preset */
  playgroundPreset: PlaygroundPresetId;
  /** Timestamp when current app session started */
  sessionStartedAt: number;
}

/**
 * Actions available for the terminal
 */
export interface TerminalActions {
  /** Execute a command string */
  executeCommand: (input: string) => void;
  /** Set the current input value */
  setInput: (value: string) => void;
  /** Add output to the terminal */
  addOutput: OutputFunction;
  /** Clear the terminal output */
  clearTerminal: () => void;
  /** Navigate command history (direction: 1 | -1) */
  navigateHistory: (direction: 1 | -1) => string | null;
  /** Reset history navigation */
  resetHistoryIndex: () => void;
  /** Change the current directory */
  setCurrentDirectory: (path: string) => void;
  /** Change the theme */
  setTheme: (theme: string) => void;
  /** Toggle Matrix background effect */
  setMatrixEnabled: (enabled: boolean) => void;
  /** Toggle background music */
  setMusicEnabled: (enabled: boolean) => void;
  /** Mark that the user has interacted with the page */
  setUserInteracted: () => void;
  /** Set the boot mode (determines prompt style and permissions) */
  setBootMode: (mode: BootMode) => void;
  /** Open the coding playground overlay */
  openPlayground: (preset?: PlaygroundPresetId) => void;
  /** Close the coding playground overlay */
  closePlayground: () => void;
  /** Set the active guided visitor mode */
  setVisitorMode: (mode: VisitorMode) => void;
  /** Trim processed achievements from the transient feed */
  consumeAchievementFeed: (count?: number) => void;
}

/**
 * Combined terminal state and actions
 */
export interface UseTerminalReturn extends TerminalState, TerminalActions {
  christmasActive: boolean;
}

/**
 * Command registry type - maps command names to Command objects
 */
export type CommandRegistry = Map<string, Command>;

// Re-export BootMode for convenience
export type { BootMode } from './boot';
