import React from 'react';
import type { Command, OutputFunction } from '../types';
import { getAllCommands, registerCommands } from '../utils/commandRegistry';

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
    // This is a special case handled in TerminalInput
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
  execute: (_args: string[], addOutput: OutputFunction) => {
    // This is a special command that needs access to terminal state
    // We'll handle it specially in the useTerminal hook
    addOutput(
      <span style={{ color: 'var(--color-text-muted)' }}>
        Use ↑/↓ arrow keys to navigate command history
      </span>
    );
  },
};

/**
 * PWD command - shows current directory
 */
const pwdCommand: Command = {
  name: 'pwd',
  description: 'Print working directory',
  usage: 'pwd',
  execute: (_args: string[], addOutput: OutputFunction) => {
    // This needs to be updated to use actual current directory
    addOutput(<span>/home/visitor</span>);
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
];

/**
 * Initialize all commands in the registry
 */
export function initializeCommands(): void {
  registerCommands(basicCommands);
}

// Export individual commands for testing
export { helpCommand, clearCommand, echoCommand, whoamiCommand, dateCommand };
