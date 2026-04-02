import React from 'react';

import {
  CommandShortcutList,
  EducationEntry,
  JobEntry,
  ProjectCard,
  SkillSection,
} from '../components/Output';
import { SYSTEM_CONFIG, UI_CONSTANTS } from '../config';
import { MUSIC_STORAGE_KEY, MATRIX_STORAGE_KEY } from '../hooks/storageKeys';
import type { Command, CommandCategory, VisitorMode } from '../types';
import { clearRegistry, getAllCommands, registerCommands } from '../utils/commandRegistry';
import { getNode, resolvePath } from '../utils/fileSystem';
import {
  getAboutSummary,
  findContent,
  getAvailabilityPoints,
  getContactHint,
  getGuidedPath,
  getGuidedPaths,
  getHighlights,
  getExperienceLead,
  getInterviewPrompts,
  getLegacyStory,
  getOpenAINotes,
  getProjectsForMode,
  getProjectsLead,
  getRecommendations,
  getTopProjects,
  getWhyMePoints,
  grepVirtualTarget,
  renderBulletList,
  resolveOpenTarget,
} from '../utils/portfolioInsights';
import { unlockAdmin, unlockVault, ACHIEVEMENTS } from '../utils/progressService';
import { getStoredBoolean } from '../utils/storageHelpers';
import { AVAILABLE_THEMES, getDefaultTheme, isValidTheme } from '../utils/themeService';
import { renderDirectoryTree } from '../utils/treeRenderer';
import styles from '../styles/outputUtilities.module.css';
import { content } from './content';
import { RECRUITER_TOUR } from './guides';

const CATEGORY_LABELS: Record<CommandCategory, string> = {
  core: 'Core',
  career: 'Career',
  projects: 'Projects',
  playground: 'Playground',
  fun: 'Fun',
  system: 'System',
};

function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

  return parts.join(' ');
}

function renderCommandGroups(commands: Command[]) {
  const visible = commands.filter((command) => !command.hidden);
  const grouped = visible.reduce<Record<CommandCategory, Command[]>>(
    (acc, command) => {
      acc[command.category].push(command);
      return acc;
    },
    {
      core: [],
      career: [],
      projects: [],
      playground: [],
      fun: [],
      system: [],
    }
  );

  return (
    <div className={styles.flexColumn}>
      {Object.entries(grouped).map(([category, items]) =>
        items.length === 0 ? null : (
          <div key={category}>
            <div className={styles.headerSection}>
              {CATEGORY_LABELS[category as CommandCategory]}
            </div>
            <div className={styles.commandGrid}>
              {items
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((cmd) => (
                  <React.Fragment key={cmd.name}>
                    <span className={styles.accentGreen}>{cmd.name}</span>
                    <span className={styles.textSecondary}>{cmd.description}</span>
                  </React.Fragment>
                ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}

function renderCommandDetails(command: Command) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelTitle}>
        {command.name} <span className={styles.tag}>{CATEGORY_LABELS[command.category]}</span>
      </div>
      <div className={styles.textSecondary}>{command.description}</div>
      <div className={styles.marginTopMedium}>
        <span className={styles.textMuted}>Usage: </span>
        <span className={styles.accentGreen}>{command.usage}</span>
      </div>
      {command.aliases && command.aliases.length > 0 && (
        <div className={styles.marginTopSmall}>
          <span className={styles.textMuted}>Aliases: </span>
          <span className={styles.accentPurple}>{command.aliases.join(', ')}</span>
        </div>
      )}
      {command.hidden && (
        <div className={styles.marginTopSmall}>
          <span className={styles.accentYellow}>Hidden command</span>
        </div>
      )}
    </div>
  );
}

function renderPathButtons(mode: VisitorMode) {
  const path = getGuidedPath(mode);
  return (
    <CommandShortcutList
      title={`${path.label} path`}
      items={path.commands.map((command) => ({
        label: command,
        command,
      }))}
    />
  );
}

function getHelpShortcuts(mode: VisitorMode) {
  return getRecommendations(mode).map((command) => ({
    label: command,
    command,
  }));
}

const helpCommand: Command = {
  name: 'help',
  description: 'Display available commands and recommended paths',
  usage: 'help [command]',
  aliases: ['?', 'commands'],
  category: 'core',
  featured: true,
  execute: (args, addOutput, context) => {
    const commands = getAllCommands();

    if (args.length > 0) {
      const query = args[0].toLowerCase();
      const command = commands.find((item) => item.name === query || item.aliases?.includes(query));

      if (!command) {
        addOutput(<span className={styles.error}>Unknown command: {query}</span>, 'error');
        return;
      }

      addOutput(renderCommandDetails(command));
      return;
    }

    addOutput(
      <div className={styles.flexColumn}>
        <CommandShortcutList
          title={
            context.visitorMode === 'standard'
              ? 'Best commands to start with'
              : `${context.visitorMode} quick start`
          }
          items={getHelpShortcuts(context.visitorMode)}
        />
        {renderCommandGroups(commands)}
        <div className={styles.textMuted}>
          Type <span className={styles.accentGreen}>help [command]</span> for details. Hidden
          commands are discoverable but intentionally not listed here.
        </div>
      </div>
    );
  },
};

const clearCommand: Command = {
  name: 'clear',
  description: 'Clear the terminal screen',
  usage: 'clear',
  aliases: ['cls', 'reset'],
  category: 'core',
  execute: (_args, _addOutput, context) => {
    context.clearTerminal();
  },
};

const echoCommand: Command = {
  name: 'echo',
  description: 'Display a message',
  usage: 'echo [message]',
  category: 'system',
  execute: (args, addOutput) => addOutput(<span>{args.join(' ')}</span>),
};

const aboutCommand: Command = {
  name: 'about',
  description: 'Display a concise profile summary',
  usage: 'about',
  aliases: ['bio'],
  category: 'career',
  execute: (_args, addOutput, context) => {
    const summary = getAboutSummary(context.visitorMode);
    addOutput(
      <div>
        <div className={`${styles.accentCyan} ${styles.bold} ${styles.fontSize11}`}>
          {content.bio.name}
        </div>
        <div className={`${styles.accentPurple} ${styles.marginBottomMedium}`}>
          {summary.tagline}
        </div>
        <div className={styles.textPrimary}>
          {summary.lines.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
      </div>
    );
  },
};

const skillsCommand: Command = {
  name: 'skills',
  description: 'Display technical skills',
  usage: 'skills',
  aliases: ['stack', 'tech'],
  category: 'career',
  execute: (_args, addOutput) => {
    addOutput(
      <div>
        <SkillSection title="Languages" items={content.skills.languages} color="orange" />
        <SkillSection title="Frameworks" items={content.skills.frameworks} color="green" />
        <SkillSection title="Infra & Tools" items={content.skills.tools} color="cyan" />
        <SkillSection title="Soft Skills" items={content.skills.softSkills} color="purple" />
      </div>
    );
  },
};

const experienceCommand: Command = {
  name: 'experience',
  description: 'Display professional experience',
  usage: 'experience',
  aliases: ['exp', 'work', 'jobs'],
  category: 'career',
  featured: true,
  execute: (_args, addOutput, context) => {
    addOutput(
      <div className={styles.flexColumnLarge}>
        <div className={styles.panel}>
          <div className={styles.panelTitle}>Experience focus · {context.visitorMode}</div>
          {renderBulletList(getExperienceLead(context.visitorMode), styles.accentCyan)}
        </div>
        {content.experience.map((job) => (
          <JobEntry key={`${job.company}-${job.date}`} job={job} />
        ))}
      </div>
    );
  },
};

const educationCommand: Command = {
  name: 'education',
  description: 'Display educational background',
  usage: 'education',
  aliases: ['edu'],
  category: 'career',
  execute: (_args, addOutput) => {
    addOutput(
      <div className={styles.flexColumn}>
        {content.education.map((education) => (
          <EducationEntry key={`${education.school}-${education.date}`} education={education} />
        ))}
      </div>
    );
  },
};

const projectsCommand: Command = {
  name: 'projects',
  description: 'Display featured projects',
  usage: 'projects',
  aliases: ['proj', 'portfolio'],
  category: 'projects',
  featured: true,
  execute: (_args, addOutput, context) => {
    addOutput(
      <div className={styles.flexColumn}>
        <div className={styles.panel}>
          <div className={styles.panelTitle}>Project focus · {context.visitorMode}</div>
          {renderBulletList(getProjectsLead(context.visitorMode), styles.accentPurple)}
        </div>
        {getProjectsForMode(context.visitorMode).map((project) => (
          <ProjectCard key={project.name} project={project} />
        ))}
      </div>
    );
  },
};

const topProjectsCommand: Command = {
  name: 'top-projects',
  description: 'Show the strongest recruiter-facing projects first',
  usage: 'top-projects',
  category: 'projects',
  featured: true,
  execute: (_args, addOutput, context) => {
    addOutput(
      <div className={styles.flexColumn}>
        <div className={styles.panel}>
          <div className={styles.panelTitle}>Top projects · {context.visitorMode}</div>
          {renderBulletList(getProjectsLead(context.visitorMode), styles.accentGreen)}
        </div>
        {getTopProjects(context.visitorMode).map((project) => (
          <ProjectCard key={project.name} project={project} />
        ))}
      </div>
    );
  },
};

const githubCommand: Command = {
  name: 'github',
  description: 'View live GitHub stats and recent public activity',
  usage: 'github',
  category: 'projects',
  execute: async (_args, addOutput) => {
    addOutput(<span className={styles.textSecondary}>Fetching GitHub data…</span>);

    try {
      const [userRes, reposRes] = await Promise.all([
        fetch('https://api.github.com/users/dr-developer1'),
        fetch('https://api.github.com/users/dr-developer1/repos?sort=pushed&per_page=5'),
      ]);

      if (!userRes.ok || !reposRes.ok) {
        throw new Error('API error');
      }

      const user = (await userRes.json()) as {
        followers: number;
        public_repos: number;
        bio: string;
      };

      const repos = (await reposRes.json()) as Array<{
        name: string;
        language: string | null;
        stargazers_count: number;
        html_url: string;
      }>;

      addOutput(
        <div className={styles.flexColumn}>
          <div className={styles.headerSection}>GitHub · dr-developer1</div>
          <div className={styles.infoGrid}>
            <span className={styles.textMuted}>Followers</span>
            <span>{user.followers}</span>
            <span className={styles.textMuted}>Public repos</span>
            <span>{user.public_repos}</span>
          </div>
          {user.bio && <div className={styles.textSecondary}>{user.bio}</div>}
          <div className={styles.headerSection}>Recent repos</div>
          {repos.map((repo) => (
            <div key={repo.name} className={styles.flexBaseline}>
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.textLink}
              >
                {repo.name}
              </a>
              <span className={styles.textMuted}>
                {repo.language ?? 'unknown'} · ⭐ {repo.stargazers_count}
              </span>
            </div>
          ))}
        </div>
      );
    } catch {
      addOutput(
        <span className={styles.error}>
          Could not fetch GitHub data. You may be rate-limited. Try again in a minute.
        </span>,
        'error'
      );
    }
  },
};

const contactCommand: Command = {
  name: 'contact',
  description: 'Display contact information',
  usage: 'contact',
  aliases: ['socials', 'email'],
  category: 'career',
  featured: true,
  execute: (_args, addOutput, context) => {
    addOutput(
      <div className={styles.flexColumn}>
        <div className={styles.infoGrid}>
          {content.socials.map((link) => (
            <React.Fragment key={link.platform}>
              <span className={styles.accentPurple}>{link.platform}:</span>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.textLink}
              >
                {link.username}
              </a>
            </React.Fragment>
          ))}
        </div>
        <div className={styles.textSecondary}>{getContactHint(context.visitorMode)}</div>
      </div>
    );
  },
};

const contactMeCommand: Command = {
  name: 'contact-me',
  description: 'Open email client to reach out directly',
  usage: 'contact-me',
  aliases: ['hire-me', 'reach-out'],
  category: 'career',
  execute: (_args, addOutput) => {
    const subject = encodeURIComponent('Opportunity - via Portfolio');
    const body = encodeURIComponent(
      'Hi Ahmad,\n\nI came across your portfolio and would love to connect.\n\n'
    );

    window.location.href = `mailto:aibrahim0@outlook.com?subject=${subject}&body=${body}`;

    addOutput(
      <span className={styles.success}>
        Opening your email client… Subject and intro pre-filled.
      </span>,
      'success'
    );
  },
};

const whoamiCommand: Command = {
  name: 'whoami',
  description: 'Display current user and session identity card',
  usage: 'whoami [--raw]',
  category: 'core',
  execute: (args, addOutput, context) => {
    const user = context.user;

    if (args[0] === '--raw') {
      addOutput(<span className={styles.accentGreen}>{user}</span>);
      return;
    }

    addOutput(
      <div className={styles.panel}>
        <div className={styles.panelTitle}>Identity</div>
        <div className={styles.infoGrid}>
          <span className={styles.textMuted}>User</span>
          <span className={styles.accentGreen}>{user}</span>
          <span className={styles.textMuted}>Role</span>
          <span>Full Stack Software Engineer</span>
          <span className={styles.textMuted}>Location</span>
          <span>Lyon, France</span>
          <span className={styles.textMuted}>Current path</span>
          <span className={styles.accentCyan}>{context.visitorMode}</span>
          <span className={styles.textMuted}>Shell</span>
          <span>
            {user}@{SYSTEM_CONFIG.hostname}
          </span>
        </div>
      </div>
    );
  },
  autocomplete: (partial) => ['--raw'].filter((item) => item.startsWith(partial.toLowerCase())),
};

const dateCommand: Command = {
  name: 'date',
  description: 'Display current date and time',
  usage: 'date',
  category: 'system',
  execute: (_args, addOutput) => {
    addOutput(
      <span>
        {new Date().toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short',
        })}
      </span>
    );
  },
};

const shareCommand: Command = {
  name: 'share',
  description: 'Generate a shareable link (optionally auto-run a command)',
  usage: 'share [command]',
  category: 'core',
  execute: async (args, addOutput) => {
    const commandToShare = args.join(' ').trim();
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    const shareUrl = commandToShare
      ? `${baseUrl}?run=${encodeURIComponent(commandToShare)}`
      : baseUrl;

    let copied = false;
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        copied = true;
      } catch {
        copied = false;
      }
    }

    addOutput(
      <div className={styles.flexColumn}>
        <span className={copied ? styles.success : styles.textSecondary}>
          {copied ? 'Share link copied to clipboard.' : 'Share link generated.'}
        </span>
        <a href={shareUrl} target="_blank" rel="noopener noreferrer" className={styles.textLink}>
          {shareUrl}
        </a>
        <span className={styles.textMuted}>
          {commandToShare
            ? `This link auto-runs "${commandToShare}" once on page load.`
            : 'Pass a command to create a deep link, for example: share tour'}
        </span>
      </div>,
      copied ? 'success' : 'info'
    );
  },
};

const uptimeCommand: Command = {
  name: 'uptime',
  description: 'Show how long this terminal session has been running',
  usage: 'uptime',
  category: 'system',
  execute: (_args, addOutput, context) => {
    const start = context.sessionStartedAt;
    const elapsed = Date.now() - start;

    addOutput(
      <div className={styles.flexColumn}>
        <div className={styles.flexBaseline}>
          <span className={styles.accentGreen}>Session uptime</span>
          <span className={styles.textSecondary}>{formatDuration(elapsed)}</span>
        </div>
        <div className={styles.textMuted}>Started at {new Date(start).toLocaleTimeString()}</div>
      </div>
    );
  },
};

const pingCommand: Command = {
  name: 'ping',
  description: 'Measure HTTP response latency to the current host',
  usage: 'ping',
  category: 'system',
  execute: async (_args, addOutput) => {
    addOutput(<span className={styles.textSecondary}>Pinging host over HTTP…</span>);

    const startedAt = performance.now();

    try {
      await fetch(`${window.location.origin}/`, {
        method: 'HEAD',
        cache: 'no-store',
      });
      const elapsed = Math.max(1, Math.round(performance.now() - startedAt));
      addOutput(<span className={styles.success}>http pong {elapsed}ms</span>, 'success');
    } catch {
      const elapsed = Math.max(1, Math.round(performance.now() - startedAt));
      addOutput(
        <span className={styles.warning}>Host did not respond cleanly (approx. {elapsed}ms).</span>,
        'warning'
      );
    }
  },
};

const historyCommand: Command = {
  name: 'history',
  description: 'Show command history',
  usage: 'history',
  category: 'core',
  execute: (_args, addOutput, context) => {
    addOutput(
      <div>
        {context.commandHistory.map((cmd, index) => (
          <div key={`${index + 1}-${cmd}`} className={styles.textSecondary}>
            <span className={`${styles.textMuted} ${styles.historyIndex}`}>{index + 1}</span>
            {cmd}
          </div>
        ))}
      </div>
    );
  },
};

const lsCommand: Command = {
  name: 'ls',
  description: 'List directory contents',
  usage: 'ls [directory]',
  category: 'core',
  execute: (args, addOutput, context) => {
    const targetPath = resolvePath(context.currentDirectory, args[0] ?? '.', context.user);
    const node = getNode(targetPath);

    if (!node) {
      addOutput(
        <span className={styles.error}>
          ls: cannot access '{args[0] ?? '.'}': No such file or directory
        </span>,
        'error'
      );
      return;
    }

    if (node.type === 'file') {
      addOutput(<span>{node.name}</span>);
      return;
    }

    const entries = Array.from(node.children?.entries() ?? []).sort((a, b) =>
      a[0].localeCompare(b[0])
    );

    if (entries.length === 0) {
      addOutput(<span className={styles.textMuted}>Directory is empty.</span>, 'info');
      return;
    }

    addOutput(
      <div className={styles.flexRowGap}>
        {entries.map(([name, child]) => {
          const isDir = child.type === 'directory';
          return (
            <span
              key={name}
              className={isDir ? `${styles.accentBlue} ${styles.bold}` : styles.textPrimary}
            >
              {name}
              {isDir ? '/' : ''}
            </span>
          );
        })}
      </div>
    );
  },
};

const cdCommand: Command = {
  name: 'cd',
  description: 'Change the shell working directory',
  usage: 'cd [directory]',
  category: 'core',
  execute: (args, addOutput, context) => {
    const targetArg = args[0] || '~';
    const targetPath = resolvePath(context.currentDirectory, targetArg, context.user);
    const node = getNode(targetPath);

    if (!node) {
      addOutput(
        <span className={styles.error}>cd: {targetArg}: No such file or directory</span>,
        'error'
      );
      return;
    }

    if (node.type !== 'directory') {
      addOutput(<span className={styles.error}>cd: {targetArg}: Not a directory</span>, 'error');
      return;
    }

    context.setCurrentDirectory(targetPath);
  },
};

const pwdCommand: Command = {
  name: 'pwd',
  description: 'Print current working directory',
  usage: 'pwd',
  category: 'core',
  execute: (_args, addOutput, context) => {
    addOutput(<span>{resolvePath(context.currentDirectory, '.', context.user)}</span>);
  },
};

const catCommand: Command = {
  name: 'cat',
  description: 'Display a file from the virtual filesystem',
  usage: 'cat [file]',
  category: 'core',
  execute: (args, addOutput, context) => {
    if (!args[0]) {
      addOutput(<span className={styles.error}>Usage: cat [file]</span>, 'error');
      return;
    }

    const targetPath = resolvePath(context.currentDirectory, args[0], context.user);
    const node = getNode(targetPath);

    if (!node) {
      addOutput(
        <span className={styles.error}>cat: {args[0]}: No such file or directory</span>,
        'error'
      );
      return;
    }

    if (node.type === 'directory') {
      addOutput(<span className={styles.error}>cat: {args[0]}: Is a directory</span>, 'error');
      return;
    }

    addOutput(<div className={styles.textPreWrap}>{node.content}</div>);
  },
};

const treeCommand: Command = {
  name: 'tree',
  description: 'Display directory structure',
  usage: 'tree [directory]',
  category: 'core',
  execute: (args, addOutput, context) => {
    const rootPath = resolvePath(context.currentDirectory, args[0] || '.', context.user);
    const rootNode = getNode(rootPath);

    if (!rootNode || rootNode.type !== 'directory') {
      addOutput(
        <span className={styles.error}>tree: {args[0] || '.'}: Not a directory</span>,
        'error'
      );
      return;
    }

    const rootLabel = rootPath === '/' ? '/' : rootPath.split('/').filter(Boolean).pop() || '/';
    const [treeLines, wasLimited] = renderDirectoryTree(rootNode);

    addOutput(
      <div>
        <div className={`${styles.accentBlue} ${styles.bold}`}>{rootLabel}</div>
        {treeLines}
        {wasLimited && (
          <div className={`${styles.textMuted} ${styles.textSmall} ${styles.marginTopMedium}`}>
            Maximum depth reached ({UI_CONSTANTS.MAX_TREE_DEPTH} levels) - some directories not
            shown
          </div>
        )}
      </div>
    );
  },
};

const highlightsCommand: Command = {
  name: 'highlights',
  description: 'Summarize the strongest proof points quickly',
  usage: 'highlights',
  category: 'career',
  featured: true,
  execute: (_args, addOutput, context) => {
    addOutput(
      <div className={styles.flexColumn}>
        <div className={styles.headerSection}>Highlights</div>
        {renderBulletList(getHighlights(context.visitorMode))}
      </div>
    );
  },
};

const timelineCommand: Command = {
  name: 'timeline',
  description: 'Show a concise career and education timeline',
  usage: 'timeline',
  category: 'career',
  execute: (_args, addOutput) => {
    addOutput(
      <div className={styles.flexColumn}>
        <div className={styles.headerSection}>Career Timeline</div>
        {content.experience.map((job) => (
          <div key={`${job.company}-${job.date}`} className={styles.flexBaseline}>
            <span className={styles.accentGreen}>{job.date}</span>
            <span className={styles.textSecondary}>
              {job.role} @ {job.company}
            </span>
          </div>
        ))}
        <div className={styles.headerSection}>Education</div>
        {content.education.map((education) => (
          <div key={`${education.school}-${education.date}`} className={styles.flexBaseline}>
            <span className={styles.accentGreen}>{education.date}</span>
            <span className={styles.textSecondary}>
              {education.degree} · {education.school}
            </span>
          </div>
        ))}
      </div>
    );
  },
};

const whyMeCommand: Command = {
  name: 'why-me',
  description: 'Explain the strongest hiring case in a few lines',
  usage: 'why-me',
  category: 'career',
  execute: (_args, addOutput) => {
    addOutput(
      <div className={styles.flexColumn}>
        <div className={styles.headerSection}>Why Me</div>
        {renderBulletList(getWhyMePoints(), styles.accentPurple)}
      </div>
    );
  },
};

const availabilityCommand: Command = {
  name: 'availability',
  description: 'Show practical hiring information',
  usage: 'availability',
  category: 'career',
  execute: (_args, addOutput) => {
    addOutput(
      <div className={styles.flexColumn}>
        <div className={styles.headerSection}>Availability</div>
        {renderBulletList(getAvailabilityPoints(), styles.accentBlue)}
      </div>
    );
  },
};

const tourCommand: Command = {
  name: 'tour',
  description: 'Start a recruiter-friendly guided path',
  usage: 'tour',
  category: 'career',
  featured: true,
  execute: (_args, addOutput, context) => {
    const progress = context.visitorProgress;
    const completed = RECRUITER_TOUR.filter((command) =>
      progress.discoveredCommands.includes(command)
    ).length;
    const nextStep = RECRUITER_TOUR.find(
      (command) => !progress.discoveredCommands.includes(command)
    );

    context.setVisitorMode('recruiter');
    addOutput(
      <div className={styles.flexColumn}>
        <CommandShortcutList
          title="Recruiter tour"
          items={RECRUITER_TOUR.map((command) => ({ label: command, command }))}
        />
        <span className={styles.textMuted}>
          Progress: {completed}/{RECRUITER_TOUR.length}
          {nextStep ? (
            <>
              {' '}
              • Next recommended: <span className={styles.accentGreen}>{nextStep}</span>
            </>
          ) : (
            ' • Tour complete. Try recommend for personalized next steps.'
          )}
        </span>
      </div>
    );
  },
};

const modeCommand: Command = {
  name: 'mode',
  description: 'Switch the guided experience path',
  usage: 'mode [standard | recruiter | engineer | founder | client]',
  category: 'system',
  execute: (args, addOutput, context) => {
    if (args.length === 0) {
      addOutput(
        <div className={styles.flexColumn}>
          <div className={styles.headerSection}>Choose Your Path</div>
          {getGuidedPaths().map((path) => (
            <div key={path.id} className={styles.marginBottomSmall}>
              <span className={styles.accentGreen}>{path.label}</span>
              <span className={styles.separator}> — </span>
              <span className={styles.textSecondary}>{path.summary}</span>
            </div>
          ))}
          <CommandShortcutList
            title="Switch path"
            items={getGuidedPaths()
              .filter((path) => path.id !== 'standard')
              .map((path) => ({ label: path.label, command: `mode ${path.id}` }))}
          />
        </div>
      );
      return;
    }

    const nextMode = args[0].toLowerCase() as VisitorMode;
    const allowedModes: VisitorMode[] = ['standard', 'recruiter', 'engineer', 'founder', 'client'];

    if (!allowedModes.includes(nextMode)) {
      addOutput(<span className={styles.error}>Unknown mode: {nextMode}</span>, 'error');
      return;
    }

    context.setVisitorMode(nextMode);
    addOutput(
      <div className={styles.flexColumn}>
        <span className={styles.success}>Path switched to {nextMode}.</span>
        {renderPathButtons(nextMode)}
      </div>,
      'success'
    );
  },
};

const startCommand: Command = {
  name: 'start',
  description: 'Alias for guided path selection',
  usage: 'start [mode]',
  category: 'core',
  execute: (args, addOutput, context) => modeCommand.execute(args, addOutput, context),
};

const recommendCommand: Command = {
  name: 'recommend',
  description: 'Suggest the next best commands based on the current path',
  usage: 'recommend',
  aliases: ['next'],
  category: 'core',
  execute: (_args, addOutput, context) => {
    const mode = context.visitorMode;
    addOutput(
      <CommandShortcutList
        title={`Recommended next steps for ${mode}`}
        items={getRecommendations(mode).map((command) => ({ label: command, command }))}
      />
    );
  },
};

const chooseYourPathCommand: Command = {
  name: 'choose-your-path',
  description: 'Open guided paths tailored to your visitor type',
  usage: 'choose-your-path',
  category: 'career',
  hidden: true,
  execute: (_args, addOutput, context) => modeCommand.execute([], addOutput, context),
};

const diagnoseCommand: Command = {
  name: 'diagnose',
  description: 'Route visitors to the most relevant commands',
  usage: 'diagnose me',
  category: 'career',
  hidden: true,
  execute: (_args, addOutput) => {
    addOutput(
      <CommandShortcutList
        title="What are you here for?"
        items={[
          { label: 'Hiring overview', command: 'mode recruiter' },
          { label: 'Technical depth', command: 'mode engineer' },
          { label: 'Product delivery', command: 'mode founder' },
          { label: 'Client-friendly overview', command: 'mode client' },
        ]}
      />
    );
  },
};

const themeCommand: Command = {
  name: 'theme',
  description: 'Manage terminal themes',
  usage: 'theme [list | reset | <name>]',
  category: 'system',
  execute: (args, addOutput) => {
    if (args.length === 0) {
      addOutput(
        <div>
          <div>Usage: theme [list | reset | &lt;name&gt;]</div>
          <div className={styles.marginTopMedium}>
            Available themes: {AVAILABLE_THEMES.join(', ')}
          </div>
        </div>
      );
      return;
    }

    const value = args[0].toLowerCase();
    if (value === 'list') {
      addOutput(
        <div className={styles.flexColumn}>
          {AVAILABLE_THEMES.map((theme) => (
            <div key={theme}>
              <span className={styles.accentGreen}>•</span> {theme}
            </div>
          ))}
        </div>
      );
      return;
    }

    if (value === 'reset') {
      const defaultTheme = getDefaultTheme();
      window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme: defaultTheme } }));
      addOutput(<span className={styles.success}>Theme reset to {defaultTheme}</span>, 'success');
      return;
    }

    if (!isValidTheme(value)) {
      addOutput(
        <span className={styles.error}>
          Invalid theme '{value}'. Type 'theme list' to see valid options.
        </span>,
        'error'
      );
      return;
    }

    window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme: value } }));
    addOutput(<span className={styles.success}>Theme switched to {value}</span>, 'success');
  },
  autocomplete: (partial) =>
    ['list', 'reset', ...AVAILABLE_THEMES].filter((item) => item.startsWith(partial.toLowerCase())),
};

const resumeCommand: Command = {
  name: 'resume',
  description: 'Download or open the resume',
  usage: 'resume',
  aliases: ['cv', 'download-cv'],
  category: 'career',
  featured: true,
  execute: (_args, addOutput) => {
    addOutput(
      <div>
        <span className={styles.success}>Opening resume…</span>
        <div className={styles.textSecondary}>
          If it does not open automatically, use{' '}
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.textLink}
          >
            this direct link
          </a>
          .
        </div>
      </div>,
      'success'
    );
    window.open('/resume.pdf', '_blank', 'noopener,noreferrer');
  },
};

const playgroundCommand: Command = {
  name: 'playground',
  description: 'Open the coding playground or a prepared challenge',
  usage: 'playground [--demo | --challenge <algorithm|debugging|typing>]',
  aliases: ['code', 'editor'],
  category: 'playground',
  featured: true,
  execute: (args, addOutput, context) => {
    let preset: 'default' | 'demo' | 'algorithm' | 'debugging' | 'typing' = 'default';

    if (args[0] === '--demo') {
      preset = 'demo';
    } else if (args[0] === '--challenge') {
      const challenge = (args[1] ?? '').toLowerCase();
      if (challenge === 'algorithm' || challenge === 'debugging' || challenge === 'typing') {
        preset = challenge;
      } else {
        addOutput(
          <span className={styles.error}>
            Unknown challenge. Use algorithm, debugging, or typing.
          </span>,
          'error'
        );
        return;
      }
    }

    context.openPlayground(preset);
    addOutput(
      <div className={styles.panel}>
        <div className={styles.panelTitle}>Coding Playground</div>
        <div className={styles.textSecondary}>
          Fully client-side sandbox powered by{' '}
          <span className={styles.accentGreen}>Monaco Editor</span>,{' '}
          <span className={styles.accentCyan}>esbuild-wasm</span> (JS/TS), and{' '}
          <span className={styles.accentPurple}>Pyodide</span> (Python). No server. No backend.
        </div>
        <div className={styles.textMuted}>
          Opening {preset === 'default' ? 'workspace' : `preset: ${preset}`}…
        </div>
      </div>
    );
  },
};

const effectCommand: Command = {
  name: 'effect',
  description: 'Control visual effects',
  usage: 'effect matrix [on | off | toggle]',
  category: 'fun',
  execute: (args, addOutput) => {
    if (args.length < 2 || args[0].toLowerCase() !== 'matrix') {
      addOutput(<span>Usage: effect matrix [on | off | toggle]</span>);
      return;
    }

    const action = args[1].toLowerCase();
    const current = getStoredBoolean(MATRIX_STORAGE_KEY, true);
    const next = action === 'toggle' ? !current : action === 'on';

    if (!['on', 'off', 'toggle'].includes(action)) {
      addOutput(
        <span className={styles.error}>Invalid action. Use on, off, or toggle.</span>,
        'error'
      );
      return;
    }

    window.dispatchEvent(new CustomEvent('matrix-toggle', { detail: { enabled: next } }));
    addOutput(
      <span className={next ? styles.success : styles.textSecondary}>
        Matrix effect {next ? 'enabled' : 'disabled'}.
      </span>,
      next ? 'success' : 'info'
    );
  },
  autocomplete: (partial) => ['matrix'].filter((item) => item.startsWith(partial.toLowerCase())),
};

const musicCommand: Command = {
  name: 'music',
  description: 'Control background music',
  usage: 'music [on | off | toggle]',
  aliases: ['audio', 'sound'],
  category: 'fun',
  execute: (args, addOutput) => {
    if (args.length === 0) {
      addOutput(<span>Usage: music [on | off | toggle]</span>);
      return;
    }

    const action = args[0].toLowerCase();
    const current = getStoredBoolean(MUSIC_STORAGE_KEY, true);
    const next = action === 'toggle' ? !current : action === 'on';

    if (!['on', 'off', 'toggle'].includes(action)) {
      addOutput(
        <span className={styles.error}>Invalid action. Use on, off, or toggle.</span>,
        'error'
      );
      return;
    }

    window.dispatchEvent(new CustomEvent('music-toggle', { detail: { enabled: next } }));
    addOutput(
      <span className={next ? styles.success : styles.textSecondary}>
        Background music {next ? 'enabled' : 'disabled'}.
      </span>,
      next ? 'success' : 'info'
    );
  },
  autocomplete: (partial) =>
    ['on', 'off', 'toggle'].filter((item) => item.startsWith(partial.toLowerCase())),
};

const neofetchCommand: Command = {
  name: 'neofetch',
  description: 'Display system info in neofetch style',
  usage: 'neofetch',
  category: 'fun',
  execute: (_args, addOutput) => {
    const theme = document.documentElement.getAttribute('data-theme') ?? 'dark';

    addOutput(
      <div className={styles.flexRowGap}>
        <pre className={styles.accentCyan} style={{ lineHeight: 1.4, fontSize: '0.8rem' }}>
          {String.raw`     _       _
    / \ / _\ |__  _ __ ___
   / _ \ \ \| '_ \| '_ \\ \\
  / ___ \_\ \ | | | | | | | |
 /_/   \__/_| |_|_| |_| |_|`}
        </pre>
        <div className={styles.flexColumn} style={{ gap: '0.25rem' }}>
          <div>
            <span className={styles.accentGreen}>OS</span> Portfolio OS v3.0.0
          </div>
          <div>
            <span className={styles.accentGreen}>Host</span> Ahmad Ibrahim
          </div>
          <div>
            <span className={styles.accentGreen}>Shell</span> Terminal (React + TypeScript)
          </div>
          <div>
            <span className={styles.accentGreen}>Theme</span> {theme}
          </div>
          <div>
            <span className={styles.accentGreen}>Location</span> Lyon, France
          </div>
          <div>
            <span className={styles.accentGreen}>Stack</span> NestJS · Vue.js · React · PostgreSQL
          </div>
          <div>
            <span className={styles.accentGreen}>Contact</span> aibrahim0@outlook.com
          </div>
        </div>
      </div>
    );
  },
};

const weatherCommand: Command = {
  name: 'weather',
  description: 'Show current weather at your location',
  usage: 'weather',
  category: 'fun',
  execute: async (_args, addOutput) => {
    if (!('geolocation' in navigator)) {
      addOutput(
        <span className={styles.error}>Geolocation is not supported in this browser.</span>,
        'error'
      );
      return;
    }

    addOutput(<span className={styles.textSecondary}>Getting your location…</span>);

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://wttr.in/${coords.latitude},${coords.longitude}?format=j1`
          );
          if (!res.ok) {
            throw new Error('Weather API error');
          }

          const data = (await res.json()) as {
            current_condition: Array<{
              weatherDesc: Array<{ value: string }>;
              temp_C: string;
              FeelsLikeC: string;
              humidity: string;
              windspeedKmph: string;
            }>;
            nearest_area: Array<{
              areaName: Array<{ value: string }>;
              country: Array<{ value: string }>;
            }>;
          };

          const current = data.current_condition[0];
          const area = data.nearest_area[0];
          const city = area.areaName[0].value;
          const country = area.country[0].value;

          addOutput(
            <div className={styles.flexColumn}>
              <div className={styles.headerSection}>
                Weather · {city}, {country}
              </div>
              <div className={styles.infoGrid}>
                <span className={styles.textMuted}>Condition</span>
                <span className={styles.accentCyan}>{current.weatherDesc[0].value}</span>
                <span className={styles.textMuted}>Temperature</span>
                <span>
                  {current.temp_C}°C (feels like {current.FeelsLikeC}°C)
                </span>
                <span className={styles.textMuted}>Humidity</span>
                <span>{current.humidity}%</span>
                <span className={styles.textMuted}>Wind</span>
                <span>{current.windspeedKmph} km/h</span>
              </div>
            </div>
          );
        } catch {
          addOutput(<span className={styles.error}>Could not fetch weather data.</span>, 'error');
        }
      },
      () => {
        addOutput(
          <span className={styles.error}>
            Location access denied. Allow location permission and try again.
          </span>,
          'error'
        );
      }
    );
  },
};

const bannerCommand: Command = {
  name: 'banner',
  description: 'Generate large ASCII text using the terminal font',
  usage: 'banner <text>',
  category: 'fun',
  hidden: true,
  execute: (args, addOutput) => {
    if (!args.length) {
      addOutput(<span className={styles.error}>Usage: banner &lt;text&gt;</span>, 'error');
      return;
    }

    const text = args.join(' ').toUpperCase();
    addOutput(
      <pre
        style={{
          fontFamily: 'var(--font-mono-banner)',
          color: 'var(--color-accent-cyan)',
          fontSize: '1.5rem',
          lineHeight: 1.2,
          letterSpacing: '0.05em',
          textShadow: 'var(--text-glow-cyan)',
        }}
      >
        {text}
      </pre>
    );
  },
};

const findCommand: Command = {
  name: 'find',
  description: 'Search across portfolio content',
  usage: 'find <keyword>',
  category: 'core',
  execute: (args, addOutput) => {
    const query = args.join(' ').trim();
    if (!query) {
      addOutput(<span className={styles.error}>Usage: find &lt;keyword&gt;</span>, 'error');
      return;
    }

    const results = findContent(query);
    if (results.length === 0) {
      addOutput(<span className={styles.warning}>No matches found for "{query}".</span>, 'warning');
      return;
    }

    addOutput(
      <div className={styles.flexColumn}>
        {results.map((result) => (
          <div key={`${result.section}-${result.title}`} className={styles.panel}>
            <div className={styles.flexBaseline}>
              <span className={styles.tag}>{result.section}</span>
              <span className={styles.accentGreen}>{result.title}</span>
            </div>
            <div className={styles.textSecondary}>{result.snippet}</div>
            {result.command && (
              <div className={styles.textMuted}>Suggested command: {result.command}</div>
            )}
          </div>
        ))}
      </div>
    );
  },
};

const grepCommand: Command = {
  name: 'grep',
  description: 'Search within a virtual file or content section',
  usage: 'grep <term> <file|projects|experience|skills|contact>',
  category: 'core',
  execute: (args, addOutput) => {
    if (args.length < 2) {
      addOutput(
        <span className={styles.error}>Usage: grep &lt;term&gt; &lt;target&gt;</span>,
        'error'
      );
      return;
    }

    const [term, target] = args;
    const lines = grepVirtualTarget(term, target);

    if (lines.length === 0) {
      addOutput(<span className={styles.warning}>No matches found.</span>, 'warning');
      return;
    }

    addOutput(
      <div className={styles.textPreWrap}>
        {lines.map((line) => (
          <div key={line}>{line}</div>
        ))}
      </div>
    );
  },
};

const openCommand: Command = {
  name: 'open',
  description: 'Open a known project, social link, or resume',
  usage: 'open <project|github|linkedin|resume>',
  category: 'projects',
  execute: (args, addOutput) => {
    const query = args.join(' ').trim();
    if (!query) {
      addOutput(<span className={styles.error}>Usage: open &lt;target&gt;</span>, 'error');
      return;
    }

    const target = resolveOpenTarget(query);
    if (!target) {
      addOutput(
        <span className={styles.error}>No openable target found for "{query}".</span>,
        'error'
      );
      return;
    }

    window.open(target.url, '_blank', 'noopener,noreferrer');
    addOutput(<span className={styles.success}>Opening {target.label}…</span>, 'success');
  },
};

const statsCommand: Command = {
  name: 'stats',
  description: 'Show local visitor stats and discovery progress',
  usage: 'stats',
  category: 'system',
  execute: (_args, addOutput, context) => {
    const progress = context.visitorProgress;
    addOutput(
      <div className={styles.flexColumn}>
        <div className={styles.headerSection}>Local Stats</div>
        <div className={styles.flexBaseline}>
          <span className={styles.accentGreen}>Visits</span>
          <span className={styles.textSecondary}>{progress.visits}</span>
        </div>
        <div className={styles.flexBaseline}>
          <span className={styles.accentGreen}>Commands Run</span>
          <span className={styles.textSecondary}>{progress.totalCommands}</span>
        </div>
        <div className={styles.flexBaseline}>
          <span className={styles.accentGreen}>Commands Discovered</span>
          <span className={styles.textSecondary}>{progress.discoveredCommands.length}</span>
        </div>
        <div className={styles.flexBaseline}>
          <span className={styles.accentGreen}>Hidden Commands Found</span>
          <span className={styles.textSecondary}>{progress.hiddenCommands.length}</span>
        </div>
        <div className={styles.headerSection}>Achievements</div>
        {progress.achievements.length === 0 ? (
          <span className={styles.textMuted}>None unlocked yet.</span>
        ) : (
          progress.achievements.map((achievementId) => {
            const achievement = ACHIEVEMENTS.find((item) => item.id === achievementId);
            return (
              <div key={achievementId} className={styles.textSecondary}>
                {achievement?.title ?? achievementId}
              </div>
            );
          })
        )}
      </div>
    );
  },
};

const interviewCommand: Command = {
  name: 'interview',
  description: 'Curated technical discussion prompts',
  usage: 'interview',
  category: 'fun',
  hidden: true,
  execute: (_args, addOutput) => {
    addOutput(
      <div className={styles.flexColumn}>
        <div className={styles.headerSection}>Interview Prompts</div>
        {renderBulletList(getInterviewPrompts(), styles.accentPurple)}
      </div>
    );
  },
};

const legacyCommand: Command = {
  name: 'legacy',
  description: 'Migration and modernization mindset',
  usage: 'legacy',
  category: 'fun',
  hidden: true,
  execute: (_args, addOutput) => {
    addOutput(
      <div className={styles.flexColumn}>
        <div className={styles.headerSection}>Legacy Mode</div>
        {renderBulletList(getLegacyStory(), styles.accentYellow)}
      </div>
    );
  },
};

const incidentCommand: Command = {
  name: 'incident',
  description: 'A troubleshooting and production-debugging mindset',
  usage: 'incident',
  category: 'fun',
  hidden: true,
  execute: (_args, addOutput) => {
    addOutput(
      <div className={styles.flexColumn}>
        <div className={styles.headerSection}>Incident Response</div>
        {renderBulletList(
          [
            'Reproduce the issue or narrow the uncertainty quickly.',
            'Reduce blast radius first, then fix root cause.',
            'Add the missing guardrail so the same class of bug is less likely to recur.',
          ],
          styles.accentOrange
        )}
      </div>
    );
  },
};

const openAICommand: Command = {
  name: 'openai',
  description: 'How AI fits into real engineering work',
  usage: 'openai',
  category: 'fun',
  hidden: true,
  execute: (_args, addOutput) => {
    addOutput(
      <div className={styles.flexColumn}>
        <div className={styles.headerSection}>AI In Practice</div>
        {renderBulletList(getOpenAINotes(), styles.accentCyan)}
      </div>
    );
  },
};

const coffeeCommand: Command = {
  name: 'coffee',
  description: 'A small terminal easter egg',
  usage: 'coffee',
  category: 'fun',
  hidden: true,
  execute: (_args, addOutput) => {
    addOutput(
      <div className={styles.textPreWrap}>
        {String.raw`  ( (
   ) )
........
|      |]
\      /
 \`----'

Fuel loaded. Continue shipping.`}
      </div>
    );
  },
};

const sudoCommand: Command = {
  name: 'sudo',
  description: 'Attempt to elevate your session',
  usage: 'sudo [unlock | su]',
  category: 'fun',
  hidden: true,
  execute: (args, addOutput, context) => {
    if (args[0] === 'unlock' || args[0] === 'su') {
      unlockAdmin();
      context.setVisitorProgress(unlockVault());
      context.setBootMode('admin');
      addOutput(
        <div className={styles.flexColumn}>
          <span className={styles.success}>Privileges elevated. Vault access granted.</span>
          <CommandShortcutList
            title="Unlocked commands"
            items={[
              { label: 'Vault', command: 'vault' },
              { label: 'Interview', command: 'interview' },
              { label: 'Legacy', command: 'legacy' },
            ]}
          />
        </div>,
        'success'
      );
      return;
    }

    context.setBootMode('admin');
    addOutput(
      <div className={styles.flexColumn}>
        <span className={styles.success}>Temporary admin shell enabled for this session.</span>
        <span className={styles.textSecondary}>Try sudo unlock if you want the hidden vault.</span>
      </div>,
      'success'
    );
  },
};

const vaultCommand: Command = {
  name: 'vault',
  description: 'Reveal the hidden command vault',
  usage: 'vault',
  category: 'fun',
  hidden: true,
  execute: (_args, addOutput, context) => {
    const progress = context.visitorProgress;
    const eligible =
      progress.unlockedVault || progress.adminUnlocked || progress.discoveredCommands.length >= 6;

    if (!eligible) {
      addOutput(
        <span className={styles.warning}>
          Vault locked. Explore more commands or try elevating your session.
        </span>,
        'warning'
      );
      return;
    }

    context.setVisitorProgress(unlockVault());
    addOutput(
      <CommandShortcutList
        title="Vault commands"
        items={[
          { label: 'Interview', command: 'interview' },
          { label: 'Legacy', command: 'legacy' },
          { label: 'Incident', command: 'incident' },
          { label: 'OpenAI', command: 'openai' },
          { label: 'Coffee', command: 'coffee' },
        ]}
      />
    );
  },
};

const eastereggCommand: Command = {
  name: 'easteregg',
  description: 'Inspect your hidden discoveries',
  usage: 'easteregg',
  category: 'fun',
  hidden: true,
  execute: (_args, addOutput, context) => {
    const progress = context.visitorProgress;
    addOutput(
      <div className={styles.flexColumn}>
        <div className={styles.headerSection}>Discovery Log</div>
        <div className={styles.textSecondary}>
          Hidden commands found: {progress.hiddenCommands.join(', ') || 'none yet'}
        </div>
        <div className={styles.textSecondary}>
          Vault status: {progress.unlockedVault ? 'unlocked' : 'locked'}
        </div>
      </div>
    );
  },
};

export const basicCommands: Command[] = [
  helpCommand,
  clearCommand,
  echoCommand,
  whoamiCommand,
  dateCommand,
  shareCommand,
  historyCommand,
  pwdCommand,
  lsCommand,
  cdCommand,
  catCommand,
  treeCommand,
  aboutCommand,
  skillsCommand,
  experienceCommand,
  educationCommand,
  projectsCommand,
  topProjectsCommand,
  githubCommand,
  contactCommand,
  contactMeCommand,
  highlightsCommand,
  timelineCommand,
  whyMeCommand,
  availabilityCommand,
  tourCommand,
  modeCommand,
  startCommand,
  recommendCommand,
  chooseYourPathCommand,
  diagnoseCommand,
  themeCommand,
  uptimeCommand,
  pingCommand,
  resumeCommand,
  playgroundCommand,
  neofetchCommand,
  effectCommand,
  musicCommand,
  weatherCommand,
  findCommand,
  grepCommand,
  openCommand,
  statsCommand,
  bannerCommand,
  interviewCommand,
  legacyCommand,
  incidentCommand,
  openAICommand,
  coffeeCommand,
  sudoCommand,
  vaultCommand,
  eastereggCommand,
];

export function initializeCommands(): void {
  clearRegistry();
  registerCommands(basicCommands);
}

export {
  helpCommand,
  clearCommand,
  echoCommand,
  whoamiCommand,
  dateCommand,
  aboutCommand,
  skillsCommand,
  experienceCommand,
  educationCommand,
  projectsCommand,
  neofetchCommand,
  githubCommand,
  weatherCommand,
  contactMeCommand,
  bannerCommand,
};
