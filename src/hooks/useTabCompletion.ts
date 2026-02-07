/**
 * useTabCompletion Hook
 *
 * Manages tab completion state and cycling through completion matches.
 * Handles the complex logic of replacing partial input with completion matches.
 */

import { useState, useCallback } from 'react';

import { getCompletions } from '../utils/completionService';

/**
 * Completion state tracking
 */
export interface CompletionState {
  /** The original input when tab was first pressed */
  originalInput: string;
  /** The partial text being completed (e.g., "te" in "ls te") */
  completionPrefix: string;
  /** Array of possible completion matches */
  matches: string[];
  /** Current index in the matches array */
  index: number;
}

export interface UseTabCompletionReturn {
  /** Current completion state */
  completionState: CompletionState | null;
  /** Handle Tab key press */
  handleTabKey: (input: string, currentDirectory: string, user: string) => string | null;
  /** Reset completion state */
  resetCompletion: () => void;
}

/**
 * Custom hook for managing tab completion
 */
export function useTabCompletion(): UseTabCompletionReturn {
  const [completionState, setCompletionState] = useState<CompletionState | null>(null);

  const handleTabKey = useCallback(
    (input: string, currentDirectory: string, user: string): string | null => {
      // If already cycling through completions
      if (completionState && completionState.matches.length > 0) {
        const nextIndex = (completionState.index + 1) % completionState.matches.length;
        const nextMatch = completionState.matches[nextIndex];

        // Replace the completion part in the original input
        const prefix =
          completionState.completionPrefix.length > 0
            ? completionState.originalInput.slice(0, -completionState.completionPrefix.length)
            : completionState.originalInput;
        const newInput = prefix + nextMatch;

        setCompletionState({
          ...completionState,
          index: nextIndex,
        });

        return newInput;
      }

      // Start new completion
      const result = getCompletions(input, currentDirectory, user);

      if (result && result.matches.length > 0) {
        // Use the first match
        const firstMatch = result.matches[0];

        // Calculate the prefix (input without the partial part)
        const prefix = result.original.length > 0 ? input.slice(0, -result.original.length) : input;
        const newInput = prefix + firstMatch;

        // Initialize completion state
        setCompletionState({
          originalInput: input,
          completionPrefix: result.original,
          matches: result.matches,
          index: 0,
        });

        return newInput;
      }

      return null;
    },
    [completionState]
  );

  const resetCompletion = useCallback(() => {
    setCompletionState(null);
  }, []);

  return {
    completionState,
    handleTabKey,
    resetCompletion,
  };
}
