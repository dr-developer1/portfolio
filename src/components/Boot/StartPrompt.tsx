import type { StartPromptProps } from '../../types/boot';
import { text, useLocale } from '../../i18n/locale';
import styles from './BootScreen.module.css';

export function StartPrompt({ hint, typedText = '', onStart, onInputChange }: StartPromptProps) {
  const locale = useLocale();
  return (
    <form
      noValidate
      className={styles.promptContainer}
      onSubmit={(event) => {
        event.preventDefault();
        onStart?.();
      }}
    >
      <p className={styles.bootEyebrow}>
        {text(
          'A developer’s world. Yours to explore.',
          'Un univers de développeur. À vous de l’explorer.',
          locale
        )}
      </p>
      <h2 className={styles.bootName}>
        Ahmad Ibrahim<span>.</span>
      </h2>
      <p className={styles.bootDescription}>
        {text(
          'Full-stack engineer in Lyon. From technical design to software in production.',
          'Ingénieur full-stack à Lyon. De la conception technique au logiciel en production.',
          locale
        )}
      </p>
      <button
        type="submit"
        className={styles.launchBoot}
        aria-label={text('Start exploring', 'Commencer l’exploration', locale)}
      >
        {text('Enter my workspace', 'Entrer dans mon univers', locale)}{' '}
        <span aria-hidden="true">↗</span>
      </button>
      <p className={styles.enterHint}>{text('or press Enter', 'ou appuyez sur Entrée', locale)}</p>
      <label className={styles.secretLabel}>
        {hint}
        <input
          type="text"
          className={styles.secretInput}
          value={typedText}
          onChange={(event) => onInputChange?.(event.target.value)}
          onKeyDown={(event) => event.stopPropagation()}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label={text('Optional secret code', 'Code secret facultatif', locale)}
          placeholder="_"
        />
      </label>
    </form>
  );
}
