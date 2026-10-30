import styles from './TerminalInput.module.css';

interface TerminalInputDisplayProps {
  input: string;
  start: number;
  end: number;
  focused: boolean;
  placeholder?: string;
}

/** Mirror native selection offsets so desktop and mobile show the same edit. */
export function TerminalInputDisplay({
  input,
  start,
  end,
  focused,
  placeholder,
}: TerminalInputDisplayProps) {
  const selected = start !== end;
  // Native offsets are UTF-16; retain the entire code point under the block.
  const cursorChar = String.fromCodePoint(input.codePointAt(start) ?? 32);

  return (
    <span className={styles.inputDisplay} aria-hidden="true" data-testid="terminal-input-display">
      {!input && placeholder ? (
        <span className={styles.inputPlaceholder}>{placeholder}</span>
      ) : null}
      {input.slice(0, start)}
      {selected ? (
        <span className={styles.inputSelection}>{input.slice(start, end)}</span>
      ) : (
        <span className={`${styles.cursorBlock} ${focused ? '' : styles.cursorInactive}`}>
          {cursorChar}
        </span>
      )}
      {input.slice(selected ? end : start + cursorChar.length)}
    </span>
  );
}
