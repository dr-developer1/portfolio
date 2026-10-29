import { getContent } from '../../data/content';
import { useTerminalContext } from '../../hooks/TerminalContext';
import { text, useLocale } from '../../i18n/locale';
import { PathLauncher } from '../Navigation/PathLauncher';
import styles from './TerminalOutput.module.css';

export function TerminalOutput() {
  const { history } = useTerminalContext();
  const locale = useLocale();
  const content = getContent(locale);
  return (
    <div className={styles.output}>
      <header className={styles.identity}>
        <div>
          <p className={styles.identityMeta}>
            <span className={styles.signal} aria-hidden="true" />
            {text(
              'Lyon, France / Full-stack engineering',
              'Lyon, France / Ingénierie full-stack',
              locale
            )}
          </p>
          <h1>
            Ahmad
            <span className={styles.surname}>
              {' '}
              Ibrahim<span className={styles.nameDot}>.</span>
            </span>
          </h1>
          <p className={styles.identitySummary}>
            {text(
              'I turn complex workflows into software that works.',
              'Je transforme les besoins complexes en logiciels utiles.',
              locale
            )}
          </p>
          <p className={styles.identityStack}>
            TypeScript <span>/</span> NestJS <span>/</span> Vue.js <span>/</span> PostgreSQL
          </p>
        </div>
        <div className={styles.experienceStamp}>
          <strong>6+</strong>
          <span>
            {text('years of', 'ans', locale)}
            <br />
            {text('building', 'd’expérience', locale)}
          </span>
        </div>
      </header>
      <p className={styles.profileNote}>{content.bio.description[2]}</p>
      <PathLauncher />
      <p className={styles.shellHint}>
        {text('Prefer the keyboard? Type', 'Plutôt clavier ? Tapez', locale)} <code>help</code>{' '}
        {text(
          'or click any shortcut. Everything is explorable.',
          'ou cliquez sur un raccourci. Tout se découvre librement.',
          locale
        )}
      </p>
      {history.length > 0 && (
        <div className={styles.sessionLabel}>
          {text('Session output', 'Historique de session', locale)}{' '}
          <span aria-hidden="true">↓</span>
        </div>
      )}
      {history.map((line) => (
        <div
          id={`terminal-line-${line.id}`}
          key={line.id}
          className={`${styles.line} ${styles[line.type] || ''}`}
        >
          {line.content}
        </div>
      ))}
    </div>
  );
}
