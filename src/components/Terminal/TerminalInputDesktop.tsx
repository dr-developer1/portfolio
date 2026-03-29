import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useTerminalContext } from '../../hooks/TerminalContext';
import { getPromptConfig } from '../../hooks/useTerminal';
import { SYSTEM_CONFIG } from '../../config';
import { useTabCompletion } from '../../hooks/useTabCompletion';
import { getCompletions } from '../../utils/completionService';
import { playCommandFire, playKeyClick } from '../../utils/soundService';
import { PromptDisplay } from './PromptDisplay';
import styles from './TerminalInput.module.css';
import outputStyles from '../../styles/outputUtilities.module.css';

export const TerminalInputDesktop: React.FC = () => {
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
  
  // Track cursor position for the custom block cursor
  const [cursorPos, setCursorPos] = useState(0);
  const [isFocused, setIsFocused] = useState(true);

  const { handleTabKey, resetCompletion } = useTabCompletion();
  const { user, symbol } = getPromptConfig(bootMode);
  const suggestion = !isLoading
    ? getCompletions(input, currentDirectory, user)?.matches[0] ?? null
    : null;

  // Sync cursor position when input changes externally (history, completion)
  useEffect(() => {
    // When input changes from history/tab, move cursor to end
    setCursorPos(input.length);
  }, [input]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInput(newValue);
    setCursorPos(e.target.selectionStart || newValue.length);
    resetHistoryIndex();
    resetCompletion();
    if (musicEnabled) {
      playKeyClick();
    }
  };

  const handleSelect = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    setCursorPos(target.selectionStart || 0);
  };

  const handleSubmit = useCallback(() => {
    const trimmedInput = input.trim();

    if (
      trimmedInput.toLowerCase() === 'clear' ||
      trimmedInput.toLowerCase() === 'cls' ||
      trimmedInput.toLowerCase() === 'reset'
    ) {
      clearTerminal();
      setInput('');
      setCursorPos(0);
      resetCompletion();
      requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }

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
    setCursorPos(0);
    resetCompletion();
  }, [
    input,
    executeCommand,
    addOutput,
    clearTerminal,
    user,
    symbol,
    musicEnabled,
    currentDirectory,
    resetCompletion,
    setInput,
  ]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      if (isLoading) return;

      const newInput = handleTabKey(input, currentDirectory, user);
      if (newInput !== null) {
        setInput(newInput);
        setCursorPos(newInput.length);
      }
      return;
    }

    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
      resetCompletion();
      // Allow default behavior to move cursor in hidden input
      // We will catch the position update in onSelect/onKeyUp
      return;
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
          setCursorPos(olderCommand.length);
        }
        break;
      }

      case 'ArrowDown': {
        e.preventDefault();
        const newerCommand = navigateHistory(-1);
        if (newerCommand !== null) {
          setInput(newerCommand);
          setCursorPos(newerCommand.length);
        }
        break;
      }

      case 'c':
        if (e.ctrlKey) {
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
          setCursorPos(0);
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

  useEffect(() => {
    if (isPlaygroundOpen) {
      inputRef.current?.blur();
      return;
    }
    inputRef.current?.focus();
  }, [isPlaygroundOpen]);

  useEffect(() => {
    if (!isLoading && shouldRefocusRef.current && !isPlaygroundOpen) {
      shouldRefocusRef.current = false;
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isLoading, isPlaygroundOpen]);

  // Desktop Exclusive: Global click handler to maintain focus ("Always Ready" feel)
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // Don't steal focus if Playground is open
      if (isPlaygroundOpen) return;
      
      // Don't steal focus if user is selecting text
      if (window.getSelection()?.toString()) return;

      // Don't steal focus if clicking links or interactive elements
      if ((e.target as HTMLElement).closest('a, button, [role="button"], input, textarea')) return;

      // Otherwise, keep focus on our terminal input
      inputRef.current?.focus();
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [isPlaygroundOpen]);

  // Render the custom cursor display
  const renderInputDisplay = () => {
    // If empty input, show flashing block
    if (!input) {
      return (
        <span className={`${styles.cursorBlock} ${isFocused ? '' : styles.active}`}>
          &nbsp;
        </span>
      );
    }

    const chars = input.split('');
    const beforeCursor = chars.slice(0, cursorPos);
    const cursorChar = chars[cursorPos] || ' '; // Space if at end
    const afterCursor = chars.slice(cursorPos + 1);

    return (
      <>
        {beforeCursor.join('')}
        <span className={`${styles.cursorBlock} ${isFocused ? '' : styles.active}`}>
          {cursorChar}
        </span>
        {afterCursor.join('')}
      </>
    );
  };

  return (
    <div>
      <div className={styles.desktopContainer} onClick={() => inputRef.current?.focus()}>
        <span className={styles.prompt}>
          <span className={styles.promptUser}>{user}</span>
          <span className={styles.promptAt}>@</span>
          <span className={styles.promptHost}>{SYSTEM_CONFIG.hostname}</span>
          <span className={styles.promptSeparator}>:</span>
          <span className={styles.promptPath}>{currentDirectory}</span>
          <span className={styles.promptSymbol}>{symbol}</span>
        </span>

        <input
          ref={inputRef}
          type="text"
          className={styles.hiddenInput}
          value={input}
          onChange={handleInputChange}
          onSelect={handleSelect}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoFocus={true}
          spellCheck={false}
          autoComplete="off"
        />

        <span className={styles.inputDisplay}>{renderInputDisplay()}</span>
      </div>
      {suggestion && suggestion !== input && (
        <div className={styles.suggestion}>Press Tab to autocomplete: {suggestion}</div>
      )}
    </div>
  );
};
