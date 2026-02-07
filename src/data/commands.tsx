import React from 'react';
import type { Command, OutputFunction } from '../types';
import { getAllCommands, registerCommands } from '../utils/commandRegistry';
import { content } from './content';
import { AVAILABLE_THEMES, isValidTheme, getDefaultTheme } from '../utils/themeService';
import { SYSTEM_CONFIG } from '../config';
import { MATRIX_STORAGE_KEY, MUSIC_STORAGE_KEY } from '../hooks/storageKeys';
import { getStoredBoolean } from '../utils/storageHelpers';
import { SkillSection, JobEntry, EducationEntry, ProjectCard } from '../components/Output';
import styles from '../styles/TerminalOutput.module.css';

/**
 * Help command - displays all available commands
 */
const helpCommand: Command = {
  name: 'help',
  description: 'Display all available commands',
  usage: 'help [command]',
  aliases: ['?', 'commands'],
  execute: (args: string[], addOutput: OutputFunction) => {
    if (args.length > 0) {
      // Show help for specific command
      const commandName = args[0].toLowerCase();
      const commands = getAllCommands();
      const command = commands.find(
        (cmd) => cmd.name === commandName || cmd.aliases?.includes(commandName)
      );

      if (command) {
        addOutput(
          <div className={styles.marginTopMedium}>
            <div className={`${styles.accentCyan} ${styles.bold}`}>{command.name}</div>
            <div className={`${styles.marginLeftLarge} ${styles.marginTopSmall}`}>
              <div className={styles.textSecondary}>{command.description}</div>
              <div className={styles.marginTopSmall}>
                <span className={styles.textMuted}>Usage: </span>
                <span className={styles.accentGreen}>{command.usage}</span>
              </div>
              {command.aliases && command.aliases.length > 0 && (
                <div className={styles.marginTopSmall}>
                  <span className={styles.textMuted}>Aliases: </span>
                  <span className={styles.accentPurple}>{command.aliases.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        );
      } else {
        addOutput(<span className={styles.error}>Unknown command: {commandName}</span>, 'error');
      }
      return;
    }

    // Show all commands
    const commands = getAllCommands();

    addOutput(
      <div>
        <div className={styles.headerSection}>Available Commands:</div>
        <div className={styles.commandGrid}>
          {commands
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((cmd) => (
              <React.Fragment key={cmd.name}>
                <span className={styles.accentGreen}>{cmd.name}</span>
                <span className={styles.textSecondary}>{cmd.description}</span>
              </React.Fragment>
            ))}
        </div>
        <div className={`${styles.textMuted} ${styles.textSmall} ${styles.marginTopLarge}`}>
          Type '<span className={styles.accentGreen}>help [command]</span>' for more info on a
          specific command.
        </div>
      </div>
    );
  },
};

/**
 * Clear command - clears the terminal screen
 */
const clearCommand: Command = {
  name: 'clear',
  description: 'Clear the terminal screen',
  usage: 'clear',
  aliases: ['cls', 'reset'],
  execute: () => {
    // The actual clearing is handled by the terminal component
  },
};

/**
 * Echo command - prints text to the terminal
 */
const echoCommand: Command = {
  name: 'echo',
  description: 'Display a message',
  usage: 'echo [message]',
  execute: (args: string[], addOutput: OutputFunction) => {
    const message = args.join(' ');
    addOutput(<span>{message || ''}</span>);
  },
};

/**
 * About command - displays profile info
 */
const aboutCommand: Command = {
  name: 'about',
  description: 'Display user information',
  usage: 'about',
  aliases: ['bio'],
  execute: (_args: string[], addOutput: OutputFunction) => {
    addOutput(
      <div>
        <div className={`${styles.accentCyan} ${styles.bold} ${styles.fontSize11}`}>
          {content.bio.name}
        </div>
        <div className={`${styles.accentPurple} ${styles.marginBottomMedium}`}>
          {content.bio.tagline}
        </div>
        <div className={`${styles.textPrimary} ${styles.lineHeight}`}>
          {content.bio.description.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      </div>
    );
  },
};

/**
 * Skills command - displays technical skills
 */
const skillsCommand: Command = {
  name: 'skills',
  description: 'Display technical skills',
  usage: 'skills',
  aliases: ['stack', 'tech'],
  execute: (_args: string[], addOutput: OutputFunction) => {
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

/**
 * Experience command - displays job history
 */
const experienceCommand: Command = {
  name: 'experience',
  description: 'Display professional experience',
  usage: 'experience',
  aliases: ['exp', 'work', 'jobs'],
  execute: (_args: string[], addOutput: OutputFunction) => {
    addOutput(
      <div className={styles.flexColumnLarge}>
        {content.experience.map((job, index) => (
          <JobEntry key={index} job={job} />
        ))}
      </div>
    );
  },
};

/**
 * Education command - displays education history
 */
const educationCommand: Command = {
  name: 'education',
  description: 'Display educational background',
  usage: 'education',
  aliases: ['edu'],
  execute: (_args: string[], addOutput: OutputFunction) => {
    addOutput(
      <div className={styles.flexColumn}>
        {content.education.map((edu, index) => (
          <EducationEntry key={index} education={edu} />
        ))}
      </div>
    );
  },
};

/**
 * Projects command - displays projects
 */
const projectsCommand: Command = {
  name: 'projects',
  description: 'Display featured projects',
  usage: 'projects',
  aliases: ['proj', 'portfolio'],
  execute: (_args: string[], addOutput: OutputFunction) => {
    addOutput(
      <div className={styles.flexColumn}>
        {content.projects.map((project, index) => (
          <ProjectCard key={index} project={project} />
        ))}
      </div>
    );
  },
};

/**
 * Contact command - displays social links
 */
const contactCommand: Command = {
  name: 'contact',
  description: 'Display contact information',
  usage: 'contact',
  aliases: ['socials', 'email'],
  execute: (_args: string[], addOutput: OutputFunction) => {
    addOutput(
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
    );
  },
};

/**
 * Whoami command - shows current user
 */
const whoamiCommand: Command = {
  name: 'whoami',
  description: 'Display current user',
  usage: 'whoami',
  execute: (_args: string[], addOutput: OutputFunction, context) => {
    const username = context?.user || SYSTEM_CONFIG.defaultUser;
    addOutput(<span className={styles.accentGreen}>{username}</span>);
  },
};

/**
 * Date command - shows current date and time
 */
const dateCommand: Command = {
  name: 'date',
  description: 'Display current date and time',
  usage: 'date',
  execute: (_args: string[], addOutput: OutputFunction) => {
    const now = new Date();
    const formatted = now.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    });
    addOutput(<span>{formatted}</span>);
  },
};

/**
 * History command - shows command history
 */
const historyCommand: Command = {
  name: 'history',
  description: 'Show command history',
  usage: 'history',
  execute: () => {
    // This command is intercepted by useTerminal hook to access sensitive state
    // This execute function is a fallback/placeholder
  },
};

/**
 * LS command - list directory contents
 */
const lsCommand: Command = {
  name: 'ls',
  description: 'List directory contents',
  usage: 'ls [directory]',
  execute: () => {
    // Intercepted by useTerminal
  },
};

/**
 * CD command - change directory
 */
const cdCommand: Command = {
  name: 'cd',
  description: 'Change the shell working directory',
  usage: 'cd [directory]',
  execute: () => {
    // Intercepted by useTerminal
  },
};

/**
 * PWD command - print working directory
 */
const pwdCommand: Command = {
  name: 'pwd',
  description: 'Print name of current/working directory',
  usage: 'pwd',
  execute: () => {
    // Intercepted by useTerminal
  },
};

/**
 * Cat command - concatenate and display files
 */
const catCommand: Command = {
  name: 'cat',
  description: 'Concatenate files and print on the standard output',
  usage: 'cat [file]',
  execute: () => {
    // Intercepted by useTerminal
  },
};

/**
 * Tree command - list contents of directories in a tree-like format
 */
const treeCommand: Command = {
  name: 'tree',
  description: 'List contents of directories in a tree-like format',
  usage: 'tree [directory]',
  execute: () => {
    // Intercepted by useTerminal
  },
};

/**
 * Theme command - manage terminal themes
 */
const themeCommand: Command = {
  name: 'theme',
  description: 'Manage terminal themes (list, set, reset)',
  usage: 'theme [list | reset | <name>]',
  execute: (args: string[], addOutput: OutputFunction) => {
    // If no args, show current usage
    if (args.length === 0) {
      addOutput(
        <div>
          <div>Usage: theme [list | reset | &lt;name&gt;]</div>
          <br />
          <div>Available themes:</div>
          <div className={styles.paddingLeftMedium}>
            {AVAILABLE_THEMES.map((t) => (
              <span key={t} className={`${styles.textSecondary} ${styles.marginRight1}`}>
                {t}
              </span>
            ))}
          </div>
        </div>
      );
      return;
    }

    const subCommand = args[0].toLowerCase();

    // List themes
    if (subCommand === 'list') {
      addOutput(
        <div>
          <div>Available themes:</div>
          <ul className={`${styles.listNone} ${styles.paddingLeftLarge} ${styles.marginTopMedium}`}>
            {AVAILABLE_THEMES.map((t) => (
              <li key={t} className={styles.marginBottomSmall}>
                <span className={styles.accentGreen}>•</span> {t}
              </li>
            ))}
          </ul>
        </div>
      );
      return;
    }

    // Reset theme
    if (subCommand === 'reset') {
      const defaultTheme = getDefaultTheme();
      // Dispatch event to let useTerminal handle persistence and state update
      // This keeps the theme change flow consistent with the 'set theme' branch
      window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme: defaultTheme } }));
      addOutput(
        <span className={styles.success}>Theme reset to default ({defaultTheme})</span>,
        'success'
      );
      return;
    }

    // Set theme
    if (isValidTheme(subCommand)) {
      window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme: subCommand } }));
      addOutput(<span className={styles.success}>Theme switched to: {subCommand}</span>, 'success');
    } else {
      addOutput(
        <span className={styles.error}>
          Error: Invalid theme '{subCommand}'. Type 'theme list' to see available options.
        </span>,
        'error'
      );
    }
  },
  autocomplete: (partial: string) => {
    const subCommands = ['list', 'reset', ...AVAILABLE_THEMES];
    return subCommands.filter((cmd) => cmd.startsWith(partial.toLowerCase()));
  },
};

/**
 * Resume command - download CV
 */
const resumeCommand: Command = {
  name: 'resume',
  description: 'Download my resume/CV',
  usage: 'resume',
  aliases: ['cv', 'download-cv'],
  execute: (_args: string[], addOutput: OutputFunction) => {
    addOutput(
      <div>
        <span className={styles.success}>Initiating download...</span>
        <br />
        <span className={styles.textSecondary}>
          If download doesn't start automatically,{' '}
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.textLink}
          >
            click here
          </a>
          .
        </span>
      </div>,
      'success'
    );

    // Trigger download
    const link = document.createElement('a');
    link.href = '/resume.pdf';
    link.download = 'Ahmad_Ibrahim_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};

/**
 * Effect command - control visual effects
 */
const effectCommand: Command = {
  name: 'effect',
  description: 'Control visual effects',
  usage: 'effect matrix [on | off | toggle]',
  execute: (args: string[], addOutput: OutputFunction) => {
    if (args.length < 2 || args[0].toLowerCase() !== 'matrix') {
      addOutput(
        <div>
          <div>Usage: effect matrix [on | off | toggle]</div>
          <br />
          <div>Controls the background rain effect.</div>
        </div>
      );
      return;
    }

    const action = args[1].toLowerCase();

    // We use custom events to communicate with React state
    // since commands run outside the component context

    if (action === 'on') {
      window.dispatchEvent(new CustomEvent('matrix-toggle', { detail: { enabled: true } }));
      addOutput(<span className={styles.success}>Matrix effect enabled.</span>, 'success');
    } else if (action === 'off') {
      window.dispatchEvent(new CustomEvent('matrix-toggle', { detail: { enabled: false } }));
      addOutput(<span className={styles.textSecondary}>Matrix effect disabled.</span>, 'info');
    } else if (action === 'toggle') {
      // Toggle based on persisted preference in localStorage
      const current = getStoredBoolean(MATRIX_STORAGE_KEY, true);
      const newState = !current;

      window.dispatchEvent(new CustomEvent('matrix-toggle', { detail: { enabled: newState } }));

      addOutput(
        <span className={newState ? styles.success : styles.textSecondary}>
          Matrix effect {newState ? 'enabled' : 'disabled'}.
        </span>,
        newState ? 'success' : 'info'
      );
    } else {
      addOutput(
        <span className={styles.error}>Invalid action. Use 'on', 'off', or 'toggle'.</span>,
        'error'
      );
    }
  },
  autocomplete: (partial: string) => {
    // Basic autocomplete for 'matrix'
    if ('matrix'.startsWith(partial.toLowerCase())) {
      return ['matrix'];
    }
    return [];
  },
};

/**
 * Music command - control background music
 */
const musicCommand: Command = {
  name: 'music',
  description: 'Control background music',
  usage: 'music [on | off | toggle]',
  aliases: ['audio', 'sound'],
  execute: (args: string[], addOutput: OutputFunction) => {
    if (args.length === 0) {
      addOutput(
        <div>
          <div>Usage: music [on | off | toggle]</div>
          <br />
          <div>Controls the background music playback.</div>
          <div className={`${styles.marginTopMedium} ${styles.textSecondary}`}>
            Note: Music requires user interaction to start due to browser policies.
          </div>
        </div>
      );
      return;
    }

    const action = args[0].toLowerCase();

    if (action === 'on') {
      window.dispatchEvent(new CustomEvent('music-toggle', { detail: { enabled: true } }));
      addOutput(<span className={styles.success}>♪ Background music enabled.</span>, 'success');
    } else if (action === 'off') {
      window.dispatchEvent(new CustomEvent('music-toggle', { detail: { enabled: false } }));
      addOutput(<span className={styles.textSecondary}>♪ Background music disabled.</span>, 'info');
    } else if (action === 'toggle') {
      // Toggle based on persisted preference in localStorage
      const current = getStoredBoolean(MUSIC_STORAGE_KEY, true);
      const newState = !current;

      window.dispatchEvent(new CustomEvent('music-toggle', { detail: { enabled: newState } }));

      addOutput(
        <span className={newState ? styles.success : styles.textSecondary}>
          ♪ Background music {newState ? 'enabled' : 'disabled'}.
        </span>,
        newState ? 'success' : 'info'
      );
    } else {
      addOutput(
        <span className={styles.error}>Invalid action. Use 'on', 'off', or 'toggle'.</span>,
        'error'
      );
    }
  },
  autocomplete: (partial: string) => {
    const subCommands = ['on', 'off', 'toggle'];
    return subCommands.filter((cmd) => cmd.startsWith(partial.toLowerCase()));
  },
};

/**
 * All basic commands
 */
export const basicCommands: Command[] = [
  helpCommand,
  clearCommand,
  echoCommand,
  whoamiCommand,
  dateCommand,
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
  contactCommand,
  themeCommand,
  resumeCommand,
  effectCommand,
  musicCommand,
];

/**
 * Initialize all commands in the registry
 */
export function initializeCommands(): void {
  registerCommands(basicCommands);
}

// Export individual commands for testing
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
  contactCommand,
};
