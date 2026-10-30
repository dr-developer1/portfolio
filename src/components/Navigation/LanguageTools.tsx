import { getResumePath, setLocale, text, useLocale } from '../../i18n/locale';
import styles from './LanguageTools.module.css';

export function LanguageTools() {
  const locale = useLocale();
  return (
    <div className={styles.tools}>
      <div
        className={styles.languages}
        role="group"
        aria-label={text('Display language', 'Langue d’affichage', locale)}
      >
        <span aria-hidden="true" className={styles.globe}>
          ◎
        </span>
        {(['en', 'fr'] as const).map((language) => (
          <button
            key={language}
            type="button"
            lang={language}
            aria-label={language === 'en' ? 'English' : 'Français'}
            aria-pressed={locale === language}
            onClick={() => setLocale(language)}
          >
            {language.toUpperCase()}
          </button>
        ))}
      </div>
      <a className={styles.download} href={getResumePath(locale)} download>
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          aria-hidden="true"
        >
          <path d="M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5" />
        </svg>
        <span>{text('Download CV', 'Télécharger le CV', locale)}</span>
        <span className={styles.fileType}>PDF · {locale.toUpperCase()}</span>
      </a>
    </div>
  );
}
