import type { Command, CommandRegistry } from '../types';

/**
 * The global command registry
 */
const registry: CommandRegistry = new Map();

/**
 * Alias mapping (alias -> actual command name)
 */
const aliasMap: Map<string, string> = new Map();

/**
 * Register a command in the registry
 *
 * @param command - The command to register
 */
export function registerCommand(command: Command): void {
  registry.set(command.name.toLowerCase(), command);

  // Register aliases
  if (command.aliases) {
    for (const alias of command.aliases) {
      aliasMap.set(alias.toLowerCase(), command.name.toLowerCase());
    }
  }
}

/**
 * Register multiple commands at once
 *
 * @param commands - Array of commands to register
 */
export function registerCommands(commands: Command[]): void {
  for (const command of commands) {
    registerCommand(command);
  }
}

/**
 * Get a command by name or alias
 *
 * @param name - The command name or alias
 * @returns The command if found, undefined otherwise
 */
export function getCommand(name: string): Command | undefined {
  const lowerName = name.toLowerCase();

  // First check if it's a direct command name
  const command = registry.get(lowerName);
  if (command) {
    return command;
  }

  // Check if it's an alias
  const actualName = aliasMap.get(lowerName);
  if (actualName) {
    return registry.get(actualName);
  }

  return undefined;
}

/**
 * Check if a command exists
 *
 * @param name - The command name or alias
 * @returns true if command exists, false otherwise
 */
export function hasCommand(name: string): boolean {
  return getCommand(name) !== undefined;
}

/**
 * Get all registered commands
 *
 * @returns Array of all registered commands
 */
export function getAllCommands(): Command[] {
  return Array.from(registry.values());
}

/**
 * Get all command names (excluding aliases)
 *
 * @returns Array of command names
 */
export function getCommandNames(): string[] {
  return Array.from(registry.keys());
}

/**
 * Find commands that match a partial name (for autocomplete)
 *
 * @param partial - The partial command name
 * @returns Array of matching command names
 */
export function findMatchingCommands(partial: string): string[] {
  const lowerPartial = partial.toLowerCase();
  const matches: string[] = [];

  // Check command names
  for (const name of registry.keys()) {
    if (name.startsWith(lowerPartial)) {
      matches.push(name);
    }
  }

  // Check aliases
  for (const alias of aliasMap.keys()) {
    if (alias.startsWith(lowerPartial)) {
      matches.push(alias);
    }
  }

  return matches.sort();
}

/**
 * Clear all registered commands (useful for testing)
 */
export function clearRegistry(): void {
  registry.clear();
  aliasMap.clear();
}
