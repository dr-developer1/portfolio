import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTerminalContext } from '../../hooks/TerminalContext';
import { getCompletions } from '../../utils/completionService';
import { getPromptConfig } from '../../hooks/useTerminal';
import styles from './TerminalInput.module.css';

export const TerminalInput: React.FC = () => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [cursorPos, setCursorPos] = useState(0);
  // Track whether we should restore focus when loading completes
  const shouldRefocusRef = useRef(false);

  // State for tab completion cycling
  const [completionState, setCompletionState] = useState<{
    originalInput: string;
    completionPrefix: string; // The partial text being completed (e.g. "te" in "ls te")
    matches: string[];
    index: number;
  } | null>(null);

  const {
    executeCommand,
    clearTerminal,
    navigateHistory,
    resetHistoryIndex,
    currentDirectory,
    isLoading,
    bootMode,
  } = useTerminalContext();

  // Get dynamic prompt configuration based on boot mode
  const { user, symbol } = getPromptConfig(bootMode);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setCursorPos(e.target.selectionStart || 0);
    resetHistoryIndex();
    // Reset completion state on any input change that isn't from tab
    setCompletionState(null);
  };

  const handleSubmit = useCallback(() => {
    const trimmedInput = input.trim();

    // Handle clear command specially (needs to clear output)
    if (
      trimmedInput.toLowerCase() === 'clear' ||
      trimmedInput.toLowerCase() === 'cls' ||
      trimmedInput.toLowerCase() === 'reset'
    ) {
      clearTerminal();
      setInput('');
      setCursorPos(0);
      setCompletionState(null);
      // Ensure focus returns after clearing
      requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }

    if (trimmedInput) {
      executeCommand(trimmedInput);
      // Mark that we should restore focus when loading completes
      shouldRefocusRef.current = true;
    }

    setInput('');
    setCursorPos(0);
    setCompletionState(null);
  }, [input, executeCommand, clearTerminal]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If pressing Tab
    if (e.key === 'Tab') {
      e.preventDefault();

      if (isLoading) return;

      // If already cycling through completions
      if (completionState && completionState.matches.length > 0) {
        const nextIndex = (completionState.index + 1) % completionState.matches.length;
        const nextMatch = completionState.matches[nextIndex];

        // Replace the completion part in the original input
        // This is a bit tricky: we need to replace the *last* occurrence or the specific part
        // Simplification: We assume we are appending/replacing the end

        // Actually, better approach:
        // We know the "originalInput" when we started tabbing.
        // We know the "matchToComplete" (the partial string).
        // We can reconstruct the input.

        // Find where the partial string was in the original input
        // Note: This logic assumes we are completing at the end of the string
        // For a more robust solution we'd need cursor position from start

        const prefix =
          completionState.completionPrefix.length > 0
            ? completionState.originalInput.slice(0, -completionState.completionPrefix.length)
            : completionState.originalInput;
        const newInput = prefix + nextMatch;

        setInput(newInput);
        setCompletionState({
          ...completionState,
          index: nextIndex,
        });

        // Move cursor to end
        requestAnimationFrame(() => {
          if (inputRef.current) {
            inputRef.current.setSelectionRange(newInput.length, newInput.length);
            setCursorPos(newInput.length);
          }
        });
        return;
      }

      // Start new completion
      const result = getCompletions(input, currentDirectory);

      if (result && result.matches.length > 0) {
        // Use the first match
        const firstMatch = result.matches[0];

        // Calculate the prefix (input without the partial part)
        const prefix = result.original.length > 0 ? input.slice(0, -result.original.length) : input;
        const newInput = prefix + firstMatch;

        setInput(newInput);

        // Initialize completion state
        setCompletionState({
          originalInput: input,
          completionPrefix: result.original,
          matches: result.matches,
          index: 0,
        });

        requestAnimationFrame(() => {
          if (inputRef.current) {
            inputRef.current.setSelectionRange(newInput.length, newInput.length);
            setCursorPos(newInput.length);
          }
        });
      }
      return;
    }

    // Reset completion on navigation keys if desired, or let it stick?
    // Usually moving cursor breaks completion cycle
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
      setCompletionState(null);
    }

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        handleSubmit();
        break;

      case 'ArrowUp': {
        e.preventDefault();
        const olderCommand = navigateHistory(1);
        if (olderCommand !== null) {
          setInput(olderCommand);
          // Set cursor to end after state update
          requestAnimationFrame(() => {
            if (inputRef.current) {
              const len = olderCommand.length;
              inputRef.current.setSelectionRange(len, len);
              setCursorPos(len);
            }
          });
        }
        break;
      }

      case 'ArrowDown': {
        e.preventDefault();
        const newerCommand = navigateHistory(-1);
        if (newerCommand !== null) {
          setInput(newerCommand);
          requestAnimationFrame(() => {
            if (inputRef.current) {
              const len = newerCommand.length;
              inputRef.current.setSelectionRange(len, len);
              setCursorPos(len);
            }
          });
        }
        break;
      }

      case 'ArrowLeft':
      case 'ArrowRight':
      case 'Home':
      case 'End':
        requestAnimationFrame(() => {
          setCursorPos(inputRef.current?.selectionStart || 0);
        });
        break;

      case 'c':
        // Ctrl+C to cancel/clear input
        if (e.ctrlKey) {
          e.preventDefault();
          setInput('');
          setCursorPos(0);
          resetHistoryIndex();
        }
        break;

      case 'l':
        // Ctrl+L to clear screen
        if (e.ctrlKey) {
          e.preventDefault();
          clearTerminal();
        }
        break;
    }
  };

  // Keep focus on input
  useEffect(() => {
    inputRef.current?.focus();
    const handleGlobalClick = () => inputRef.current?.focus();
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  // Restore focus when command completes (isLoading transitions to false)
  // This fixes Chrome focus loss after commands like 'help' that render complex output
  useEffect(() => {
    if (!isLoading && shouldRefocusRef.current) {
      shouldRefocusRef.current = false;
      // Use requestAnimationFrame to ensure React has finished rendering
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isLoading]);

  return (
    <div className={styles.inputContainer}>
      <span className={styles.prompt}>
        <span className={styles.promptUser}>{user}</span>
        <span className={styles.promptAt}>@</span>
        <span className={styles.promptHost}>portfolio</span>
        <span className={styles.promptSeparator}>:</span>
        <span className={styles.promptPath}>{currentDirectory}</span>
        <span className={styles.promptSymbol}>{symbol}</span>
      </span>
      <div className={styles.inputWrapper}>
        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          autoFocus
          spellCheck={false}
          autoComplete="off"
          disabled={isLoading}
          placeholder={isLoading ? 'Processing...' : "Type 'help' for available commands..."}
        />
        {/* Custom cursor implementation */}
        <span className={styles.cursor} style={{ left: `${cursorPos}ch` }} />
      </div>
    </div>
  );
};
