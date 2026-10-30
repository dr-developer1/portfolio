import React, { useRef, useState, useCallback, useMemo } from 'react';
import { useTerminalContext } from './TerminalContext';
import { getPromptConfig } from './useTerminal';
import { useTabCompletion } from './useTabCompletion';
import { SYSTEM_CONFIG } from '../config';
import { getCompletions } from '../utils/completionService';
import { playCommandFire, playKeyClick } from '../utils/soundService';
import { PromptDisplay } from '../components/Terminal/PromptDisplay';
import outputStyles from '../styles/outputUtilities.module.css';

/** Shared editing and command behavior; each surface owns its focus/viewport policy. */
export function useTerminalInput() {
  const {
    executeCommand,
    addOutput,
    clearTerminal,
    navigateHistory,
    resetHistoryIndex,
    currentDirectory,
    isLoading,
    bootMode,
    musicEnabled,
    isPlaygroundOpen,
    input,
    setInput,
  } = useTerminalContext();

  const inputRef = useRef<HTMLInputElement>(null);
  const shouldRefocusRef = useRef(false);
  const composingRef = useRef(false);

  const [selection, setSelection] = useState({
    value: input,
    start: input.length,
    end: input.length,
  });
  const [isComposing, setIsComposing] = useState(false);
  const cursorStart = selection.value === input ? selection.start : input.length;
  const cursorEnd = selection.value === input ? selection.end : input.length;

  const syncSelection = (element: HTMLInputElement) => {
    setSelection({
      value: element.value,
      start: element.selectionStart ?? element.value.length,
      end: element.selectionEnd ?? element.value.length,
    });
  };

  const moveCaretToEnd = () => {
    requestAnimationFrame(() => {
      const element = inputRef.current;
      if (!element) return;
      element.setSelectionRange(element.value.length, element.value.length);
      syncSelection(element);
    });
  };

  const { handleTabKey, resetCompletion } = useTabCompletion();
  const { user, symbol } = getPromptConfig(bootMode);
  const suggestion = useMemo(() => {
    if (isLoading || isComposing || !input.trim()) {
      return null;
    }

    return getCompletions(input, currentDirectory, user)?.matches[0] ?? null;
  }, [isLoading, isComposing, input, currentDirectory, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInput(newValue);
    syncSelection(e.target);
    resetHistoryIndex();
    resetCompletion();
    if (musicEnabled) {
      playKeyClick();
    }
  };

  const handleSelect = (e: React.SyntheticEvent<HTMLInputElement>) => {
    syncSelection(e.currentTarget);
  };

  const handleSubmit = useCallback(() => {
    const trimmedInput = input.trim();

    if (!trimmedInput) {
      addOutput(
        <PromptDisplay
          user={user}
          hostname={SYSTEM_CONFIG.hostname}
          directory={currentDirectory}
          symbol={symbol}
        />,
        'command'
      );
    } else {
      if (musicEnabled) {
        playCommandFire();
      }
      executeCommand(trimmedInput);
      shouldRefocusRef.current = true;
    }

    setInput('');
    resetCompletion();
  }, [
    input,
    executeCommand,
    addOutput,
    user,
    symbol,
    musicEnabled,
    currentDirectory,
    resetCompletion,
    setInput,
  ]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Enter and navigation belong to the input method until composition commits.
    if (composingRef.current || e.nativeEvent.isComposing || e.nativeEvent.keyCode === 229) return;

    if (e.key === 'Tab') {
      if (e.shiftKey) return;
      e.preventDefault();
      if (isLoading) return;

      const newInput = handleTabKey(input, currentDirectory, user);
      if (newInput !== null) {
        setInput(newInput);
        moveCaretToEnd();
      }
      return;
    }

    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
      resetCompletion();
      // Allow default behavior to move cursor in hidden input
      // onSelect mirrors the native selection after navigation.
      return;
    }

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        handleSubmit();
        break;

      case 'ArrowUp': {
        e.preventDefault();
        resetCompletion();
        const olderCommand = navigateHistory(1);
        if (olderCommand !== null) {
          setInput(olderCommand);
          moveCaretToEnd();
        }
        break;
      }

      case 'ArrowDown': {
        e.preventDefault();
        resetCompletion();
        const newerCommand = navigateHistory(-1);
        if (newerCommand !== null) {
          setInput(newerCommand);
          moveCaretToEnd();
        }
        break;
      }

      case 'c':
        if (e.ctrlKey) {
          // Preserve the browser's copy shortcut when text is selected.
          if (e.currentTarget.selectionStart !== e.currentTarget.selectionEnd) return;
          e.preventDefault();
          if (input) {
            addOutput(
              <PromptDisplay
                user={user}
                hostname={SYSTEM_CONFIG.hostname}
                directory={currentDirectory}
                symbol={symbol}
              >
                <span className={outputStyles.promptCommand}>{input}^C</span>
              </PromptDisplay>,
              'command'
            );
          } else {
            addOutput(
              <PromptDisplay
                user={user}
                hostname={SYSTEM_CONFIG.hostname}
                directory={currentDirectory}
                symbol={symbol}
              >
                <span className={outputStyles.promptCommand}>^C</span>
              </PromptDisplay>,
              'command'
            );
          }

          setInput('');
          resetHistoryIndex();
          resetCompletion();
        }
        break;

      case 'l':
        if (e.ctrlKey) {
          e.preventDefault();
          clearTerminal();
        }
        break;
    }
  };

  return {
    inputRef,
    shouldRefocusRef,
    input,
    currentDirectory,
    isLoading,
    isPlaygroundOpen,
    user,
    symbol,
    suggestion,
    cursorStart,
    cursorEnd,
    handleInputChange,
    handleSelect,
    handleKeyDown,
    handleCompositionStart: () => {
      composingRef.current = true;
      setIsComposing(true);
    },
    handleCompositionEnd: (event: React.CompositionEvent<HTMLInputElement>) => {
      composingRef.current = false;
      setIsComposing(false);
      syncSelection(event.currentTarget);
    },
  };
}
