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

export function getTopProjects(): ProjectItem[] {
  return getFeaturedProjects().length > 0 ? getFeaturedProjects() : content.projects.slice(0, 3);
}

export function getHighlights(): string[] {
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

  return highlights;
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
    return { label: 'Resume', url: '/resume.pdf' };
  }

  const social = content.socials.find(
    (item) => normalize(item.platform) === target || normalize(item.username) === target
  );

  if (social) {
    return { label: social.platform, url: social.url };
  }

  return null;
}
