import React, { useState, useRef, useEffect } from 'react';
import styles from './TerminalInput.module.css';

export const TerminalInput: React.FC = () => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [cursorPos, setCursorPos] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setCursorPos(e.target.selectionStart || 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Update cursor position on navigation keys
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
      requestAnimationFrame(() => {
        setCursorPos(inputRef.current?.selectionStart || 0);
      });
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
        <span className={styles.promptPath}>~</span>
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
          placeholder="Type 'help' for available commands..."
        />
        {/* Custom cursor implementation */}
        <span 
          className={styles.cursor} 
          style={{ left: `${cursorPos}ch` }}
        />
      </div>
    </div>
  );
};
