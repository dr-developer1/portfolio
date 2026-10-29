import { useRef, useState } from 'react';
import { useTerminalContext } from '../../hooks/TerminalContext';
import { text, useLocale } from '../../i18n/locale';
import { commandLabel, pathInfo, PATH_IDS } from '../../i18n/paths';
import type { VisitorMode } from '../../types';
import styles from './PathLauncher.module.css';

const glyphs = {
  recruiter: 'M8 21v-2a4 4 0 0 1 8 0v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8M4 8v8m16-8v8',
  engineer: 'm8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18',
  founder: 'M4 20h16M6 16l4-5 4 2 5-9m-6 0h6v6',
  client: 'M8 12h8M12 8v8M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2',
};

export function PathActions({ mode }: { mode: VisitorMode }) {
  const locale = useLocale();
  const { executeCommand, isLoading } = useTerminalContext();
  return (
    <div className={styles.actions} data-path-actions>
      {pathInfo(mode, locale).commands.map((command) => (
        <button
          key={command}
          type="button"
          disabled={isLoading}
          onClick={() => void executeCommand(command)}
        >
          {commandLabel(command, locale)} <span aria-hidden="true">↗</span>
        </button>
      ))}
    </div>
  );
}

export function PathLauncher({ alwaysExpanded = false }: { alwaysExpanded?: boolean }) {
  const locale = useLocale();
  const { visitorMode, setVisitorMode, isLoading } = useTerminalContext();
  const launcherRef = useRef<HTMLElement>(null);
  const [isChoosing, setIsChoosing] = useState(false);
  const expanded = alwaysExpanded || visitorMode === 'standard' || isChoosing;
  const active = pathInfo(visitorMode, locale);

  function choose(mode: VisitorMode) {
    setVisitorMode(mode);
    setIsChoosing(false);
    if (mode !== 'standard' && !alwaysExpanded) {
      requestAnimationFrame(() =>
        launcherRef.current
          ?.querySelector<HTMLButtonElement>('[data-path-actions] button')
          ?.focus({ preventScroll: true })
      );
    }
  }

  return (
    <section
      ref={launcherRef}
      className={styles.launcher}
      aria-label={text('Explore the portfolio', 'Explorer le portfolio', locale)}
    >
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>
            {text('A portfolio that meets you halfway', 'Un portfolio qui s’adapte à vous', locale)}
          </p>
          <h2>
            {expanded
              ? text('One engineer. Four ways in.', 'Un ingénieur. Quatre perspectives.', locale)
              : active.title}
          </h2>
          <p className={styles.intro}>
            {expanded
              ? text(
                  'Pick a perspective. I’ll bring the relevant work to the front.',
                  'Choisissez un angle. Je mets les réalisations pertinentes au premier plan.',
                  locale
                )
              : active.description}
          </p>
        </div>
        {!expanded && (
          <button type="button" className={styles.change} onClick={() => setIsChoosing(true)}>
            {text('Change perspective', 'Changer de perspective', locale)}{' '}
            <span aria-hidden="true">⇄</span>
          </button>
        )}
      </div>
      {expanded ? (
        <>
          <div className={styles.routes}>
            {PATH_IDS.map((mode) => {
              const path = pathInfo(mode, locale);
              return (
                <button
                  key={mode}
                  type="button"
                  className={styles.route}
                  data-path={mode}
                  aria-pressed={visitorMode === mode}
                  disabled={isLoading}
                  onClick={() => choose(mode)}
                >
                  <span className={styles.routeTop}>
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d={glyphs[mode]} />
                    </svg>
                    <span className={styles.routeLabel}>{path.label}</span>
                    <span className={styles.arrow} aria-hidden="true">
                      ↗
                    </span>
                  </span>
                  <strong>{path.title}</strong>
                  <span className={styles.description}>{path.description}</span>
                  <span className={styles.preview}>{path.preview}</span>
                </button>
              );
            })}
          </div>
          <div className={styles.footer}>
            <span>
              {text('Same person. A different lens.', 'La même personne. Un autre regard.', locale)}
            </span>
            <button
              type="button"
              className={styles.change}
              onClick={() => {
                choose('standard');
                document.querySelector<HTMLInputElement>('[data-terminal-input="true"]')?.focus();
              }}
            >
              {text('Explore freely', 'Explorer librement', locale)}{' '}
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </>
      ) : (
        <>
          <div className={styles.activePath} role="status">
            {text('Perspective', 'Perspective', locale)}: {active.label}
          </div>
          <PathActions mode={visitorMode} />
        </>
      )}
    </section>
  );
}
