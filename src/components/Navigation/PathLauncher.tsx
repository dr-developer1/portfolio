import { useTerminalContext } from '../../hooks/TerminalContext';
import { text, useLocale } from '../../i18n/locale';
import { commandLabel, pathInfo, PATH_IDS } from '../../i18n/paths';
import type { VisitorMode } from '../../types';
import { CommandShortcutList } from '../Output/CommandShortcutList';

export function PathActions({ mode }: { mode: VisitorMode }) {
  const locale = useLocale();
  return (
    <CommandShortcutList
      compact
      items={pathInfo(mode, locale).commands.map((command) => ({
        label: commandLabel(command, locale),
        command,
      }))}
    />
  );
}

/** Keep navigation in the portfolio's original terminal shortcut language. */
export function PathLauncher({ alwaysExpanded = false }: { alwaysExpanded?: boolean }) {
  const locale = useLocale();
  const { visitorMode } = useTerminalContext();
  const choosing = alwaysExpanded || visitorMode === 'standard';
  return (
    <section aria-label={text('Choose your path', 'Choisissez votre parcours', locale)}>
      <CommandShortcutList
        title={
          choosing
            ? text(
                'Who are you? Choose your path',
                'Qui êtes-vous ? Choisissez votre parcours',
                locale
              )
            : `${pathInfo(visitorMode, locale).label} · ${text('quick start', 'accès rapide', locale)}`
        }
        compact
        items={
          choosing
            ? PATH_IDS.map((mode) => ({
                label: pathInfo(mode, locale).label,
                command: `mode ${mode}`,
                description: pathInfo(mode, locale).description,
              }))
            : [
                ...pathInfo(visitorMode, locale).commands.map((command) => ({
                  label: commandLabel(command, locale),
                  command,
                })),
                {
                  label: text('Change path', 'Changer de parcours', locale),
                  command: 'mode standard',
                },
              ]
        }
      />
    </section>
  );
}
