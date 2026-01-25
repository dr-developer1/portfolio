import type { ReactNode } from 'react';

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
 * Represents a command that can be executed in the terminal
 */
export interface Command {
  name: string;
  description: string;
  usage: string;
  aliases?: string[];
  execute: (args: string[], addOutput: OutputFunction) => void | Promise<void>;
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
}

/**
 * Actions available for the terminal
 */
export interface TerminalActions {
  /** Execute a command string */
  executeCommand: (input: string) => void;
  /** Add output to the terminal */
  addOutput: OutputFunction;
  /** Clear the terminal output */
  clearTerminal: () => void;
  /** Navigate command history (direction: 1 for older, -1 for newer) */
  navigateHistory: (direction: 1 | -1) => string | null;
  /** Reset history navigation */
  resetHistoryIndex: () => void;
  /** Change the current directory */
  setCurrentDirectory: (path: string) => void;
  /** Change the theme */
  setTheme: (theme: string) => void;
}

/**
 * Combined terminal state and actions
 */
export interface UseTerminalReturn extends TerminalState, TerminalActions {}

/**
 * Command registry type - maps command names to Command objects
 */
export type CommandRegistry = Map<string, Command>;
