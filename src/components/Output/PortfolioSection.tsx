import { getContent } from '../../data/content';
import { useLocale, text, getResumePath } from '../../i18n/locale';
import { commandLabel } from '../../i18n/paths';
import { getAllCommands } from '../../utils/commandRegistry';
import { CommandShortcutList } from './CommandShortcutList';
import { JobEntry } from './JobEntry';
import { EducationEntry } from './EducationEntry';
import { ProjectCard } from './ProjectCard';
import { SkillSection } from './SkillSection';
import styles from '../../styles/outputUtilities.module.css';

export type PortfolioSectionName =
  | 'about'
  | 'skills'
  | 'experience'
  | 'education'
  | 'projects'
  | 'top-projects'
  | 'highlights'
  | 'timeline'
  | 'why-me'
  | 'availability'
  | 'contact'
  | 'resume';

export function PortfolioSection({ section }: { section: PortfolioSectionName }) {
  const locale = useLocale();
  const content = getContent(locale);
  const t = (en: string, fr: string) => text(en, fr, locale);
  const bullets = (lines: string[]) => (
    <ul className={styles.listDisc}>
      {lines.map((line) => (
        <li key={line}>{line}</li>
      ))}
    </ul>
  );

  switch (section) {
    case 'about':
      return (
        <div className={styles.flexColumn}>
          <h3 className={styles.accentCyan}>{content.bio.name}</h3>
          <p className={styles.accentPurple}>{content.bio.tagline}</p>
          {content.bio.description.map((line) => (
            <p key={line}>{line}</p>
          ))}
          <p className={styles.textSecondary}>
            {t(
              'French & English: fluent · Arabic: native',
              'Français et anglais : courant · Arabe : langue maternelle'
            )}
          </p>
        </div>
      );
    case 'skills':
      return (
        <div>
          <SkillSection
            title={t('Languages', 'Langages')}
            items={content.skills.languages}
            color="orange"
          />
          <SkillSection
            title={t('Frameworks & APIs', 'Frameworks et APIs')}
            items={content.skills.frameworks}
            color="green"
          />
          <SkillSection
            title={t('Databases & tools', 'Bases de données et outils')}
            items={content.skills.tools}
            color="cyan"
          />
          <SkillSection
            title={t('Engineering', 'Ingénierie')}
            items={content.skills.softSkills}
            color="purple"
          />
        </div>
      );
    case 'experience':
      return (
        <div className={styles.flexColumnLarge}>
          <h3 className={styles.headerSection}>
            {t('Professional experience', 'Expériences professionnelles')}
          </h3>
          {content.experience.map((job) => (
            <JobEntry key={`${job.company}-${job.date}`} job={job} />
          ))}
        </div>
      );
    case 'education':
      return (
        <div className={styles.flexColumn}>
          <h3 className={styles.headerSection}>{t('Education', 'Diplômes et formations')}</h3>
          {content.education.map((entry) => (
            <EducationEntry key={entry.school} education={entry} />
          ))}
        </div>
      );
    case 'projects':
    case 'top-projects': {
      const projects =
        section === 'top-projects'
          ? content.projects.filter((project) => project.featured)
          : content.projects;
      return (
        <div className={styles.flexColumnLarge}>
          <h3 className={styles.headerSection}>
            {t('Personal & academic projects', 'Projets personnels et académiques')}
          </h3>
          <p className={styles.textSecondary}>
            {t(
              'For production work at SILICO, see experience.',
              'Pour les réalisations en production chez SILICO, consultez experience.'
            )}
          </p>
          {projects.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </div>
      );
    }
    case 'highlights':
      return (
        <div className={styles.flexColumn}>
          <h3 className={styles.headerSection}>{t('At a glance', 'L’essentiel')}</h3>
          {bullets([
            content.bio.tagline,
            t(
              'Based in Lyon, France. Technical design through deployment.',
              'Basé à Lyon. De la conception technique au déploiement.'
            ),
            content.experience[0].impact!,
            t(
              'Core stack: TypeScript, NestJS, Vue.js, Laravel, PostgreSQL.',
              'Stack principale : TypeScript, NestJS, Vue.js, Laravel, PostgreSQL.'
            ),
          ])}
          <CommandShortcutList
            items={['experience', 'skills', 'resume', 'contact'].map((command) => ({
              label: commandLabel(command, locale),
              command,
            }))}
            compact
          />
        </div>
      );
    case 'timeline':
      return (
        <div className={styles.flexColumn}>
          <h3 className={styles.headerSection}>{t('Career timeline', 'Parcours professionnel')}</h3>
          {content.experience.map((job) => (
            <div key={job.date}>
              <span className={styles.accentGreen}>{job.date}</span> · {job.role} @ {job.company}
            </div>
          ))}
          <h3 className={styles.headerSection}>{t('Education', 'Formation')}</h3>
          {content.education.map((entry) => (
            <div key={entry.school}>
              {entry.date} · {entry.degree} · {entry.school}
            </div>
          ))}
        </div>
      );
    case 'why-me':
      return (
        <div className={styles.flexColumn}>
          <h3 className={styles.headerSection}>{t('How I work', 'Mon approche')}</h3>
          {bullets([
            t(
              'Full development lifecycle: technical design, architecture, implementation, and deployment.',
              'Tout le cycle de développement : conception technique, architecture, implémentation et déploiement.'
            ),
            t(
              'Modernizing legacy systems: Symfony/Vue 2 to NestJS/Vue 3/TypeScript.',
              'Modernisation de systèmes legacy : de Symfony/Vue 2 à NestJS/Vue 3/TypeScript.'
            ),
            t(
              'Business workflows: payments, patient interventions, paid leave, document management, and automation.',
              'Parcours métier : paiements, interventions patients, congés payés, GED et automatisation.'
            ),
          ])}
        </div>
      );
    case 'availability':
      return (
        <div className={styles.flexColumn}>
          <h3 className={styles.headerSection}>{t('Let’s talk', 'Échangeons')}</h3>
          <p>
            {t(
              'Based in Lyon, France. Currently Web Development Engineer at SILICO.',
              'Basé à Lyon. Actuellement ingénieur développeur web chez SILICO.'
            )}
          </p>
          <p>
            {t(
              'Get in touch to discuss your team or project.',
              'Contactez-moi pour échanger sur votre équipe ou votre projet.'
            )}
          </p>
          <a className={styles.textLink} href="mailto:aibrahim0@outlook.com">
            aibrahim0@outlook.com
          </a>
        </div>
      );
    case 'contact':
      return (
        <div className={styles.flexColumn}>
          <h3 className={styles.headerSection}>{t('Get in touch', 'Me contacter')}</h3>
          {content.socials.map((social) => (
            <div key={social.platform}>
              {social.platform} ·{' '}
              <a
                className={styles.textLink}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {social.username}
              </a>
            </div>
          ))}
          <p className={styles.textSecondary}>
            {t(
              'Lyon, France · French, English & Arabic',
              'Lyon, France · Français, anglais et arabe'
            )}
          </p>
        </div>
      );
    case 'resume':
      return (
        <div className={styles.flexColumn}>
          <h3 className={styles.headerSection}>
            {t('Your copy of my CV', 'Mon CV à télécharger')}
          </h3>
          <a className={styles.textLink} href={getResumePath(locale)} download>
            {t('Download the English CV', 'Télécharger le CV français')} (PDF)
          </a>
          <p className={styles.textSecondary}>
            {t(
              'Use EN / FR in the toolbar to download the other version.',
              'Utilisez EN / FR dans la barre d’outils pour télécharger l’autre version.'
            )}
          </p>
        </div>
      );
  }
}

export function PortfolioHelp() {
  const locale = useLocale();
  const t = (en: string, fr: string) => text(en, fr, locale);
  const descriptions: Record<string, string> = {
    help: 'Afficher les commandes',
    about: 'Découvrir mon profil',
    skills: 'Explorer les compétences',
    experience: 'Consulter les expériences professionnelles',
    education: 'Consulter les formations',
    projects: 'Explorer les projets personnels et académiques',
    'top-projects': 'Voir une sélection de projets',
    highlights: 'Voir l’essentiel du profil',
    timeline: 'Parcourir ma carrière',
    'why-me': 'Découvrir mon approche',
    availability: 'Échanger sur votre projet',
    contact: 'Afficher mes coordonnées',
    resume: 'Télécharger le CV dans la langue active',
    'contact-me': 'Ouvrir votre messagerie',
    tour: 'Suivre la visite guidée',
    mode: 'Changer de perspective',
    start: 'Choisir une perspective',
    recommend: 'Afficher les prochaines étapes',
    language: 'Changer de langue (en / fr)',
  };
  return (
    <div className={styles.flexColumn}>
      <h3 className={styles.headerSection}>{t('Available commands', 'Commandes disponibles')}</h3>
      <p className={styles.textSecondary}>
        {t(
          'Click a shortcut or type a command. Command names stay in English in both languages.',
          'Cliquez sur un raccourci ou saisissez une commande. Les noms de commandes restent en anglais dans les deux langues.'
        )}
      </p>
      <CommandShortcutList
        items={['about', 'experience', 'projects', 'resume'].map((command) => ({
          label: commandLabel(command, locale),
          command,
        }))}
        compact
      />
      <div className={styles.commandGrid}>
        {getAllCommands()
          .filter((command) => !command.hidden)
          .map((command) => (
            <div key={command.name}>
              <span className={styles.accentGreen}>{command.name}</span> —{' '}
              <span className={styles.textSecondary}>
                {locale === 'fr'
                  ? (descriptions[command.name] ?? command.usage)
                  : command.description}
              </span>
            </div>
          ))}
      </div>
      <p className={styles.textSecondary}>
        {t(
          'Try help [command] for syntax. Technical tools and hidden commands use English.',
          'Utilisez help [commande] pour la syntaxe. Les outils techniques et commandes cachées utilisent l’anglais.'
        )}
      </p>
    </div>
  );
}
