import { findMatchingCommands, getCommand } from './commandRegistry';
import { getNode, resolvePath } from './fileSystem';

/**
 * Result of a completion attempt
 */
export interface CompletionResult {
  /** The list of possible completions */
  matches: string[];
  /** The type of completion (command or path) */
  type: 'command' | 'path';
  /** The original text that was matched against */
  original: string;
}

/**
 * Get completions for command names
 */
function getCommandCompletions(partial: string): string[] {
  return findMatchingCommands(partial);
}

/**
 * Get completions for file paths
 * @param partialPath The partial path string (e.g., "src/comp")
 * @param currentDirectory The current working directory
 */
function getPathCompletions(partialPath: string, currentDirectory: string): string[] {
  // Handle empty path - list current directory
  if (!partialPath) {
    // Normalize currentDirectory (resolve ~ to absolute path)
    const resolvedDir = resolvePath(currentDirectory, '.');
    const node = getNode(resolvedDir);
    if (!node || node.type !== 'directory' || !node.children) return [];
    return Array.from(node.children.keys()).map(
      (name) => name + (node.children?.get(name)?.type === 'directory' ? '/' : '')
    );
  }

  // Determine the directory to look in and the partial filename to match
  let dirPath = currentDirectory;
  let filePrefix = partialPath;

  const lastSlashIndex = partialPath.lastIndexOf('/');

  if (lastSlashIndex !== -1) {
    // Has directory separator
    const dirPart = partialPath.substring(0, lastSlashIndex);
    filePrefix = partialPath.substring(lastSlashIndex + 1);

    // Resolve the absolute path to the directory
    dirPath = resolvePath(currentDirectory, dirPart);
  }

  const node = getNode(dirPath);
  if (!node || node.type !== 'directory' || !node.children) {
    return [];
  }

  // Filter children that match the prefix
  const matches: string[] = [];
  for (const [name, child] of node.children.entries()) {
    if (name.startsWith(filePrefix)) {
      // Return the full relative path segment for the completion
      const suffix = name.slice(filePrefix.length);
      const isDir = child.type === 'directory';
      matches.push(partialPath + suffix + (isDir ? '/' : ''));
    }
  }

  return matches.sort();
}

/**
 * Main completion function
 * @param input The full input string
 * @param currentDirectory The current working directory
 */
export function getCompletions(input: string, currentDirectory: string): CompletionResult | null {
  const trimmed = input.trimEnd(); // Don't trim start to preserve leading spaces if any?
  // Actually standard terminal trimming:
  const parts = trimmed.split(' ');

  if (parts.length === 0 || (parts.length === 1 && !input.endsWith(' '))) {
    // Completing the command name
    const cmdPartial = parts[0] || '';
    const matches = getCommandCompletions(cmdPartial);
    return { matches, type: 'command', original: cmdPartial };
  }

  // Completing an argument
  const commandName = parts[0];
  const command = getCommand(commandName);

  // Get the last part as the one to complete
  // Note: This is simplified. Real shells handle quotes, escapes, etc.
  const lastArg = input.endsWith(' ') ? '' : parts[parts.length - 1];

  // If command has custom autocomplete logic (e.g. for subcommands like 'theme')
  if (command?.autocomplete) {
    const matches = command.autocomplete(lastArg);
    return { matches, type: 'command', original: lastArg };
  }

  // Default to path completion for arguments
  const matches = getPathCompletions(lastArg, currentDirectory);
  return { matches, type: 'path', original: lastArg };
}
