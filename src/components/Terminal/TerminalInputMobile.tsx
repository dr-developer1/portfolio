import React, { useRef, useCallback, useEffect } from 'react';
import { useTerminalContext } from '../../hooks/TerminalContext';
import { getPromptConfig } from '../../hooks/useTerminal';
import { SYSTEM_CONFIG } from '../../config';
import { useTabCompletion } from '../../hooks/useTabCompletion';
import { getCompletions } from '../../utils/completionService';
import { PromptDisplay } from './PromptDisplay';
import styles from './TerminalInput.module.css';
import outputStyles from '../../styles/outputUtilities.module.css';

export const TerminalInputMobile: React.FC = () => {
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
    input,
    setInput,
  } = useTerminalContext();

  const inputRef = useRef<HTMLSpanElement>(null);
  const shouldRefocusRef = useRef(false);

  const { handleTabKey, resetCompletion } = useTabCompletion();
  const { user, symbol } = getPromptConfig(bootMode);
  const suggestion = !isLoading
    ? getCompletions(input, currentDirectory, user)?.matches[0] ?? null
    : null;

  useEffect(() => {
    if (inputRef.current && inputRef.current.innerText !== input) {
      inputRef.current.innerText = input;
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(inputRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [input]);

  const handleInput = (e: React.FormEvent<HTMLSpanElement>) => {
    const text = e.currentTarget.innerText.replace(/[\r\n]+/g, ' ');

    setInput(text);
    resetHistoryIndex();
    resetCompletion();
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
      executeCommand(trimmedInput);
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
    setInput,
  ]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      if (isLoading) return;

      const newInput = handleTabKey(input, currentDirectory, user);
      if (newInput !== null) {
        setInput(newInput);
      }
      return;
    }

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
        }
        break;
      }

      case 'ArrowDown': {
        e.preventDefault();
        const newerCommand = navigateHistory(-1);
        if (newerCommand !== null) {
          setInput(newerCommand);
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

  // Scroll input into view when focused to ensure it's visible above the keyboard
  const handleFocus = useCallback(() => {
    // Use a short delay to allow the keyboard to start opening
    setTimeout(() => {
      inputRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }, 300);
  }, []);

  useEffect(() => {
    if (!isLoading && shouldRefocusRef.current && !isPlaygroundOpen) {
      shouldRefocusRef.current = false;
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isLoading, isPlaygroundOpen]);

  return (
    <div className={styles.inputContainer} onClick={() => inputRef.current?.focus()}>
      <span className={styles.prompt}>
        <span className={styles.promptUser}>{user}</span>
        <span className={styles.promptAt}>@</span>
        <span className={styles.promptHost}>{SYSTEM_CONFIG.hostname}</span>
        <span className={styles.promptSeparator}>:</span>
        <span className={styles.promptPath}>{currentDirectory}</span>
        <span className={styles.promptSymbol}>{symbol}</span>
      </span>
      <span className={styles.inputWrapper}>
        <span
          ref={inputRef}
          className={`${styles.input} ${styles.mobileInput}`}
          contentEditable
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          autoFocus
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          role="textbox"
          aria-label="Terminal input"
          aria-multiline="false"
          suppressContentEditableWarning
          data-placeholder={isLoading ? 'Processing...' : "Type 'help' for available commands..."}
        />
      </span>
      {suggestion && suggestion !== input && (
        <div className={styles.suggestion}>Tap Tab on supported keyboards to autocomplete: {suggestion}</div>
      )}
    </div>
  );
};
