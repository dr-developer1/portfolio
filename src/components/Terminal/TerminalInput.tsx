import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTerminalContext } from '../../hooks/TerminalContext';
import { getPromptConfig } from '../../hooks/useTerminal';
import { SYSTEM_CONFIG } from '../../config';
import { useTabCompletion } from '../../hooks/useTabCompletion';
import { useCursorPosition } from '../../hooks/useCursorPosition';
import { PromptDisplay } from './PromptDisplay';
import styles from './TerminalInput.module.css';
import outputStyles from '../../styles/TerminalOutput.module.css';

export const TerminalInput: React.FC = () => {
  const [input, setInput] = useState('');
  const [cursorPos, setCursorPos] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  // Track whether we should restore focus when loading completes
  const shouldRefocusRef = useRef(false);

  // Use custom hooks
  const { handleTabKey, resetCompletion } = useTabCompletion();
  const { cursorRef } = useCursorPosition(input, cursorPos, inputRef);

  const {
    executeCommand,
    addOutput,
    clearTerminal,
    navigateHistory,
    resetHistoryIndex,
    currentDirectory,
    isLoading,
    bootMode,
    isPlaygroundOpen,
  } = useTerminalContext();

  // Get dynamic prompt configuration based on boot mode
  const { user, symbol } = getPromptConfig(bootMode);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setCursorPos(e.target.selectionStart || 0);
    resetHistoryIndex();
    resetCompletion();
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
      resetCompletion();
      // Ensure focus returns after clearing
      requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }

    // If empty input, show prompt line (Linux behavior)
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
      executeCommand(trimmedInput);
      // Mark that we should restore focus when loading completes
      shouldRefocusRef.current = true;
    }

    setInput('');
    resetCompletion();
  }, [
    input,
    executeCommand,
    addOutput,
    clearTerminal,
    user,
    symbol,
    currentDirectory,
    resetCompletion,
  ]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If pressing Tab
    if (e.key === 'Tab') {
      e.preventDefault();
      if (isLoading) return;

      const newInput = handleTabKey(input, currentDirectory, user);
      if (newInput !== null) {
        setInput(newInput);
        // Set cursor to end after tab completion
        requestAnimationFrame(() => {
          if (inputRef.current) {
            inputRef.current.setSelectionRange(newInput.length, newInput.length);
            setCursorPos(newInput.length);
          }
        });
      }
      return;
    }

    // Reset completion on navigation keys
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
      resetCompletion();
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
        // Ctrl+C to cancel/clear input (Linux-style)
        if (e.ctrlKey) {
          e.preventDefault();

          // Show prompt line with ^C if there's input, or just prompt if empty
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
            // Show prompt line with ^C even on empty input
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
    if (isPlaygroundOpen) {
      inputRef.current?.blur();
      return;
    }

    inputRef.current?.focus();
    const handleGlobalClick = () => inputRef.current?.focus();
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [isPlaygroundOpen]);

  // Restore focus when command completes (isLoading transitions to false)
  // This fixes Chrome focus loss after commands like 'help' that render complex output
  useEffect(() => {
    if (!isLoading && shouldRefocusRef.current && !isPlaygroundOpen) {
      shouldRefocusRef.current = false;
      // Use requestAnimationFrame to ensure React has finished rendering
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isLoading, isPlaygroundOpen]);

  return (
    <div className={styles.inputContainer}>
      <span className={styles.prompt}>
        <span className={styles.promptUser}>{user}</span>
        <span className={styles.promptAt}>@</span>
        <span className={styles.promptHost}>{SYSTEM_CONFIG.hostname}</span>
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
          disabled={isLoading || isPlaygroundOpen}
          placeholder={isLoading ? 'Processing...' : "Type 'help' for available commands..."}
        />
        {/* Custom cursor implementation */}
        <span ref={cursorRef} className={styles.cursor} />
      </div>
    </div>
  );
};
