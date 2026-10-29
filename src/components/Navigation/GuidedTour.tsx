import { RECRUITER_TOUR } from '../../data/guides';
import { useTerminalContext } from '../../hooks/TerminalContext';
import { text, useLocale } from '../../i18n/locale';
import { commandLabel } from '../../i18n/paths';
import { CommandShortcutList } from '../Output/CommandShortcutList';
import styles from '../../styles/outputUtilities.module.css';

export function GuidedTour() {
  const locale = useLocale();
  const { visitorProgress } = useTerminalContext();
  const completed = RECRUITER_TOUR.filter((command) =>
    visitorProgress.discoveredCommands.includes(command)
  ).length;
  const next = RECRUITER_TOUR.find(
    (command) => !visitorProgress.discoveredCommands.includes(command)
  );
  return (
    <div className={styles.flexColumn}>
      <CommandShortcutList
        title={text('Recruiter tour', 'Visite pour recruteurs', locale)}
        items={RECRUITER_TOUR.map((command) => ({ label: commandLabel(command, locale), command }))}
        compact
      />
      <p className={styles.textSecondary}>
        {text('Progress', 'Progression', locale)}: {completed}/{RECRUITER_TOUR.length} ·{' '}
        {next
          ? `${text('Next', 'Ensuite', locale)}: ${commandLabel(next, locale)}`
          : text('Tour complete.', 'Visite terminée.', locale)}
      </p>
    </div>
  );
}
