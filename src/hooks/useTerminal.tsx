import { useState, useCallback, useEffect } from 'react';
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
import { resolvePath, getNode, type FileSystemNode } from '../utils/fileSystem';
import { getStoredTheme, setStoredTheme, applyTheme, isValidTheme } from '../utils/themeService';

const MAX_TREE_DEPTH = 10;

const INITIAL_STATE: TerminalState = {
  history: [],
  commandHistory: [],
  historyIndex: -1,
  currentDirectory: '~',
  theme: getStoredTheme(),
  isLoading: false,
  matrixEnabled: localStorage.getItem('portfolio_matrix_effect') !== 'false',
};

/**
 * Render a directory tree recursively
 * Returns [lines, wasLimited] where wasLimited indicates if depth limit was reached
 */
function renderDirectoryTree(
  node: FileSystemNode,
  prefix: string = '',
  depth: number = 0,
  currentPath: string = ''
): [ReactNode[], boolean] {
  if (!node.children || depth >= MAX_TREE_DEPTH) {
    return [[], depth >= MAX_TREE_DEPTH];
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
        <span style={{ color: 'var(--color-text-muted)' }}>
          {prefix}
          {connector}
        </span>
        <span
          style={{
            color:
              child.type === 'directory' ? 'var(--color-accent-blue)' : 'var(--color-text-primary)',
            fontWeight: child.type === 'directory' ? 'bold' : 'normal',
          }}
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

/**
 * Custom hook for managing terminal state and actions
 */
export function useTerminal(): UseTerminalReturn {
  const [state, setState] = useState<TerminalState>(INITIAL_STATE);

  // Apply theme on mount
  useEffect(() => {
    const initialTheme = getStoredTheme();
    if (isValidTheme(initialTheme)) {
      applyTheme(initialTheme);
    }
  }, []); // Only on mount, updates handled eagerly by setters

  // Listen for theme and matrix change events from commands
  useEffect(() => {
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ theme: string }>;
      const newTheme = customEvent.detail.theme;
      if (isValidTheme(newTheme)) {
        // Apply theme immediately before state update to ensure DOM is ready for children
        applyTheme(newTheme);
        setStoredTheme(newTheme);
        setState((prev) => ({ ...prev, theme: newTheme }));
      }
    };

    const handleMatrixToggle = (e: Event) => {
      const customEvent = e as CustomEvent<{ enabled: boolean }>;
      setState((prev) => {
        const newState = customEvent.detail.enabled;
        localStorage.setItem('portfolio_matrix_effect', String(newState));
        return { ...prev, matrixEnabled: newState };
      });
    };

    window.addEventListener('theme-change', handleThemeChange);
    window.addEventListener('matrix-toggle', handleMatrixToggle);

    return () => {
      window.removeEventListener('theme-change', handleThemeChange);
      window.removeEventListener('matrix-toggle', handleMatrixToggle);
    };
  }, []);

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

      // Handle PWD command
      if (parsed.name === 'pwd') {
        const absolutePath = resolvePath(state.currentDirectory, '.');
        addOutput(<span>{absolutePath}</span>);
        return;
      }

      // Handle LS command
      if (parsed.name === 'ls') {
        const targetPath = resolvePath(state.currentDirectory, parsed.args[0] ?? '.');

        const node = getNode(targetPath);

        if (!node) {
          addOutput(
            <span style={{ color: 'var(--color-error)' }}>
              ls: cannot access '{parsed.args[0] ?? '.'}': No such file or directory
            </span>,
            'error'
          );
          return;
        }

        if (node.type === 'file') {
          addOutput(<span>{node.name}</span>);
          return;
        }

        // Directory - get children
        if (!node.children || node.children.size === 0) {
          // Empty directory
          return;
        }

        const entries = Array.from(node.children.entries()).sort((a, b) =>
          a[0].localeCompare(b[0])
        );

        addOutput(
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            {entries.map(([name, child]) => {
              const isDir = child.type === 'directory';
              return (
                <span
                  key={name}
                  style={{
                    color: isDir ? 'var(--color-accent-blue)' : 'var(--color-text-primary)',
                    fontWeight: isDir ? 'bold' : 'normal',
                  }}
                >
                  {name}
                  {isDir ? '/' : ''}
                </span>
              );
            })}
          </div>
        );
        return;
      }

      // Handle CD command
      if (parsed.name === 'cd') {
        const targetArg = parsed.args[0] || '~';
        const targetPath = resolvePath(state.currentDirectory, targetArg);
        const node = getNode(targetPath);

        if (!node) {
          addOutput(
            <span style={{ color: 'var(--color-error)' }}>
              cd: {targetArg}: No such file or directory
            </span>,
            'error'
          );
          return;
        }

        if (node.type !== 'directory') {
          addOutput(
            <span style={{ color: 'var(--color-error)' }}>cd: {targetArg}: Not a directory</span>,
            'error'
          );
          return;
        }

        setState((prev) => ({ ...prev, currentDirectory: targetPath }));
        return;
      }

      // Handle CAT command
      if (parsed.name === 'cat') {
        if (!parsed.args[0]) {
          addOutput(
            <span style={{ color: 'var(--color-error)' }}>Usage: cat [file]</span>,
            'error'
          );
          return;
        }

        const targetPath = resolvePath(state.currentDirectory, parsed.args[0]);
        const node = getNode(targetPath);

        if (!node) {
          addOutput(
            <span style={{ color: 'var(--color-error)' }}>
              cat: {parsed.args[0]}: No such file or directory
            </span>,
            'error'
          );
          return;
        }

        if (node.type === 'directory') {
          addOutput(
            <span style={{ color: 'var(--color-error)' }}>
              cat: {parsed.args[0]}: Is a directory
            </span>,
            'error'
          );
          return;
        }

        addOutput(<div style={{ whiteSpace: 'pre-wrap' }}>{node.content}</div>);
        return;
      }

      // Handle TREE command
      if (parsed.name === 'tree') {
        const rootPath = resolvePath(state.currentDirectory, parsed.args[0] || '.');

        const rootNode = getNode(rootPath);
        if (!rootNode || rootNode.type !== 'directory') {
          addOutput(
            <span style={{ color: 'var(--color-error)' }}>
              tree: {parsed.args[0] || '.'}: Not a directory
            </span>,
            'error'
          );
          return;
        }

        const rootLabel = rootPath === '/' ? '/' : rootPath.split('/').filter(Boolean).pop() || '/';

        const [treeLines, wasLimited] = renderDirectoryTree(rootNode);

        addOutput(
          <div>
            <div style={{ color: 'var(--color-accent-blue)', fontWeight: 'bold' }}>{rootLabel}</div>
            {treeLines}
            {wasLimited && (
              <div
                style={{ color: 'var(--color-text-muted)', fontSize: '0.9em', marginTop: '0.5rem' }}
              >
                Maximum depth reached ({MAX_TREE_DEPTH} levels) - some directories not shown
              </div>
            )}
          </div>
        );
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
   * Set the current theme
   */
  const setTheme: TerminalActions['setTheme'] = useCallback((theme: string) => {
    if (isValidTheme(theme)) {
      applyTheme(theme); // Apply immediately
      setStoredTheme(theme);
      setState((prev) => ({
        ...prev,
        theme,
      }));
    }
  }, []);

  /**
   * Set Matrix effect enabled state
   */
  const setMatrixEnabled: TerminalActions['setMatrixEnabled'] = useCallback((enabled: boolean) => {
    localStorage.setItem('portfolio_matrix_effect', String(enabled));
    setState((prev) => ({
      ...prev,
      matrixEnabled: enabled,
    }));
  }, []);

  return {
    ...state,
    addOutput,
    executeCommand,
    clearTerminal,
    navigateHistory,
    resetHistoryIndex,
    setCurrentDirectory,
    setTheme,
    setMatrixEnabled,
  };
}
