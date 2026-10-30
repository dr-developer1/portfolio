import { getLocale, type Locale } from '../i18n/locale';
export interface SocialLink {
  platform: string;
  url: string;
  username: string;
}

export interface ExperienceItem {
  date: string;
  role: string;
  company: string;
  location: string;
  description: string[];
  technologies?: string[];
  shortLabel?: string;
  impact?: string;
  featured?: boolean;
}

export interface EducationItem {
  date: string;
  degree: string;
  school: string;
  location: string;
}

export interface ProjectItem {
  name: string;
  description: string;
  technologies: string[];
  shortLabel?: string;
  impact?: string;
  featured?: boolean;
  url?: string;
  repo?: string;
}

export interface PortfolioContent {
  bio: {
    name: string;
    tagline: string;
    description: string[];
  };
  skills: {
    languages: string[];
    frameworks: string[];
    tools: string[];
    softSkills: string[];
  };
  socials: SocialLink[];
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
}

export const content: PortfolioContent = {
  bio: {
    name: 'Ahmad Ibrahim',
    tagline: 'Full Stack Software Engineer · 6+ years of experience',
    description: [
      'Full-stack software engineer based in Lyon, France, with 6+ years of experience designing and developing web applications.',
      'Experienced in TypeScript, NestJS, Vue.js, Laravel, and PostgreSQL.',
      'I work across the full development lifecycle, from technical design and architecture to deployment.',
    ],
  },
  skills: {
    languages: ['TypeScript', 'JavaScript', 'PHP', 'SQL', 'HTML', 'CSS'],
    frameworks: ['NestJS', 'Node.js', 'Laravel', 'Vue.js', 'React', 'REST APIs'],
    tools: [
      'PostgreSQL',
      'MySQL',
      'MongoDB',
      'TypeORM',
      'Prisma',
      'Docker',
      'Git',
      'GitLab',
      'GitHub',
      'CI/CD',
    ],
    softSkills: [
      'Technical design',
      'Software architecture',
      'Legacy modernization',
      'End-to-end delivery',
    ],
  },
  socials: [
    { platform: 'Email', url: 'mailto:aibrahim0@outlook.com', username: 'aibrahim0@outlook.com' },
    {
      platform: 'LinkedIn',
      url: 'https://linkedin.com/in/ahmad-ibrahim1',
      username: 'ahmad-ibrahim1',
    },
    { platform: 'GitHub', url: 'https://github.com/dr-developer1', username: 'dr-developer1' },
    {
      platform: 'Portfolio',
      url: 'https://dr-developer1.github.io/portfolio',
      username: 'Portfolio',
    },
  ],
  experience: [
    {
      date: 'Sep 2024 -- Present',
      role: 'Web Development Engineer',
      company: 'SILICO',
      location: 'Lyon, France',
      shortLabel: 'Migration & product engineering',
      impact:
        'Designed medical payment software, offline-first desktop workflows, and AI-assisted business automation.',
      featured: true,
      description: [
        'Designed, architected, and developed a medical bill payment application integrating Société Générale’s Sogecommerce solution, supporting individual and group patient payments.',
        'Designed and developed a cross-platform medical desktop application using Electron, with an offline-first architecture, IndexedDB local storage, bidirectional synchronization, and automatic updates.',
        'Redesigned the paid-leave management application for CICPR, migrating a legacy system to Vue 3, TypeScript, and NestJS, with entitlement calculations for irregular working hours and contributions.',
        'Developed a full-stack application automating business data entry into web forms and Excel spreadsheets, with AI-assisted field mapping, Puppeteer browser automation, scheduled processing, and SAP integration.',
        'Led the technical migration of a legacy DMS from Symfony/Vue2 to NestJS/Vue3/TypeScript, delivering a complete UI redesign and improved maintainability.',
        'Developed and maintained a patient intervention management application, including form creation and completion, report generation, and automated delivery of medical reports to physicians.',
      ],
      technologies: [
        'NestJS',
        'Node.js',
        'TypeScript',
        'Vue.js',
        'PostgreSQL',
        'MongoDB',
        'Electron',
        'IndexedDB',
        'Puppeteer',
        'SAP',
        'Sogecommerce',
      ],
    },
    {
      date: 'June 2023 -- Sep 2024',
      role: 'Full Stack Web Developer (Work-Study)',
      company: 'SILICO',
      location: 'Lyon, France',
      shortLabel: 'Backend performance & migration',
      impact: 'Built high-volume APIs and supported a strategic PHP-to-Node migration.',
      description: [
        'Developed high-performance RESTful APIs for high-volume document management.',
        'Implemented a custom SAP content server to streamline data flows.',
        'Evolved and strategically migrated a web application from PHP Symfony to Node.js, significantly improving server response times.',
      ],
    },
    {
      date: 'Jan 2022 -- May 2023',
      role: 'Full Stack Web Developer (Work-Study)',
      company: 'HSK Digital',
      location: 'Crécy-sur-Serre, France',
      shortLabel: 'SaaS product delivery',
      description: [
        'Integrated a complex service sales configurator for client TGS France.',
        "Optimized the 'SmartDataForLead' SaaS solution using Laravel and Vue.js.",
        "Developed 'Predesire', an internal tool for customizable product management.",
      ],
    },
    {
      date: 'Jan 2020 -- July 2021',
      role: 'Full Stack Web Developer',
      company: 'Brain Solutions',
      location: 'Beirut, Lebanon',
      shortLabel: 'Commerce & operations tooling',
      description: [
        'Developed and maintained e-commerce platforms with catalog management and secure payment flows.',
        'Designed a financial dashboard for real-time monitoring of revenue and expenses.',
        'Built automation tools for invoicing and secure digital archiving.',
        'Provided client technical support and continuous solution deployments.',
      ],
    },
  ],
  education: [
    {
      date: '09/2022 - 09/2024',
      degree: "Master's in Project Management - Web & Mobile (Bac+5)",
      school: 'Éstiam',
      location: 'Lyon, France',
    },
    {
      date: '09/2021 - 08/2022',
      degree: 'Master’s in Software Architecture',
      school: 'La Rochelle University',
      location: 'La Rochelle, France',
    },
    {
      date: '09/2018 - 08/2021',
      degree: "Bachelor's in Computer Networks and Telecommunications Engineering",
      school: 'Lebanese University',
      location: 'Beirut, Lebanon',
    },
  ],
  projects: [
    {
      name: 'App E-commerce Full Stack',
      description:
        'Secure e-commerce platform with JWT/OAuth2 authentication, SSL/TLS encryption, and Stripe payments.',
      technologies: ['Angular', 'Spring Boot', 'Stripe', 'OAuth2'],
      shortLabel: 'Secure commerce platform',
      impact: 'Showcases full-stack architecture, authentication, and payment integration.',
      featured: true,
    },
    {
      name: 'Clinical Management System',
      description:
        'High-performance web application for centralized patient records and medical appointment management.',
      technologies: ['NestJS', 'ReactJS'],
      shortLabel: 'Healthcare workflow app',
      impact: 'Highlights domain-heavy product work and operational reliability.',
      featured: true,
    },
    {
      name: 'YouLike: Recruitment Platform',
      description:
        'A Tinder-style professional network enabling smart matching between students and recruiters.',
      technologies: ['ReactJS', 'TypeScript'],
      shortLabel: 'Matching product',
    },
    {
      name: 'StopNShop App Mobile',
      description:
        'Complete mobile e-commerce app with catalog browsing, dynamic cart, and purchase history.',
      technologies: ['React Native'],
      shortLabel: 'Mobile commerce app',
    },
    {
      name: 'Decentralized Voting (DApp)',
      description:
        'Implemented smart contracts on Ethereum to guarantee a tamper-proof voting system.',
      technologies: ['Solidity', 'Blockchain'],
      shortLabel: 'Blockchain proof-of-concept',
      impact: 'Demonstrates curiosity for trust, security, and decentralized systems.',
    },
  ],
};

/** CV-backed career data; existing personal projects are retained separately. */
const contentFr: PortfolioContent = {
  ...content,
  bio: {
    name: content.bio.name,
    tagline: 'Ingénieur full-stack · 6+ ans d’expérience',
    description: [
      'Ingénieur développeur full-stack basé à Lyon, avec plus de 6 ans d’expérience dans la conception et le développement d’applications web.',
      'Expérience en TypeScript, NestJS, Vue.js, Laravel et PostgreSQL.',
      'J’interviens sur tout le cycle de développement, de la conception technique et de l’architecture jusqu’au déploiement.',
    ],
  },
  skills: {
    ...content.skills,
    softSkills: [
      'Conception technique',
      'Architecture logicielle',
      'Modernisation legacy',
      'Livraison de bout en bout',
    ],
  },
  experience: [
    {
      ...content.experience[0],
      date: 'Depuis sept. 2024',
      role: 'Ingénieur développeur web',
      shortLabel: 'Architecture et développement produit',
      impact:
        'Conception de solutions de paiement médical, d’applications hors ligne et d’automatisation métier assistée par IA.',
      description: [
        'Conception, architecture et développement d’une application de paiement de factures médicales intégrant Sogecommerce de Société Générale, avec paiements individuels et groupés pour les patients.',
        'Conception d’une application médicale desktop multiplateforme avec Electron : mode offline-first, stockage local IndexedDB, synchronisation bidirectionnelle et mises à jour automatiques.',
        'Refonte de l’application de gestion des congés payés de la CICPR : migration vers Vue 3, TypeScript et NestJS, avec calcul des droits pour horaires irréguliers et cotisations.',
        'Développement d’une application full-stack automatisant la saisie de données métier dans des formulaires web et Excel : mapping assisté par IA, automatisation Puppeteer, traitements programmés et intégration SAP.',
        'Pilotage de la migration d’une GED de Symfony/Vue 2 vers NestJS/Vue 3/TypeScript, avec refonte de l’interface et amélioration de la maintenabilité.',
        'Développement et maintenance d’une application de gestion des interventions patients : formulaires, génération de comptes-rendus et envoi automatisé aux médecins.',
      ],
    },
    {
      ...content.experience[1],
      date: 'Juin 2023 – sept. 2024',
      role: 'Développeur web full-stack (alternance)',
      shortLabel: 'Performance back-end et migration',
      impact: 'APIs de gestion documentaire et migration de PHP vers Node.js.',
      description: [
        'Développement d’APIs RESTful pour la gestion de grands volumes de documents.',
        'Mise en place d’un serveur de contenu SAP personnalisé pour fiabiliser les échanges et la consultation de documents.',
        'Participation à la migration de PHP/Symfony vers Node.js pour améliorer les performances et la maintenabilité du back-end.',
      ],
    },
    {
      ...content.experience[2],
      date: 'Janv. 2022 – mai 2023',
      role: 'Développeur web (alternance)',
      shortLabel: 'Développement de produits SaaS',
      description: [
        'Intégration d’un configurateur de vente de services pour TGS France, avec parcours utilisateurs et logique métier complexes.',
        'Évolution de SmartDataForLead avec Laravel et Vue.js : corrections, optimisations et nouvelles fonctionnalités.',
        'Développement de Predesire, outil interne de gestion de produits personnalisables et de workflows associés.',
      ],
    },
    {
      ...content.experience[3],
      date: 'Janv. 2020 – juil. 2021',
      role: 'Développeur web',
      location: 'Beyrouth, Liban',
      shortLabel: 'E-commerce et outils métier',
      description: [
        'Développement et maintenance de plateformes e-commerce : catalogues produits, commandes et paiements sécurisés.',
        'Création d’un tableau de bord financier pour le suivi en temps réel des revenus, dépenses et indicateurs opérationnels.',
        'Automatisation de la facturation et de l’archivage numérique, avec support technique client jusqu’au déploiement.',
      ],
    },
  ],
  education: [
    { ...content.education[0], degree: 'Master 2 Manager de projet — Web & Mobile Development' },
    {
      ...content.education[1],
      degree: 'Master informatique — Architecture logicielle',
      school: 'Université de La Rochelle',
    },
    {
      ...content.education[2],
      degree: 'Licence en génie des réseaux informatiques et télécommunications',
      school: 'Université libanaise',
      location: 'Beyrouth, Liban',
    },
  ],
  projects: [
    {
      ...content.projects[0],
      description:
        'Plateforme e-commerce sécurisée avec authentification JWT/OAuth2, chiffrement SSL/TLS et paiements Stripe.',
      shortLabel: 'Plateforme e-commerce sécurisée',
      impact: 'Architecture full-stack, authentification et intégration de paiements.',
    },
    {
      ...content.projects[1],
      description:
        'Application web de centralisation des dossiers patients et de gestion des rendez-vous médicaux.',
      shortLabel: 'Gestion des parcours de soins',
      impact: 'Développement produit dans le domaine médical et fiabilité opérationnelle.',
    },
    {
      ...content.projects[2],
      description:
        'Réseau professionnel inspiré de Tinder pour rapprocher étudiants et recruteurs.',
      shortLabel: 'Mise en relation professionnelle',
    },
    {
      ...content.projects[3],
      description:
        'Application mobile e-commerce : catalogue, panier dynamique et historique des achats.',
      shortLabel: 'Application mobile e-commerce',
    },
    {
      ...content.projects[4],
      description: 'Smart contracts Ethereum pour un système de vote infalsifiable.',
      shortLabel: 'Prototype blockchain',
      impact: 'Exploration de la confiance, de la sécurité et des systèmes décentralisés.',
    },
  ],
};

export function getContent(locale: Locale = getLocale()): PortfolioContent {
  return locale === 'fr' ? contentFr : content;
}
