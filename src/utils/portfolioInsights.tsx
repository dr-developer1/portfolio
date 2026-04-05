import { content } from '../data/content';
import type { ProjectItem } from '../data/content';
import {
  AVAILABILITY_POINTS,
  GUIDED_PATHS,
  INTERVIEW_PROMPTS,
  LEGACY_STORY,
  OPENAI_NOTES,
  PATH_SUMMARIES,
  WHY_ME_POINTS,
} from '../data/guides';
import type { GuidedPath, VisitorMode } from '../types';
import { getNode } from './fileSystem';
import { resolveSitePath } from './sitePaths';
import styles from '../styles/outputUtilities.module.css';

export interface SearchResult {
  section: string;
  title: string;
  snippet: string;
  command?: string;
}

function normalize(value: string): string {
  return value.toLowerCase();
}

export function getFeaturedProjects(): ProjectItem[] {
  return content.projects.filter((project) => project.featured).slice(0, 3);
}

function getProjectScore(project: ProjectItem, mode: VisitorMode): number {
  let score = 0;

  if (project.featured) score += 3;
  if (project.impact) score += 2;
  if (project.url) score += mode === 'client' ? 4 : 1;
  if (project.repo) score += mode === 'engineer' ? 4 : 1;
  score += project.technologies.length >= 4 ? 1 : 0;

  if (mode === 'recruiter' || mode === 'founder') {
    score += project.impact ? 2 : 0;
  }

  return score;
}

export function getProjectsForMode(
  mode: VisitorMode,
  options: { featuredOnly?: boolean } = {}
): ProjectItem[] {
  const source = options.featuredOnly
    ? content.projects.filter((project) => project.featured)
    : content.projects;

  const projects = source.length > 0 ? source : content.projects;

  return [...projects].sort((left, right) => {
    const scoreDelta = getProjectScore(right, mode) - getProjectScore(left, mode);
    if (scoreDelta !== 0) {
      return scoreDelta;
    }

    return left.name.localeCompare(right.name);
  });
}

export function getTopProjects(mode: VisitorMode = 'standard'): ProjectItem[] {
  const featured = getProjectsForMode(mode, { featuredOnly: true });
  const ordered = featured.length > 0 ? featured : getProjectsForMode(mode);
  return ordered.slice(0, 3);
}

export function getHighlights(mode: VisitorMode = 'standard'): string[] {
  const highlights: string[] = [];

  const featuredExperience =
    content.experience.find((job) => job.featured) ?? content.experience[0];
  if (featuredExperience?.impact) {
    highlights.push(featuredExperience.impact);
  }

  content.projects
    .filter((project) => project.featured && project.impact)
    .slice(0, 2)
    .forEach((project) => {
      if (project.impact) {
        highlights.push(`${project.name}: ${project.impact}`);
      }
    });

  if (highlights.length === 0) {
    highlights.push(
      'Full-stack engineer shipping web, mobile, and desktop products with a strong migration mindset.'
    );
  }

  if (mode === 'recruiter') {
    return [
      '5+ years shipping production software across web, mobile, and desktop products.',
      'Based in Lyon, France and open to full-time software engineering opportunities.',
      ...highlights,
    ];
  }

  if (mode === 'engineer') {
    return [
      'Strongest in legacy-to-modern migrations, offline-first flows, and debugging high-friction systems.',
      'Comfortable across NestJS, Vue/React, Electron, PostgreSQL/MongoDB, and AI-assisted workflows.',
      ...highlights,
    ];
  }

  if (mode === 'founder') {
    return [
      'Bias toward shipping: move fast, reduce product risk, and keep delivery moving during rewrites.',
      'Comfortable owning features end-to-end, from product framing to implementation and rollout.',
      ...highlights,
    ];
  }

  if (mode === 'client') {
    return [
      'I work autonomously, communicate clearly, and keep delivery grounded in business outcomes.',
      'The output is reliable software, not handoff theatre: working flows, cleaner systems, and faster iteration.',
      ...highlights,
    ];
  }

  return highlights;
}

export function getAboutSummary(mode: VisitorMode): { tagline: string; lines: string[] } {
  switch (mode) {
    case 'recruiter':
      return {
        tagline: 'Full Stack Software Engineer · available for product-focused teams',
        lines: [
          '5+ years shipping software across web, mobile, and desktop products.',
          'Strong track record in modernization, delivery ownership, and pragmatic execution.',
          'Based in Lyon, France and open to full-time opportunities.',
        ],
      };
    case 'engineer':
      return {
        tagline: 'Engineer focused on migration strategy, architecture, and hard debugging',
        lines: [
          'Most effective when a system needs to keep shipping while its complexity is reduced.',
          'Comfortable in backend-heavy and full-stack work, from data flows to UI behavior.',
          'I care about correctness, maintainability, and operational clarity more than novelty.',
        ],
      };
    case 'founder':
      return {
        tagline: 'Product-minded engineer biased toward ownership and shipping momentum',
        lines: [
          'I like ambiguous product work where speed matters but shortcuts still need to hold up.',
          'My value is not just implementation, but keeping delivery moving through complexity.',
          'I can move between architecture, product constraints, and execution detail without much overhead.',
        ],
      };
    case 'client':
      return {
        tagline: 'Autonomous full-stack engineer with a clear delivery and communication style',
        lines: [
          'I work well in direct collaboration, keep progress visible, and reduce avoidable back-and-forth.',
          'The goal is dependable delivery with thoughtful technical decisions behind it.',
          'I am comfortable owning implementation end-to-end and explaining tradeoffs in plain language.',
        ],
      };
    default:
      return {
        tagline: content.bio.tagline,
        lines: content.bio.description,
      };
  }
}

export function getExperienceLead(mode: VisitorMode): string[] {
  switch (mode) {
    case 'recruiter':
      return [
        'Recent roles first, with dates, impact, and hiring-relevant context.',
        'Best fit: product teams that value ownership, modernization, and pragmatic delivery.',
      ];
    case 'engineer':
      return [
        'Focus areas: legacy rewrites, offline-first workflows, sync reliability, and backend-heavy product work.',
        'Read the tech stacks and impact lines as the fastest signal for the kind of systems I like building.',
      ];
    case 'founder':
      return [
        'This experience skews toward shipped products, replacing legacy bottlenecks, and moving quickly without losing control.',
      ];
    case 'client':
      return [
        'Expect a delivery-oriented reading of this history: shipped software, reduced friction, and clearer operations.',
      ];
    default:
      return ['Recent experience with a bias toward product delivery and modernization.'];
  }
}

export function getProjectsLead(mode: VisitorMode): string[] {
  switch (mode) {
    case 'recruiter':
      return ['Featured work first, optimized for signal: impact, stack range, and role fit.'];
    case 'engineer':
      return [
        'Projects ordered for technical depth first: architecture surface area, stack breadth, and implementation complexity.',
      ];
    case 'founder':
      return [
        'Projects ordered for execution and product value: impact, ownership, and shipped outcomes.',
      ];
    case 'client':
      return ['Projects ordered for client-facing outcomes, demos, and communication clarity.'];
    default:
      return ['A balanced view of projects across product, technical depth, and execution.'];
  }
}

export function getContactHint(mode: VisitorMode): string {
  switch (mode) {
    case 'recruiter':
      return 'Best path: highlights → top-projects → resume → contact.';
    case 'engineer':
      return 'Best path: skills → projects → playground → contact.';
    case 'founder':
      return 'Best path: highlights → projects → availability → contact.';
    case 'client':
      return 'Best path: about → projects → contact-me.';
    default:
      return 'Best path: review highlights, skim top-projects, then reach out.';
  }
}

export function renderBulletList(items: string[], accentClass: string = styles.accentGreen) {
  return (
    <div className={styles.flexColumn}>
      {items.map((item) => (
        <div key={item} className={styles.flexBaseline}>
          <span className={accentClass}>›</span>
          <span className={styles.textSecondary}>{item}</span>
        </div>
      ))}
    </div>
  );
}

export function getWhyMePoints(): string[] {
  return WHY_ME_POINTS;
}

export function getAvailabilityPoints(): string[] {
  return AVAILABILITY_POINTS;
}

export function getInterviewPrompts(): string[] {
  return INTERVIEW_PROMPTS;
}

export function getLegacyStory(): string[] {
  return LEGACY_STORY;
}

export function getIncidentStory(): string[] {
  return [
    ...LEGACY_STORY.slice(0, 1),
    'I also use tools pragmatically while keeping observability and correctness in focus.',
    'When incidents happen, I narrow the failure, protect users first, then improve the guardrail that should have caught it.',
  ];
}

export function getOpenAINotes(): string[] {
  return OPENAI_NOTES;
}

export function getGuidedPath(mode: VisitorMode): GuidedPath {
  return GUIDED_PATHS.find((path) => path.id === mode) ?? GUIDED_PATHS[0];
}

export function getGuidedPaths(): GuidedPath[] {
  return GUIDED_PATHS;
}

export function getRecommendations(mode: VisitorMode): string[] {
  const selected = getGuidedPath(mode);
  return selected.commands.slice(0, 3);
}

export function getPathSummary(mode: VisitorMode): string {
  return PATH_SUMMARIES[mode];
}

export function findContent(keyword: string): SearchResult[] {
  const query = normalize(keyword.trim());
  if (!query) return [];

  const results: SearchResult[] = [];

  content.projects.forEach((project) => {
    const haystack = [
      project.name,
      project.description,
      project.technologies.join(' '),
      project.impact,
    ]
      .filter(Boolean)
      .join(' ');
    if (normalize(haystack).includes(query)) {
      results.push({
        section: 'projects',
        title: project.name,
        snippet: project.description,
        command: 'projects',
      });
    }
  });

  content.experience.forEach((job) => {
    const haystack = [
      job.role,
      job.company,
      job.location,
      job.description.join(' '),
      job.technologies?.join(' '),
      job.impact,
    ]
      .filter(Boolean)
      .join(' ');
    if (normalize(haystack).includes(query)) {
      results.push({
        section: 'experience',
        title: `${job.role} @ ${job.company}`,
        snippet: job.shortLabel ?? job.description[0] ?? job.location,
        command: 'experience',
      });
    }
  });

  content.education.forEach((entry) => {
    const haystack = `${entry.degree} ${entry.school} ${entry.location}`;
    if (normalize(haystack).includes(query)) {
      results.push({
        section: 'education',
        title: entry.school,
        snippet: entry.degree,
        command: 'education',
      });
    }
  });

  if (normalize(content.bio.description.join(' ')).includes(query)) {
    results.push({
      section: 'about',
      title: content.bio.name,
      snippet: content.bio.tagline,
      command: 'about',
    });
  }

  return results.slice(0, 8);
}

export function grepVirtualTarget(term: string, target: string): string[] {
  const query = normalize(term);
  if (!query) return [];

  const lines: string[] = [];
  const node = getNode(target);

  if (node?.type === 'file' && node.content) {
    node.content.split('\n').forEach((line, index) => {
      if (normalize(line).includes(query)) {
        lines.push(`${target}:${index + 1}: ${line}`);
      }
    });
    return lines;
  }

  const namedTargets: Record<string, string[]> = {
    projects: content.projects.flatMap((project) => [
      project.name,
      project.description,
      project.technologies.join(', '),
      project.impact ?? '',
    ]),
    experience: content.experience.flatMap((job) => [
      job.role,
      job.company,
      ...job.description,
      job.impact ?? '',
    ]),
    skills: [
      ...content.skills.languages,
      ...content.skills.frameworks,
      ...content.skills.tools,
      ...content.skills.softSkills,
    ],
    contact: content.socials.map((social) => `${social.platform}: ${social.username}`),
  };

  const section = namedTargets[target.toLowerCase()];
  if (!section) return [];

  section.forEach((line, index) => {
    if (normalize(line).includes(query)) {
      lines.push(`${target}:${index + 1}: ${line}`);
    }
  });

  return lines;
}

export function resolveOpenTarget(rawTarget: string): { label: string; url: string } | null {
  const target = normalize(rawTarget);

  const project = content.projects.find(
    (item) =>
      normalize(item.name) === target ||
      normalize(item.shortLabel ?? '') === target ||
      normalize(item.name).includes(target)
  );

  if (project?.url) {
    return { label: project.name, url: project.url };
  }

  if (project?.repo) {
    return { label: `${project.name} repository`, url: project.repo };
  }

  if (target === 'resume' || target === 'cv') {
    return { label: 'Resume', url: resolveSitePath('/resume.pdf') };
  }

  const social = content.socials.find(
    (item) => normalize(item.platform) === target || normalize(item.username) === target
  );

  if (social) {
    return { label: social.platform, url: social.url };
  }

  return null;
}
