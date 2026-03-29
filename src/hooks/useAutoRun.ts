import { useEffect } from 'react';

import { parseCommand } from '../utils/commandParser';
import { getCommand } from '../utils/commandRegistry';

const AUTO_RUN_PARAM = 'run';
const LEGACY_AUTO_RUN_PARAM = 'command';
const INTERNAL_COMMANDS = new Set(['history', 'pwd', 'ls', 'cd', 'cat', 'tree']);

/**
 * Execute a command once from URL query params.
 * Example: ?run=tour
 */
export function useAutoRun(executeCommand: (input: string) => void): void {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const url = new URL(window.location.href);
    const rawCommand =
      url.searchParams.get(AUTO_RUN_PARAM) ?? url.searchParams.get(LEGACY_AUTO_RUN_PARAM) ?? '';
    const command = rawCommand.trim();

    if (!command) {
      return;
    }

    const runKey = `auto-run:${url.pathname}:${url.search}`;
    try {
      if (sessionStorage.getItem(runKey) === 'done') {
        return;
      }
      sessionStorage.setItem(runKey, 'done');
    } catch {
      // Ignore storage failures and continue best-effort.
    }

    const parsed = parseCommand(command);
    const isKnownCommand = Boolean(getCommand(parsed.name)) || INTERNAL_COMMANDS.has(parsed.name);

    if (!parsed.name || !isKnownCommand) {
      return;
    }

    requestAnimationFrame(() => {
      executeCommand(command);
    });

    url.searchParams.delete(AUTO_RUN_PARAM);
    url.searchParams.delete(LEGACY_AUTO_RUN_PARAM);
    const nextSearch = url.searchParams.toString();
    const nextUrl = `${url.pathname}${nextSearch ? `?${nextSearch}` : ''}${url.hash}`;
    window.history.replaceState({}, '', nextUrl);
  }, [executeCommand]);
}
