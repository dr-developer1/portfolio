import { text, useLocale } from '../../i18n/locale';
import React, { useCallback, useEffect, useState } from 'react';
import { useEnsureFocusedElementVisible } from '../../hooks/useEnsureFocusedElementVisible';
import { SYSTEM_CONFIG } from '../../config';
import { UI_CONSTANTS } from '../../config/constants';
import { useTerminalInput } from '../../hooks/useTerminalInput';
import { TerminalInputDisplay } from './TerminalInputDisplay';
import { PromptDisplay } from './PromptDisplay';
import styles from './TerminalInput.module.css';

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
  const locale = useLocale();
  const [isInputFocused, setIsInputFocused] = useState(false);
  const {
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
    handleCompositionStart,
    handleCompositionEnd,
  } = useTerminalInput();

  const { scheduleEnsureVisible, cancelScheduledEnsureVisible } =
    useEnsureFocusedElementVisible<HTMLInputElement>({
      elementRef: inputRef,
      enabled: !isPlaygroundOpen,
      isKeyboardOpen,
      isViewportSettled,
    });

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
  }, [inputRef, isPlaygroundOpen, scheduleVisibilitySync]);

  useEffect(() => {
    if (isPlaygroundOpen) {
      cancelScheduledEnsureVisible();
      inputRef.current?.blur();
    }
  }, [inputRef, cancelScheduledEnsureVisible, isPlaygroundOpen]);

  useEffect(() => {
    if (!isLoading && shouldRefocusRef.current && !isPlaygroundOpen) {
      shouldRefocusRef.current = false;
      requestAnimationFrame(() => {
        focusInput();
      });
    }
  }, [shouldRefocusRef, focusInput, isLoading, isPlaygroundOpen]);

  useEffect(() => {
    return () => {
      cancelScheduledEnsureVisible();
    };
  }, [cancelScheduledEnsureVisible]);

  const placeholder = isLoading ? text('Processing...', 'Traitement…', locale) : '';

  return (
    <div className={styles.inputContainer} onClick={focusInput} data-testid="terminal-input-mobile">
      <span className={styles.prompt}>
        <PromptDisplay
          user={user}
          hostname={SYSTEM_CONFIG.hostname}
          directory={currentDirectory}
          symbol={symbol}
        />
      </span>

      <span className={styles.mobileInlineInput}>
        <input
          ref={inputRef}
          type="text"
          className={`${styles.hiddenInput} ${styles.mobileHiddenInput}`}
          value={input}
          onChange={handleInputChange}
          onSelect={handleSelect}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onFocus={() => {
            setIsInputFocused(true);
            scheduleVisibilitySync();
          }}
          onBlur={() => {
            setIsInputFocused(false);
            cancelScheduledEnsureVisible();
          }}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          enterKeyHint="send"
          aria-label="Terminal command input"
          data-terminal-input="true"
          data-testid="terminal-input-native"
        />

        <TerminalInputDisplay
          input={input}
          start={cursorStart}
          end={cursorEnd}
          focused={isInputFocused}
          placeholder={placeholder}
        />
      </span>

      {suggestion && suggestion !== input && (
        <div className={styles.suggestion}>
          {text('Press Tab to autocomplete:', 'Appuyez sur Tab pour compléter :', locale)}{' '}
          {suggestion}
        </div>
      )}
    </div>
  );
};
