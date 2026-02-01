import React from 'react';
import type { Command, OutputFunction } from '../types';
import { getAllCommands, registerCommands } from '../utils/commandRegistry';
import { content } from './content';
import { AVAILABLE_THEMES, isValidTheme, getDefaultTheme } from '../utils/themeService';

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
          <div style={{ marginTop: '0.5rem' }}>
            <div style={{ color: 'var(--color-accent-cyan)', fontWeight: 'bold' }}>
              {command.name}
            </div>
            <div style={{ marginLeft: '1rem', marginTop: '0.25rem' }}>
              <div style={{ color: 'var(--color-text-secondary)' }}>{command.description}</div>
              <div style={{ marginTop: '0.25rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Usage: </span>
                <span style={{ color: 'var(--color-accent-green)' }}>{command.usage}</span>
              </div>
              {command.aliases && command.aliases.length > 0 && (
                <div style={{ marginTop: '0.25rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Aliases: </span>
                  <span style={{ color: 'var(--color-accent-purple)' }}>
                    {command.aliases.join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      } else {
        addOutput(
          <span style={{ color: 'var(--color-error)' }}>Unknown command: {commandName}</span>,
          'error'
        );
      }
      return;
    }

    // Show all commands
    const commands = getAllCommands();

    addOutput(
      <div>
        <div
          style={{
            color: 'var(--color-accent-cyan)',
            marginBottom: '0.75rem',
            fontWeight: 'bold',
          }}
        >
          Available Commands:
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: '0.25rem 1.5rem',
            marginLeft: '0.5rem',
          }}
        >
          {commands
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((cmd) => (
              <React.Fragment key={cmd.name}>
                <span style={{ color: 'var(--color-accent-green)' }}>{cmd.name}</span>
                <span style={{ color: 'var(--color-text-secondary)' }}>{cmd.description}</span>
              </React.Fragment>
            ))}
        </div>
        <div
          style={{
            marginTop: '0.75rem',
            color: 'var(--color-text-muted)',
            fontSize: '0.875rem',
          }}
        >
          Type '<span style={{ color: 'var(--color-accent-green)' }}>help [command]</span>' for more
          info on a specific command.
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
        <div style={{ color: 'var(--color-accent-cyan)', fontWeight: 'bold', fontSize: '1.1em' }}>
          {content.bio.name}
        </div>
        <div style={{ color: 'var(--color-accent-purple)', marginBottom: '0.5rem' }}>
          {content.bio.tagline}
        </div>
        <div style={{ color: 'var(--color-text-primary)', lineHeight: '1.5' }}>
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
    const renderSection = (title: string, items: string[], color: string) => (
      <div style={{ marginBottom: '0.5rem' }}>
        <span style={{ color: 'var(--color-text-muted)', display: 'inline-block', width: '120px' }}>
          {title}:
        </span>
        <span style={{ color }}>{items.join(', ')}</span>
      </div>
    );

    addOutput(
      <div>
        {renderSection('Languages', content.skills.languages, 'var(--color-accent-orange)')}
        {renderSection('Frameworks', content.skills.frameworks, 'var(--color-accent-green)')}
        {renderSection('Infra & Tools', content.skills.tools, 'var(--color-accent-cyan)')}
        {renderSection('Soft Skills', content.skills.softSkills, 'var(--color-accent-purple)')}
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {content.experience.map((job, index) => (
          <div key={index}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <span
                style={{
                  color: 'var(--color-accent-yellow)',
                  fontWeight: 'bold',
                  fontSize: '1.05em',
                }}
              >
                {job.role}
              </span>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9em' }}>
                {job.date}
              </span>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--color-accent-cyan)' }}>@ {job.company}</span>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9em' }}>
                {' '}
                | {job.location}
              </span>
            </div>
            <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: 0 }}>
              {job.description.map((desc, i) => (
                <li
                  key={i}
                  style={{ color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}
                >
                  {desc}
                </li>
              ))}
            </ul>
            {job.technologies && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.9em' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Tech: </span>
                <span style={{ color: 'var(--color-accent-purple)' }}>
                  {job.technologies.join(', ')}
                </span>
              </div>
            )}
          </div>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {content.education.map((edu, index) => (
          <div key={index}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--color-accent-green)', fontWeight: 'bold' }}>
                {edu.school}
              </span>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9em' }}>
                {edu.date}
              </span>
            </div>
            <div style={{ color: 'var(--color-text-primary)' }}>{edu.degree}</div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9em' }}>
              {edu.location}
            </div>
          </div>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {content.projects.map((project, index) => (
          <div key={index}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ color: 'var(--color-accent-cyan)', fontWeight: 'bold' }}>
                {project.name}
              </span>
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--color-text-link)', textDecoration: 'underline' }}
                >
                  Live Demo
                </a>
              )}
              {project.repo && (
                <a
                  href={project.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--color-text-link)', textDecoration: 'underline' }}
                >
                  Source Code
                </a>
              )}
            </div>
            <div style={{ color: 'var(--color-text-secondary)', margin: '0.25rem 0' }}>
              {project.description}
            </div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9em' }}>
              [{project.technologies.join(', ')}]
            </div>
          </div>
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
      <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '0.5rem' }}>
        {content.socials.map((link) => (
          <React.Fragment key={link.platform}>
            <span style={{ color: 'var(--color-accent-purple)' }}>{link.platform}:</span>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-text-link)' }}
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
  execute: (_args: string[], addOutput: OutputFunction) => {
    addOutput(<span style={{ color: 'var(--color-accent-green)' }}>visitor</span>);
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
          <div style={{ paddingLeft: '1rem' }}>
            {AVAILABLE_THEMES.map((t) => (
              <span key={t} style={{ marginRight: '1rem', color: 'var(--color-text-secondary)' }}>
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
          <ul style={{ listStyle: 'none', paddingLeft: '1rem', marginTop: '0.5rem' }}>
            {AVAILABLE_THEMES.map((t) => (
              <li key={t} style={{ marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--color-accent-green)' }}>•</span> {t}
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
        <span style={{ color: 'var(--color-success)' }}>
          Theme reset to default ({defaultTheme})
        </span>,
        'success'
      );
      return;
    }

    // Set theme
    if (isValidTheme(subCommand)) {
      window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme: subCommand } }));
      addOutput(
        <span style={{ color: 'var(--color-success)' }}>Theme switched to: {subCommand}</span>,
        'success'
      );
    } else {
      addOutput(
        <span style={{ color: 'var(--color-error)' }}>
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
        <span style={{ color: 'var(--color-success)' }}>Initiating download...</span>
        <br />
        <span style={{ color: 'var(--color-text-secondary)' }}>
          If download doesn't start automatically,{' '}
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--color-text-link)', textDecoration: 'underline' }}
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
