import type { VisitorMode } from '../types';
import { text, type Locale } from './locale';

export const PATH_IDS = ['recruiter', 'engineer', 'founder', 'client'] as const;
export function pathInfo(mode: VisitorMode, locale: Locale) {
  const paths = {
    standard: {
      label: text('Explorer', 'Explorateur', locale),
      title: text('Follow your curiosity', 'Suivez votre curiosité', locale),
      description: text(
        'The whole portfolio, at your own pace.',
        'Tout le portfolio, à votre rythme.',
        locale
      ),
      preview: 'help → about → projects',
      commands: ['help', 'about', 'projects', 'contact'],
    },
    recruiter: {
      label: text('Recruiter', 'Recruteur', locale),
      title: text('Meet your next engineer', 'Découvrez mon profil', locale),
      description: text(
        'The experience, the evidence, and the CV. Straight to what matters.',
        'L’expérience, les réalisations et le CV. L’essentiel pour recruter.',
        locale
      ),
      preview: 'highlights → experience → resume',
      commands: ['highlights', 'experience', 'education', 'resume', 'contact'],
    },
    engineer: {
      label: text('Engineer', 'Ingénieur', locale),
      title: text('Look under the hood', 'Sous le capot', locale),
      description: text(
        'Explore the stack, migrations, and a live coding playground.',
        'Explorez la stack, les migrations et un espace de code interactif.',
        locale
      ),
      preview: 'skills → projects → playground',
      commands: ['skills', 'projects', 'legacy', 'playground --demo'],
    },
    founder: {
      label: text('Founder', 'Fondateur', locale),
      title: text('From idea to shipped', 'De l’idée au produit', locale),
      description: text(
        'Product thinking, technical ownership, and end-to-end delivery.',
        'Vision produit, responsabilité technique et livraison de bout en bout.',
        locale
      ),
      preview: 'highlights → projects → contact',
      commands: ['highlights', 'projects', 'why-me', 'contact'],
    },
    client: {
      label: text('Client', 'Client', locale),
      title: text('Build something together', 'Construisons ensemble', locale),
      description: text(
        'Discover what I build, how I work, and how to get in touch.',
        'Mes réalisations, ma façon de travailler et comment me contacter.',
        locale
      ),
      preview: 'about → projects → contact',
      commands: ['about', 'projects', 'skills', 'contact'],
    },
  };
  return paths[mode];
}

export function commandLabel(command: string, locale: Locale) {
  const labels: Record<string, [string, string]> = {
    help: ['All commands', 'Toutes les commandes'],
    about: ['About me', 'Mon profil'],
    highlights: ['Highlights', 'L’essentiel'],
    experience: ['Experience', 'Expérience'],
    education: ['Education', 'Formation'],
    resume: ['Download CV', 'Télécharger le CV'],
    skills: ['My stack', 'Ma stack'],
    projects: ['Projects', 'Projets'],
    'top-projects': ['Selected projects', 'Sélection de projets'],
    legacy: ['Migrations', 'Migrations'],
    'playground --demo': ['Open playground', 'Ouvrir l’éditeur'],
    'why-me': ['How I work', 'Mon approche'],
    contact: ['Get in touch', 'Me contacter'],
  };
  return labels[command] ? labels[command][locale === 'fr' ? 1 : 0] : command;
}
