import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { TerminalContext } from './TerminalContext';
import { useTerminal } from './useTerminal';
import { initializeCommands } from '../data/commands';

interface TerminalProviderProps {
  children: ReactNode;
}

/**
 * Provider component for terminal state
 */
export function TerminalProvider({ children }: TerminalProviderProps) {
  const terminal = useTerminal();

  // Initialize commands on mount
  useEffect(() => {
    initializeCommands();
  }, []);

  return <TerminalContext.Provider value={terminal}>{children}</TerminalContext.Provider>;
}
