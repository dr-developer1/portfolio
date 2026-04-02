import React, { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import { useTerminalContext } from '../../hooks/TerminalContext';
import { useEnsureFocusedElementVisible } from '../../hooks/useEnsureFocusedElementVisible';
import { getPromptConfig } from '../../hooks/useTerminal';
import { SYSTEM_CONFIG } from '../../config';
import { UI_CONSTANTS } from '../../config/constants';
import { useTabCompletion } from '../../hooks/useTabCompletion';
import { getCompletions } from '../../utils/completionService';
import { playCommandFire, playKeyClick } from '../../utils/soundService';
import { PromptDisplay } from './PromptDisplay';
import styles from './TerminalInput.module.css';
import outputStyles from '../../styles/outputUtilities.module.css';

interface TerminalInputMobileProps {
  keyboardInsetPx?: number;
  isKeyboardOpen?: boolean;
  isViewportSettled?: boolean;
}

export const TerminalInputMobile: React.FC<TerminalInputMobileProps> = ({
  keyboardInsetPx = 0,
  isKeyboardOpen = false,
  isViewportSettled = true,
}) => {
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
  const [isInputFocused, setIsInputFocused] = useState(false);

  const { handleTabKey, resetCompletion } = useTabCompletion();
  const { user, symbol } = getPromptConfig(bootMode);
  const suggestion = useMemo(() => {
    if (isLoading) {
      return null;
    }

    return getCompletions(input, currentDirectory, user)?.matches[0] ?? null;
  }, [isLoading, input, currentDirectory, user]);

  const { scheduleEnsureVisible, cancelScheduledEnsureVisible } =
    useEnsureFocusedElementVisible<HTMLInputElement>({
      elementRef: inputRef,
      enabled: !isPlaygroundOpen,
      isKeyboardOpen,
      isViewportSettled,
    });

  const moveCaretToEnd = useCallback(() => {
    const element = inputRef.current;
    if (!element) {
      return;
    }

    const cursorPos = element.value.length;
    element.setSelectionRange(cursorPos, cursorPos);
  }, []);

  const scheduleVisibilitySync = useCallback(() => {
    // When keyboard is already open, viewport resize has usually happened.
    const delayMs =
      isKeyboardOpen || keyboardInsetPx > 0
        ? UI_CONSTANTS.MOBILE_KEYBOARD.VIEWPORT_SETTLE_DELAY_MS
        : UI_CONSTANTS.MOBILE_KEYBOARD.FOCUS_SCROLL_DELAY_MS;

    scheduleEnsureVisible(delayMs);
  }, [isKeyboardOpen, keyboardInsetPx, scheduleEnsureVisible]);

  const focusInput = useCallback(() => {
    if (isPlaygroundOpen) {
      return;
    }

    inputRef.current?.focus({ preventScroll: true });
    scheduleVisibilitySync();
  }, [isPlaygroundOpen, scheduleVisibilitySync]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    resetHistoryIndex();
    resetCompletion();
    if (musicEnabled) {
      playKeyClick();
    }
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
      requestAnimationFrame(() => {
        focusInput();
      });
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
    resetCompletion();
  }, [
    input,
    executeCommand,
    addOutput,
    clearTerminal,
    musicEnabled,
    user,
    symbol,
    currentDirectory,
    focusInput,
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
        requestAnimationFrame(() => {
          moveCaretToEnd();
        });
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
          requestAnimationFrame(() => {
            moveCaretToEnd();
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
            moveCaretToEnd();
          });
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
      cancelScheduledEnsureVisible();
      inputRef.current?.blur();
      return;
    }

    focusInput();
  }, [cancelScheduledEnsureVisible, focusInput, isPlaygroundOpen]);

  useEffect(() => {
    if (!isLoading && shouldRefocusRef.current && !isPlaygroundOpen) {
      shouldRefocusRef.current = false;
      requestAnimationFrame(() => {
        focusInput();
      });
    }
  }, [focusInput, isLoading, isPlaygroundOpen]);

  useEffect(() => {
    return () => {
      cancelScheduledEnsureVisible();
    };
  }, [cancelScheduledEnsureVisible]);

  const placeholder = isLoading ? 'Processing...' : "Type 'help' for available commands...";

  return (
    <div className={styles.inputContainer} onClick={focusInput} data-testid="terminal-input-mobile">
      <span className={styles.prompt}>
        <span className={styles.promptUser}>{user}</span>
        <span className={styles.promptAt}>@</span>
        <span className={styles.promptHost}>{SYSTEM_CONFIG.hostname}</span>
        <span className={styles.promptSeparator}>:</span>
        <span className={styles.promptPath}>{currentDirectory}</span>
        <span className={styles.promptSymbol}>{symbol}</span>
      </span>

      <span className={styles.mobileInlineInput}>
        <input
          ref={inputRef}
          type="text"
          className={`${styles.hiddenInput} ${styles.mobileHiddenInput}`}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsInputFocused(true);
            scheduleVisibilitySync();
          }}
          onBlur={() => {
            setIsInputFocused(false);
            cancelScheduledEnsureVisible();
          }}
          autoFocus
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          enterKeyHint="send"
          aria-label="Terminal input"
          data-testid="terminal-input-native"
        />

        <span
          className={styles.inputDisplay}
          aria-hidden="true"
          data-testid="terminal-input-display"
        >
          {input ? input : <span className={styles.inputPlaceholder}>{placeholder}</span>}
          {isInputFocused && <span className={styles.cursorBlock}>&nbsp;</span>}
        </span>
      </span>

      {suggestion && suggestion !== input && (
        <div className={styles.suggestion}>
          Tap Tab on supported keyboards to autocomplete: {suggestion}
        </div>
      )}
    </div>
  );
};
