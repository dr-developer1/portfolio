import type { GuidedPath, VisitorMode } from '../types';

export const WHY_ME_POINTS = [
  'Full-stack engineer with 6+ years shipping products across web, mobile, and desktop.',
  'Strong on legacy modernization, pragmatic architecture, and difficult debugging.',
  'Comfortable moving between product delivery, technical leadership, and implementation detail.',
];

export const AVAILABILITY_POINTS = [
  'Based in Lyon, France.',
  'Open to full-time software engineering opportunities.',
  'Most effective in product teams that value ownership, migration strategy, and clean delivery.',
];

export const INTERVIEW_PROMPTS = [
  'Ask me about modernizing legacy applications without freezing delivery.',
  'Ask me how I approach offline-first product design and sync reliability.',
  'Ask me how I debug high-friction production issues and reduce recurrence.',
];

export const LEGACY_STORY = [
  'I am strongest when a codebase needs to keep shipping while being rebuilt safely.',
  'My bias is incremental modernization: isolate risk, protect behavior, and replace complexity in slices.',
  'I care about maintainability, not just greenfield polish.',
];

export const INCIDENT_STORY = [
  'My troubleshooting pattern is simple: reproduce, narrow the blast radius, instrument the unknowns, and fix the root cause before polishing symptoms.',
  'I prefer postmortem thinking even for small bugs: what failed, why it escaped, and which guardrail would have prevented it.',
];

export const OPENAI_NOTES = [
  'I use AI to accelerate exploration, mapping, and repetitive work, not to replace engineering judgment.',
  'I keep a human review loop around architecture, edge cases, and production-risk decisions.',
  'The best use is leverage: faster prototypes, migration support, and better tooling for real teams.',
];

export const RECRUITER_TOUR = ['highlights', 'experience', 'top-projects', 'why-me', 'contact'];

export const GUIDED_PATHS: GuidedPath[] = [
  {
    id: 'recruiter',
    label: 'Recruiter',
    summary: 'Fast path to impact, experience, standout projects, and contact details.',
    commands: ['highlights', 'timeline', 'top-projects', 'why-me', 'resume'],
  },
  {
    id: 'engineer',
    label: 'Engineer',
    summary: 'Focus on architecture, migrations, playground, and technical depth.',
    commands: ['skills', 'legacy', 'interview', 'playground --challenge debugging', 'openai'],
  },
  {
    id: 'founder',
    label: 'Founder',
    summary: 'Bias toward product delivery, ownership, execution speed, and versatility.',
    commands: ['highlights', 'projects', 'availability', 'contact'],
  },
  {
    id: 'client',
    label: 'Client',
    summary: 'See product outcomes, stack breadth, and communication clarity.',
    commands: ['about', 'projects', 'skills', 'contact'],
  },
  {
    id: 'standard',
    label: 'Standard',
    summary: 'Balanced default experience.',
    commands: ['help', 'highlights', 'projects', 'contact'],
  },
];

export const PATH_SUMMARIES: Record<VisitorMode, string> = Object.fromEntries(
  GUIDED_PATHS.map((path) => [path.id, path.summary])
) as Record<VisitorMode, string>;
