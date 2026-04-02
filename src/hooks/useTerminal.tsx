import { useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type {
  Achievement,
  TerminalState,
  TerminalActions,
  UseTerminalReturn,
  TerminalLine,
  LineType,
  BootMode,
} from '../types';
import { parseCommand } from '../utils/commandParser';
import { generateLineId } from '../utils/helpers';
import { getCommand } from '../utils/commandRegistry';
import { resolvePath, getNode } from '../utils/fileSystem';
import { getStoredTheme, setStoredTheme, applyTheme, isValidTheme } from '../utils/themeService';
import { getUserProfile, UI_CONSTANTS, SYSTEM_CONFIG } from '../config';
import { MATRIX_STORAGE_KEY, MUSIC_STORAGE_KEY } from './storageKeys';
import { getStoredBoolean, setStoredBoolean } from '../utils/storageHelpers';
import { renderDirectoryTree } from '../utils/treeRenderer';
import { PromptDisplay } from '../components/Terminal/PromptDisplay';
import {
  getVisitorProgress,
  recordCommandExecution,
  setActivePath,
  trackVisit,
} from '../utils/progressService';
import styles from '../styles/outputUtilities.module.css';

const SESSION_STARTED_AT = Date.now();

const INITIAL_STATE: TerminalState = {
  history: [],
  commandHistory: [],
  historyIndex: -1,
  currentDirectory: '~',
  theme: getStoredTheme(),
  isLoading: false,
  matrixEnabled: getStoredBoolean(MATRIX_STORAGE_KEY, true),
  musicEnabled: getStoredBoolean(MUSIC_STORAGE_KEY, true),
  hasUserInteracted: false,
  bootMode: 'normal',
  isPlaygroundOpen: false,
  visitorMode: getVisitorProgress().activePath,
  input: '',
  playgroundPreset: 'default',
  sessionStartedAt: SESSION_STARTED_AT,
};

/**
 * Get prompt user and symbol for a given boot mode
 */
export function getPromptConfig(mode: BootMode): { user: string; symbol: string } {
  const profile = getUserProfile(mode);
  return { user: profile.username, symbol: profile.symbol };
}

/**
 * Custom hook for managing terminal state and actions
 */
export function useTerminal(): UseTerminalReturn {
  const [state, setState] = useState<TerminalState>(INITIAL_STATE);

  const emitAchievementEvents = useCallback((unlocked: Achievement[]) => {
    unlocked.forEach((achievement) => {
      window.dispatchEvent(new CustomEvent<Achievement>('achievement-unlocked', { detail: achievement }));
    });
  }, []);

  // Apply theme on mount
  useEffect(() => {
    const initialTheme = getStoredTheme();
    if (isValidTheme(initialTheme)) {
      applyTheme(initialTheme);
    }
    trackVisit();
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
      const enabled = customEvent.detail.enabled;
      setStoredBoolean(MATRIX_STORAGE_KEY, enabled);
      setState((prev) => ({
        ...prev,
        matrixEnabled: enabled,
      }));
    };

    const handleMusicToggle = (e: Event) => {
      const customEvent = e as CustomEvent<{ enabled: boolean }>;
      const enabled = customEvent.detail.enabled;
      setStoredBoolean(MUSIC_STORAGE_KEY, enabled);
      setState((prev) => ({
        ...prev,
        musicEnabled: enabled,
      }));
    };

    window.addEventListener('theme-change', handleThemeChange);
    window.addEventListener('matrix-toggle', handleMatrixToggle);
    window.addEventListener('music-toggle', handleMusicToggle);

    return () => {
      window.removeEventListener('theme-change', handleThemeChange);
      window.removeEventListener('matrix-toggle', handleMatrixToggle);
      window.removeEventListener('music-toggle', handleMusicToggle);
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
   * Open the playground overlay
   */
  const openPlayground: TerminalActions['openPlayground'] = useCallback((preset = 'default') => {
    setState((prev) => ({
      ...prev,
      isPlaygroundOpen: true,
      playgroundPreset: preset,
    }));
  }, []);

  /**
   * Close the playground overlay
   */
  const closePlayground: TerminalActions['closePlayground'] = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isPlaygroundOpen: false,
    }));
  }, []);

  /**
   * Set the boot mode (determines prompt style and permissions)
   */
  const setBootMode: TerminalActions['setBootMode'] = useCallback((mode: BootMode) => {
    setState((prev) => ({
      ...prev,
      bootMode: mode,
    }));
  }, []);

  /**
   * Set the active guided visitor mode
   */
  const setVisitorMode: TerminalActions['setVisitorMode'] = useCallback((mode) => {
    setActivePath(mode);
    setState((prev) => ({
      ...prev,
      visitorMode: mode,
    }));
  }, []);

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

      // Get prompt configuration for current boot mode
      const { user, symbol } = getPromptConfig(state.bootMode);

      // Add the command to history display (showing what user typed)
      addOutput(
        <PromptDisplay
          user={user}
          hostname={SYSTEM_CONFIG.hostname}
          directory={state.currentDirectory}
          symbol={symbol}
        >
          <span className={styles.promptCommand}>{trimmedInput}</span>
        </PromptDisplay>,
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

      const trackInternalCommand = () => {
        const { unlocked } = recordCommandExecution(parsed.name, false);
        emitAchievementEvents(unlocked);
      };

      // Handle history command internally to access state
      if (parsed.name === 'history') {
        const historyOutput = state.commandHistory.map((cmd, index) => (
          <div key={index} className={styles.textSecondary}>
            <span className={`${styles.textMuted} ${styles.historyIndex}`}>{index + 1}</span>
            {cmd}
          </div>
        ));

        addOutput(<div>{historyOutput}</div>);
        trackInternalCommand();
        return;
      }

      // Handle PWD command
      if (parsed.name === 'pwd') {
        const { user } = getPromptConfig(state.bootMode);
        const absolutePath = resolvePath(state.currentDirectory, '.', user);
        addOutput(<span>{absolutePath}</span>);
        trackInternalCommand();
        return;
      }

      // Handle LS command
      if (parsed.name === 'ls') {
        const { user } = getPromptConfig(state.bootMode);
        const targetPath = resolvePath(state.currentDirectory, parsed.args[0] ?? '.', user);

        const node = getNode(targetPath);

        if (!node) {
          addOutput(
            <span className={styles.error}>
              ls: cannot access '{parsed.args[0] ?? '.'}': No such file or directory
            </span>,
            'error'
          );
          trackInternalCommand();
          return;
        }

        if (node.type === 'file') {
          addOutput(<span>{node.name}</span>);
          trackInternalCommand();
          return;
        }

        // Directory - get children
        if (!node.children || node.children.size === 0) {
          // Empty directory
          trackInternalCommand();
          return;
        }

        const entries = Array.from(node.children.entries()).sort((a, b) =>
          a[0].localeCompare(b[0])
        );

        addOutput(
          <div className={styles.flexRowGap}>
            {entries.map(([name, child]) => {
              const isDir = child.type === 'directory';
              return (
                <span
                  key={name}
                  className={isDir ? `${styles.accentBlue} ${styles.bold}` : styles.textPrimary}
                >
                  {name}
                  {isDir ? '/' : ''}
                </span>
              );
            })}
          </div>
        );
        trackInternalCommand();
        return;
      }

      // Handle CD command
      if (parsed.name === 'cd') {
        const { user } = getPromptConfig(state.bootMode);
        const targetArg = parsed.args[0] || '~';
        const targetPath = resolvePath(state.currentDirectory, targetArg, user);
        const node = getNode(targetPath);

        if (!node) {
          addOutput(
            <span className={styles.error}>cd: {targetArg}: No such file or directory</span>,
            'error'
          );
          trackInternalCommand();
          return;
        }

        if (node.type !== 'directory') {
          addOutput(
            <span className={styles.error}>cd: {targetArg}: Not a directory</span>,
            'error'
          );
          trackInternalCommand();
          return;
        }

        setState((prev) => ({ ...prev, currentDirectory: targetPath }));
        trackInternalCommand();
        return;
      }

      // Handle CAT command
      if (parsed.name === 'cat') {
        if (!parsed.args[0]) {
          addOutput(<span className={styles.error}>Usage: cat [file]</span>, 'error');
          trackInternalCommand();
          return;
        }

        const { user } = getPromptConfig(state.bootMode);
        const targetPath = resolvePath(state.currentDirectory, parsed.args[0], user);
        const node = getNode(targetPath);

        if (!node) {
          addOutput(
            <span className={styles.error}>cat: {parsed.args[0]}: No such file or directory</span>,
            'error'
          );
          trackInternalCommand();
          return;
        }

        if (node.type === 'directory') {
          addOutput(
            <span className={styles.error}>cat: {parsed.args[0]}: Is a directory</span>,
            'error'
          );
          trackInternalCommand();
          return;
        }

        addOutput(<div className={styles.textPreWrap}>{node.content}</div>);
        trackInternalCommand();
        return;
      }

      // Handle TREE command
      if (parsed.name === 'tree') {
        const { user } = getPromptConfig(state.bootMode);
        const rootPath = resolvePath(state.currentDirectory, parsed.args[0] || '.', user);

        const rootNode = getNode(rootPath);
        if (!rootNode || rootNode.type !== 'directory') {
          addOutput(
            <span className={styles.error}>tree: {parsed.args[0] || '.'}: Not a directory</span>,
            'error'
          );
          trackInternalCommand();
          return;
        }

        const rootLabel = rootPath === '/' ? '/' : rootPath.split('/').filter(Boolean).pop() || '/';

        const [treeLines, wasLimited] = renderDirectoryTree(rootNode);

        addOutput(
          <div>
            <div className={`${styles.accentBlue} ${styles.bold}`}>{rootLabel}</div>
            {treeLines}
            {wasLimited && (
              <div className={`${styles.textMuted} ${styles.textSmall} ${styles.marginTopMedium}`}>
                Maximum depth reached ({UI_CONSTANTS.MAX_TREE_DEPTH} levels) - some directories not
                shown
              </div>
            )}
          </div>
        );
        trackInternalCommand();
        return;
      }

      // Look up the command
      const command = getCommand(parsed.name);

      if (!command) {
        // Command not found
        addOutput(
          <span>
            Command not found: <span className={styles.error}>{parsed.name}</span>
            <br />
            Type '<span className={styles.accentGreen}>help</span>' to see available commands.
          </span>,
          'error'
        );
        return;
      }

      // Execute the command with context
      setState((prev) => ({ ...prev, isLoading: true }));

      try {
        const { user, symbol } = getPromptConfig(state.bootMode);
        const context = {
          bootMode: state.bootMode,
          currentDirectory: state.currentDirectory,
          user,
          symbol,
          visitorMode: state.visitorMode,
          sessionStartedAt: state.sessionStartedAt,
          openPlayground,
          closePlayground,
          setVisitorMode,
          setBootMode,
        };
        await command.execute(parsed.args, addOutput, context);

        const { unlocked } = recordCommandExecution(command.name, Boolean(command.hidden));
        emitAchievementEvents(unlocked);
      } catch (error) {
        addOutput(
          <span className={styles.error}>
            Error executing command: {error instanceof Error ? error.message : 'Unknown error'}
          </span>,
          'error'
        );
      } finally {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [
      addOutput,
      state.currentDirectory,
      state.commandHistory,
      state.bootMode,
      state.visitorMode,
      state.sessionStartedAt,
      openPlayground,
      closePlayground,
      setVisitorMode,
      setBootMode,
      emitAchievementEvents,
    ]
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
    setStoredBoolean(MATRIX_STORAGE_KEY, enabled);
    setState((prev) => ({
      ...prev,
      matrixEnabled: enabled,
    }));
  }, []);

  /**
   * Set background music enabled state
   */
  const setMusicEnabled: TerminalActions['setMusicEnabled'] = useCallback((enabled: boolean) => {
    setStoredBoolean(MUSIC_STORAGE_KEY, enabled);
    setState((prev) => ({
      ...prev,
      musicEnabled: enabled,
    }));
  }, []);

  /**
   * Mark that the user has interacted with the page (enables audio)
   */
  const setUserInteracted: TerminalActions['setUserInteracted'] = useCallback(() => {
    setState((prev) => ({
      ...prev,
      hasUserInteracted: true,
    }));
  }, []);

  /**
   * Set the current input value
   */
  const setInput: TerminalActions['setInput'] = useCallback((value: string) => {
    setState((prev) => ({
      ...prev,
      input: value,
    }));
  }, []);

  return {
    ...state,
    addOutput,
    executeCommand,
    setInput,
    clearTerminal,
    navigateHistory,
    resetHistoryIndex,
    setCurrentDirectory,
    setTheme,
    setMatrixEnabled,
    setMusicEnabled,
    setUserInteracted,
    setBootMode,
    openPlayground,
    closePlayground,
    setVisitorMode,
  };
}
