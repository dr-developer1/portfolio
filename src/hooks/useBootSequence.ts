/**
 * useBootSequence Hook
 *
 * State machine hook for managing the boot sequence animation.
 * Uses useReducer for predictable state transitions and handles
 * message timing with proper cleanup.
 *
 * @example
 * const { state, startBoot, skipBoot, messages } = useBootSequence();
 *
 * if (state.phase === 'waiting') {
 *   return <StartPrompt onStart={() => startBoot()} />;
 * }
 */

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';

import { BOOT_COMPLETE_DELAY, getBootMessages, getMessageDelay } from '../data/bootMessages';
import type { BootMode, BootState, UseBootSequenceReturn } from '../types/boot';

// ============================================================================
// State & Actions
// ============================================================================

type BootAction =
  | { type: 'START_BOOT'; mode: BootMode }
  | { type: 'NEXT_MESSAGE' }
  | { type: 'COMPLETE_BOOT' }
  | { type: 'SKIP_BOOT'; mode?: BootMode };

const initialState: BootState = {
  phase: 'waiting',
  mode: 'normal',
  currentMessageIndex: -1,
  userInteracted: false,
};

function bootReducer(state: BootState, action: BootAction): BootState {
  switch (action.type) {
    case 'START_BOOT':
      return {
        ...state,
        phase: 'booting',
        mode: action.mode,
        currentMessageIndex: 0,
        userInteracted: true,
      };

    case 'NEXT_MESSAGE':
      return {
        ...state,
        currentMessageIndex: state.currentMessageIndex + 1,
      };

    case 'COMPLETE_BOOT':
      return {
        ...state,
        phase: 'complete',
      };

    case 'SKIP_BOOT':
      return {
        ...state,
        mode: action.mode ?? state.mode,
        phase: 'complete',
        userInteracted: true,
      };

    default:
      return state;
  }
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Custom hook for managing boot sequence state and animations
 *
 * @returns Boot state, control functions, and current messages
 */
export function useBootSequence(): UseBootSequenceReturn {
  const [state, dispatch] = useReducer(bootReducer, initialState);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // Store messages in state to be render-safe (refs can't be accessed during render)
  const [messages, setMessages] = useState<ReturnType<typeof getBootMessages>>(() =>
    getBootMessages('normal')
  );

  /**
   * Start the boot sequence with optional mode override
   */
  const startBoot = useCallback((mode: BootMode = 'normal') => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Skip animation for users who prefer reduced motion
      dispatch({ type: 'SKIP_BOOT', mode });
      return;
    }

    // Generate messages ONCE at boot start (caches random failures)
    setMessages(getBootMessages(mode));
    dispatch({ type: 'START_BOOT', mode });
  }, []);

  /**
   * Skip directly to terminal (accessibility feature)
   */
  const skipBoot = useCallback(() => {
    // Clear any pending timeouts
    if (timeoutRef.current !== undefined) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }

    dispatch({ type: 'SKIP_BOOT' });
  }, []);

  // Handle message progression during boot phase
  useEffect(() => {
    const { phase, currentMessageIndex } = state;

    if (phase !== 'booting') return;

    // Check if we've shown all messages
    if (currentMessageIndex >= messages.length) {
      // Wait a bit before completing
      timeoutRef.current = setTimeout(() => {
        dispatch({ type: 'COMPLETE_BOOT' });
      }, BOOT_COMPLETE_DELAY);
      // Return cleanup to clear timeout if component unmounts or state changes
      return () => {
        if (timeoutRef.current !== undefined) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = undefined;
        }
      };
    }

    // Get delay for current message
    const currentMessage = messages[currentMessageIndex];
    const delay = getMessageDelay(currentMessage);

    // Schedule next message
    timeoutRef.current = setTimeout(() => {
      dispatch({ type: 'NEXT_MESSAGE' });
    }, delay);

    // Cleanup timeout on unmount or state change
    return () => {
      if (timeoutRef.current !== undefined) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
    };
  }, [state, messages]);

  return {
    state,
    startBoot,
    skipBoot,
    messages,
  };
}
