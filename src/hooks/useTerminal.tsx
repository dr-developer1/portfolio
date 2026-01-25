import { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type {
  TerminalState,
  TerminalActions,
  UseTerminalReturn,
  TerminalLine,
  LineType,
} from '../types';
import { parseCommand } from '../utils/commandParser';
import { generateLineId } from '../utils/helpers';
import { getCommand } from '../utils/commandRegistry';

const INITIAL_STATE: TerminalState = {
  history: [],
  commandHistory: [],
  historyIndex: -1,
  currentDirectory: '~',
  theme: 'dark',
  isLoading: false,
};

/**
 * Custom hook for managing terminal state and actions
 */
export function useTerminal(): UseTerminalReturn {
  const [state, setState] = useState<TerminalState>(INITIAL_STATE);

  /**
   * Add a line to the terminal output
   */
  const addOutput: TerminalActions['addOutput'] = useCallback(
    (content: ReactNode, type: LineType = 'output') => {
      const newLine: TerminalLine = {
        id: generateLineId(),
        content,
        type,
        timestamp: Date.now(),
      };

      setState((prev) => ({
        ...prev,
        history: [...prev.history, newLine],
      }));
    },
    []
  );

  /**
   * Execute a command string
   */
  const executeCommand: TerminalActions['executeCommand'] = useCallback(
    async (input: string) => {
      const trimmedInput = input.trim();

      // Don't process empty input
      if (!trimmedInput) {
        return;
      }

      // Add the command to history display (showing what user typed)
      addOutput(
        <span>
          <span style={{ color: 'var(--color-prompt-user)' }}>visitor</span>
          <span style={{ color: 'var(--color-text-muted)' }}>@</span>
          <span style={{ color: 'var(--color-prompt-host)' }}>portfolio</span>
          <span style={{ color: 'var(--color-text-muted)' }}>:</span>
          <span style={{ color: 'var(--color-prompt-path)' }}>{state.currentDirectory}</span>
          <span style={{ color: 'var(--color-accent-green)' }}>$ </span>
          <span style={{ color: 'var(--color-command)' }}>{trimmedInput}</span>
        </span>,
        'command'
      );

      // Add to command history (for up/down navigation)
      setState((prev) => ({
        ...prev,
        commandHistory: [...prev.commandHistory, trimmedInput],
        historyIndex: -1,
      }));

      // Parse the command
      const parsed = parseCommand(trimmedInput);

      if (!parsed.name) {
        return;
      }

      // Handle history command internally to access state
      if (parsed.name === 'history') {
        const historyOutput = state.commandHistory.map((cmd, index) => (
          <div key={index} style={{ color: 'var(--color-text-secondary)' }}>
            <span
              style={{
                color: 'var(--color-text-muted)',
                marginRight: '1rem',
                display: 'inline-block',
                width: '2rem',
                textAlign: 'right',
              }}
            >
              {index + 1}
            </span>
            {cmd}
          </div>
        ));

        addOutput(<div>{historyOutput}</div>);
        return;
      }

      // Look up the command
      const command = getCommand(parsed.name);

      if (!command) {
        // Command not found
        addOutput(
          <span>
            Command not found: <span style={{ color: 'var(--color-error)' }}>{parsed.name}</span>
            <br />
            Type '<span style={{ color: 'var(--color-accent-green)' }}>help</span>' to see available
            commands.
          </span>,
          'error'
        );
        return;
      }

      // Execute the command
      setState((prev) => ({ ...prev, isLoading: true }));

      try {
        await command.execute(parsed.args, addOutput);
      } catch (error) {
        addOutput(
          <span style={{ color: 'var(--color-error)' }}>
            Error executing command: {error instanceof Error ? error.message : 'Unknown error'}
          </span>,
          'error'
        );
      } finally {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [addOutput, state.currentDirectory, state.commandHistory]
  );

  /**
   * Clear the terminal output
   */
  const clearTerminal: TerminalActions['clearTerminal'] = useCallback(() => {
    setState((prev) => ({
      ...prev,
      history: [],
    }));
  }, []);

  /**
   * Navigate through command history
   */
  const navigateHistory: TerminalActions['navigateHistory'] = useCallback(
    (direction: 1 | -1) => {
      const { commandHistory, historyIndex } = state;

      if (commandHistory.length === 0) {
        return null;
      }

      let newIndex: number;

      if (direction === 1) {
        // Going back (older commands)
        if (historyIndex === -1) {
          newIndex = commandHistory.length - 1;
        } else {
          newIndex = Math.max(0, historyIndex - 1);
        }
      } else {
        // Going forward (newer commands)
        if (historyIndex === -1) {
          return null;
        }
        newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setState((prev) => ({ ...prev, historyIndex: -1 }));
          return '';
        }
      }

      setState((prev) => ({ ...prev, historyIndex: newIndex }));
      return commandHistory[newIndex] ?? null;
    },
    [state]
  );

  /**
   * Reset history navigation index
   */
  const resetHistoryIndex: TerminalActions['resetHistoryIndex'] = useCallback(() => {
    setState((prev) => ({ ...prev, historyIndex: -1 }));
  }, []);

  /**
   * Set current directory
   */
  const setCurrentDirectory: TerminalActions['setCurrentDirectory'] = useCallback(
    (path: string) => {
      setState((prev) => ({ ...prev, currentDirectory: path }));
    },
    []
  );

  /**
   * Set theme
   */
  const setTheme: TerminalActions['setTheme'] = useCallback((theme: string) => {
    setState((prev) => ({ ...prev, theme }));
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  return {
    ...state,
    executeCommand,
    addOutput,
    clearTerminal,
    navigateHistory,
    resetHistoryIndex,
    setCurrentDirectory,
    setTheme,
  };
}
