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
    tagline: 'Full Stack Software Engineer · 5+ years of experience',
    description: [
      'Passionate engineer based in Lyon, France.',
      'Expert in migration strategies, complex problem-solving, and modern web architectures.',
      'Passionate about building large-scale solutions and turning innovative ideas into reality.',
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
      'Full autonomy',
      'Team player (Agile/Scrum)',
      'Bug Hunter',
      'Complex problem solving',
      'Legacy code migration',
      'Technical mentoring',
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
      role: 'Full Stack Web Software Engineer',
      company: 'SILICO',
      location: 'Lyon, France',
      shortLabel: 'Migration & product engineering',
      impact:
        'Drove multiple legacy-to-modern migrations and shipped offline-first and AI-assisted workflows.',
      featured: true,
      description: [
        "Designed a cross-platform desktop application (Electron) for medical follow-up with an automatic update system; 'Offline First' architecture using IndexedDB for local storage, automatic bidirectional synchronization, and upload/download handling for medical forms and reports.",
        'Led a full rewrite of a paid-leave management web app for CICPR (transport/logistics sector), acting as the interface between member companies and the association. Migrated legacy technologies to Vue3/TypeScript/NestJS, including entitlement-calculation algorithms for irregular schedules and contributions.',
        'Built an innovative reimbursement solution for defective medical products (R2D2) with integrated AI (custom GPT) to automate mapping between variable forms and patient data, including a verification interface with manual correction of predictions.',
        'Led the technical migration of a legacy DMS from Symfony/Vue2 to NestJS/Vue3/TypeScript, delivering a complete UI redesign and improved maintainability.',
        'Developed and maintained a patient intervention tracking web application. Implemented key features such as real-time synchronization, activity report generation, and automated email delivery of medical summaries to doctors.',
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
      date: '10/2022 - 09/2024',
      degree: "Master's in Project Management - Web & Mobile (Bac+5)",
      school: 'Éstiam',
      location: 'Lyon, France',
    },
    {
      date: '09/2021 - 07/2022',
      degree: "Master's in Computer Science - Software Architecture",
      school: 'La Rochelle University',
      location: 'La Rochelle, France',
    },
    {
      date: '09/2018 - 07/2021',
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
