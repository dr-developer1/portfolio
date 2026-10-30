import React, { useState, useEffect } from 'react';
import { text, useLocale } from '../../i18n/locale';
import { useTerminalInput } from '../../hooks/useTerminalInput';
import { SYSTEM_CONFIG } from '../../config';
import { PromptDisplay } from './PromptDisplay';
import { TerminalInputDisplay } from './TerminalInputDisplay';
import styles from './TerminalInput.module.css';

export const TerminalInputDesktop: React.FC = () => {
  const locale = useLocale();
  const [isFocused, setIsFocused] = useState(false);
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

  useEffect(() => {
    if (isPlaygroundOpen) {
      inputRef.current?.blur();
      return;
    }
    inputRef.current?.focus({ preventScroll: true });
  }, [inputRef, isPlaygroundOpen]);

  useEffect(() => {
    if (!isLoading && shouldRefocusRef.current && !isPlaygroundOpen) {
      shouldRefocusRef.current = false;
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [inputRef, shouldRefocusRef, isLoading, isPlaygroundOpen]);

  // Desktop Exclusive: Global click handler to maintain focus ("Always Ready" feel)
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // Don't steal focus if Playground is open
      if (isPlaygroundOpen) return;

      // Don't steal focus if user is selecting text
      if (window.getSelection()?.toString()) return;

      // Don't steal focus if clicking links or interactive elements
      if (
        (e.target as HTMLElement).closest(
          'a, button, [role="button"], input, textarea, select, summary, [contenteditable="true"]'
        )
      )
        return;

      // Otherwise, keep focus on our terminal input
      inputRef.current?.focus();
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [inputRef, isPlaygroundOpen]);

  return (
    <div>
      <div className={styles.desktopContainer} onClick={() => inputRef.current?.focus()}>
        <span className={styles.prompt}>
          <PromptDisplay
            user={user}
            hostname={SYSTEM_CONFIG.hostname}
            directory={currentDirectory}
            symbol={symbol}
          />
        </span>

        <input
          ref={inputRef}
          type="text"
          className={styles.hiddenInput}
          value={input}
          onChange={handleInputChange}
          onSelect={handleSelect}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          aria-label="Terminal command input"
          data-terminal-input="true"
          autoComplete="off"
        />

        <TerminalInputDisplay
          input={input}
          start={cursorStart}
          end={cursorEnd}
          focused={isFocused}
        />
      </div>
      {suggestion && suggestion !== input && (
        <div className={styles.suggestion}>
          {text('Press Tab to autocomplete:', 'Appuyez sur Tab pour compléter :', locale)}{' '}
          {suggestion}
        </div>
      )}
    </div>
  );
};
