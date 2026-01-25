import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTerminalContext } from '../../hooks/TerminalContext';
import styles from './TerminalInput.module.css';

export const TerminalInput: React.FC = () => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [cursorPos, setCursorPos] = useState(0);

  const {
    executeCommand,
    clearTerminal,
    navigateHistory,
    resetHistoryIndex,
    currentDirectory,
    isLoading,
  } = useTerminalContext();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setCursorPos(e.target.selectionStart || 0);
    resetHistoryIndex();
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
      return;
    }

    if (trimmedInput) {
      executeCommand(trimmedInput);
    }

    setInput('');
    setCursorPos(0);
  }, [input, executeCommand, clearTerminal]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

  return (
    <div className={styles.inputContainer}>
      <span className={styles.prompt}>
        <span className={styles.promptUser}>visitor</span>
        <span className={styles.promptAt}>@</span>
        <span className={styles.promptHost}>portfolio</span>
        <span className={styles.promptSeparator}>:</span>
        <span className={styles.promptPath}>{currentDirectory}</span>
        <span className={styles.promptSymbol}>$</span>
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
