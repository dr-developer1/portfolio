import { useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type {
  Achievement,
  VisitorProgress,
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
import { getStoredTheme, setStoredTheme, applyTheme, isValidTheme } from '../utils/themeService';
import { getUserProfile, SYSTEM_CONFIG } from '../config';
import { MATRIX_STORAGE_KEY, MUSIC_STORAGE_KEY } from './storageKeys';
import { getStoredBoolean, setStoredBoolean } from '../utils/storageHelpers';
import { PromptDisplay } from '../components/Terminal/PromptDisplay';
import {
  getVisitorProgress,
  recordCommandExecution,
  setActivePath,
  trackVisit,
} from '../utils/progressService';
import styles from '../styles/outputUtilities.module.css';

const SESSION_STARTED_AT = Date.now();
const INITIAL_PROGRESS = getVisitorProgress();

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
  visitorMode: INITIAL_PROGRESS.activePath,
  visitorProgress: INITIAL_PROGRESS,
  achievementFeed: [],
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

  const appendAchievementFeed = useCallback((unlocked: Achievement[]) => {
    if (unlocked.length === 0) {
      return;
    }

    setState((prev) => ({
      ...prev,
      achievementFeed: [...prev.achievementFeed, ...unlocked],
    }));
  }, []);

  const consumeAchievementFeed = useCallback((count?: number) => {
    setState((prev) => {
      if (prev.achievementFeed.length === 0) {
        return prev;
      }

      const amount = Math.max(
        0,
        Math.min(count ?? prev.achievementFeed.length, prev.achievementFeed.length)
      );
      if (amount === 0) {
        return prev;
      }

      return {
        ...prev,
        achievementFeed: prev.achievementFeed.slice(amount),
      };
    });
  }, []);

  const setVisitorProgress = useCallback((progress: VisitorProgress) => {
    setState((prev) => ({
      ...prev,
      visitorProgress: progress,
      visitorMode: progress.activePath,
    }));
  }, []);

  // Apply theme on mount
  useEffect(() => {
    const initialTheme = getStoredTheme();
    if (isValidTheme(initialTheme)) {
      applyTheme(initialTheme);
    }

    const progress = trackVisit();
    setState((prev) => ({
      ...prev,
      visitorProgress: progress,
      visitorMode: progress.activePath,
    }));
  }, []);

  // Listen for theme and matrix change events from commands
  useEffect(() => {
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ theme: string }>;
      const newTheme = customEvent.detail.theme;
      if (isValidTheme(newTheme)) {
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
   * Clear the terminal output
   */
  const clearTerminal: TerminalActions['clearTerminal'] = useCallback(() => {
    setState((prev) => ({
      ...prev,
      history: [],
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
    const progress = setActivePath(mode);
    setState((prev) => ({
      ...prev,
      visitorMode: mode,
      visitorProgress: progress,
    }));
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
   * Execute a command string
   */
  const executeCommand: TerminalActions['executeCommand'] = useCallback(
    async (input: string) => {
      const trimmedInput = input.trim();

      if (!trimmedInput) {
        return;
      }

      const { user, symbol } = getPromptConfig(state.bootMode);
      const nextCommandHistory = [...state.commandHistory, trimmedInput];

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

      setState((prev) => ({
        ...prev,
        commandHistory: nextCommandHistory,
        historyIndex: -1,
      }));

      const parsed = parseCommand(trimmedInput);
      if (!parsed.name) {
        return;
      }

      const command = getCommand(parsed.name);

      if (!command) {
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

      setState((prev) => ({ ...prev, isLoading: true }));

      try {
        const context = {
          bootMode: state.bootMode,
          currentDirectory: state.currentDirectory,
          commandHistory: nextCommandHistory,
          user,
          symbol,
          visitorMode: state.visitorMode,
          visitorProgress: state.visitorProgress,
          sessionStartedAt: state.sessionStartedAt,
          clearTerminal,
          setCurrentDirectory,
          openPlayground,
          closePlayground,
          setVisitorMode,
          setVisitorProgress,
          setBootMode,
        };

        await command.execute(parsed.args, addOutput, context);

        const { progress, unlocked } = recordCommandExecution(
          command.name,
          Boolean(command.hidden)
        );
        setVisitorProgress(progress);
        appendAchievementFeed(unlocked);
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
      state.bootMode,
      state.commandHistory,
      state.currentDirectory,
      state.sessionStartedAt,
      state.visitorMode,
      state.visitorProgress,
      clearTerminal,
      setCurrentDirectory,
      openPlayground,
      closePlayground,
      setVisitorMode,
      setVisitorProgress,
      setBootMode,
      appendAchievementFeed,
    ]
  );

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
        if (historyIndex === -1) {
          newIndex = commandHistory.length - 1;
        } else {
          newIndex = Math.max(0, historyIndex - 1);
        }
      } else {
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
   * Set the current theme
   */
  const setTheme: TerminalActions['setTheme'] = useCallback((theme: string) => {
    if (isValidTheme(theme)) {
      applyTheme(theme);
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
    consumeAchievementFeed,
  };
}
