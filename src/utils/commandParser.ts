import type { ParsedCommand } from '../types';

/**
 * Parse a raw command string into a ParsedCommand object
 * Handles quoted strings and multiple arguments
 *
 * @param input - The raw input string from the user
 * @returns ParsedCommand object with name, args, and raw input
 *
 * @example
 * parseCommand('help') // { name: 'help', args: [], raw: 'help' }
 * parseCommand('echo "hello world"') // { name: 'echo', args: ['hello world'], raw: 'echo "hello world"' }
 * parseCommand('ls -la /home') // { name: 'ls', args: ['-la', '/home'], raw: 'ls -la /home' }
 */
export function parseCommand(input: string): ParsedCommand {
  const raw = input;
  const trimmed = input.trim();

  if (!trimmed) {
    return { name: '', args: [], raw };
  }

  const tokens = tokenize(trimmed);
  const name = tokens[0]?.toLowerCase() ?? '';
  const args = tokens.slice(1);

  return { name, args, raw };
}

/**
 * Tokenize a command string, respecting quoted strings
 *
 * @param input - The input string to tokenize
 * @returns Array of tokens
 */
function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inQuote = false;
  let quoteChar = '';

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    // Handle escape sequences
    if (char === '\\' && i + 1 < input.length) {
      current += input[i + 1];
      i++; // Skip next character
      continue;
    }

    // Handle quotes
    if ((char === '"' || char === "'") && !inQuote) {
      inQuote = true;
      quoteChar = char;
      continue;
    }

    if (char === quoteChar && inQuote) {
      inQuote = false;
      quoteChar = '';
      continue;
    }

    // Handle spaces (token separator when not in quotes)
    if (char === ' ' && !inQuote) {
      if (current) {
        tokens.push(current);
        current = '';
      }
      continue;
    }

    current += char;
  }

  // Don't forget the last token
  if (current) {
    tokens.push(current);
  }

  return tokens;
}

/**
 * Validate if a command name is valid
 *
 * @param name - The command name to validate
 * @returns true if valid, false otherwise
 */
export function isValidCommandName(name: string): boolean {
  // Command names should be alphanumeric with optional hyphens/underscores
  return /^[a-z][a-z0-9_-]*$/i.test(name);
}

