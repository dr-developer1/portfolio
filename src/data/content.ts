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
    tagline: "Ingénieur Logiciel Full Stack (5+ ans d'expérience)",
    description: [
      'Ingénieur passionné basé à Lyon, France.',
      'Expert en stratégies de migration, résolution de problèmes complexes et architectures web modernes.',
      "Passionné par le développement de solutions à grande échelle et la concrétisation d'idées innovantes pour répondre à des problématiques complexes.",
    ],
  },
  skills: {
    languages: [
      'Java',
      'TypeScript',
      'JavaScript',
      'PHP',
      'Python',
      'Go',
      'C#',
      'VB.NET',
      'Dart',
      'SQL',
    ],
    frameworks: [
      'Spring Boot',
      'NestJS',
      'Laravel',
      'Node.js',
      'Angular',
      'Vue.js (v2/v3)',
      'React.js',
      'React Native',
      'ASP.NET Core',
    ],
    tools: [
      'Docker',
      'Kubernetes',
      'PostgreSQL',
      'MongoDB',
      'MySQL',
      'Git',
      'Linux',
      'Electron',
      'AWS',
    ],
    softSkills: [
      'Autonomie complète',
      "Esprit d'équipe (Agile/Scrum)",
      'Bug Hunter',
      'Résolution de problèmes complexes',
      'Migration de code Legacy',
      'Mentorat technique',
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
      date: 'Sep 2024 -- Présent',
      role: 'Ingénieur Développeur Web Full Stack',
      company: 'SILICO',
      location: 'Lyon, France',
      shortLabel: 'Migration & product engineering',
      impact: 'Drove multiple legacy-to-modern migrations and shipped offline-first and AI-assisted workflows.',
      featured: true,
      description: [
        "Conception d’une application desktop cross-platform (Electron) pour le suivi médical avec système de mise à jour automatique; architecture 'Offline First' utilisant IndexedDB pour le stockage local, synchronisation bidirectionnelle automatique et gestion du téléchargement/envoi des formulaires et rapports médicaux.",
        "Refonte complète d'une application web de gestion des congés payés pour la CICPR (secteur transport/logistique), servant d'interface entre entreprises adhérentes et association. Migration de technologies legacy vers Vue3/TypeScript/NestJS, incluant des algorithmes de calcul de droits pour horaires irréguliers et cotisations.",
        "Développement d'une solution innovante de remboursement de produits médicaux défectueux (R2D2) intégrant l'IA (GPT custom) pour automatiser le mapping entre formulaires variables et données patients, avec interface de vérification et correction manuelle des prédictions.",
        "Pilotage de la migration technique d'une GED legacy de Symfony/Vue2 vers NestJS/Vue3/TypeScript, résultant en une refonte UI totale et une meilleure maintenabilité.",
        "Développement et maintenance d'une application web de suivi des interventions pour les patients. Implémentation de fonctionnalités clés telles que la synchronisation temps réel, la génération de rapports d'activité et l'envoi automatisé de comptes-rendus par email aux médecins.",
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
        'OpenAI API',
      ],
    },
    {
      date: 'Juin 2023 -- Sep 2024',
      role: 'Développeur Web Full Stack (Alternance)',
      company: 'SILICO',
      location: 'Lyon, France',
      shortLabel: 'Backend performance & migration',
      impact: 'Built high-volume APIs and supported a strategic PHP-to-Node migration.',
      description: [
        "Développement d'APIs RESTful performantes pour la gestion volumétrique de documents.",
        "Mise en place d'un serveur de contenu SAP personnalisé pour fluidifier les flux de données.",
        "Évolution et migration stratégique d'une application web de PHP Symfony vers Node.js, améliorant drastiquement les temps de réponse serveur.",
      ],
    },
    {
      date: 'Jan 2022 -- Mai 2023',
      role: 'Développeur Web Full Stack (Alternance)',
      company: 'HSK Digital',
      location: 'Crécy-sur-Serre, France',
      shortLabel: 'SaaS product delivery',
      description: [
        "Intégration d'un configurateur de vente de services complexe pour le client TGS France.",
        "Optimisation de la solution SaaS 'SmartDataForLead' via Laravel et Vue.js.",
        "Développement de 'Predesire', un outil interne de gestion de produits personnalisables.",
      ],
    },
    {
      date: 'Jan 2020 -- Juil 2021',
      role: 'Développeur Web Full Stack',
      company: 'Brain Solutions',
      location: 'Beyrouth, Liban',
      shortLabel: 'Commerce & operations tooling',
      description: [
        'Développement et maintenance de plateformes e-commerce avec gestion de catalogues et paiements sécurisés.',
        "Conception d'un tableau de bord financier pour le monitoring temps réel des revenus et dépenses.",
        "Création d'outils d'automatisation de facturation et d'archivage numérique sécurisé.",
        'Support technique client et déploiement continu des solutions.',
      ],
    },
  ],
  education: [
    {
      date: '10/2022 - 09/2024',
      degree: 'Master 2 en Manager de projet parcours Web & Mobile development (Bac+5)',
      school: 'Éstiam',
      location: 'Lyon, France',
    },
    {
      date: '09/2021 - 07/2022',
      degree: 'Master Informatique parcours Architecte logiciel',
      school: 'La Rochelle Université',
      location: 'La Rochelle, France',
    },
    {
      date: '09/2018 - 07/2021',
      degree: 'Licence en Génie des Réseaux Informatiques et Télécommunications',
      school: 'Université Libanaise',
      location: 'Beyrouth, Liban',
    },
  ],
  projects: [
    {
      name: 'App E-commerce Full Stack',
      description:
        'Plateforme e-commerce sécurisée avec authentification JWT/OAuth2, chiffrement SSL/TLS et paiements Stripe.',
      technologies: ['Angular', 'Spring Boot', 'Stripe', 'OAuth2'],
      shortLabel: 'Secure commerce platform',
      impact: 'Showcases full-stack architecture, authentication, and payment integration.',
      featured: true,
    },
    {
      name: 'Système de Gestion Clinique',
      description:
        'Application web performante pour la gestion centralisée des dossiers patients et rendez-vous médicaux.',
      technologies: ['NestJS', 'ReactJS'],
      shortLabel: 'Healthcare workflow app',
      impact: 'Highlights domain-heavy product work and operational reliability.',
      featured: true,
    },
    {
      name: 'YouLike : Plateforme Recrutement',
      description:
        "Réseau professionnel type 'Tinder' facilitant le matching intelligent entre étudiants et recruteurs.",
      technologies: ['ReactJS', 'TypeScript'],
      shortLabel: 'Matching product',
    },
    {
      name: 'StopNShop App Mobile',
      description:
        "Application mobile e-commerce complète : navigation catalogue, panier dynamique et historique d'achats.",
      technologies: ['React Native'],
      shortLabel: 'Mobile commerce app',
    },
    {
      name: 'Vote Décentralisé (DApp)',
      description:
        'Implémentation de Smart Contracts sur Ethereum pour garantir un système de vote infalsifiable.',
      technologies: ['Solidity', 'Blockchain'],
      shortLabel: 'Blockchain proof-of-concept',
      impact: 'Demonstrates curiosity for trust, security, and decentralized systems.',
    },
  ],
};
