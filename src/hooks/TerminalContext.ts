import { createContext, useContext } from 'react';
import type { UseTerminalReturn } from '../types';

// Create context with undefined default
export const TerminalContext = createContext<UseTerminalReturn | undefined>(undefined);

/**
 * Hook to access terminal context
 */
export function useTerminalContext(): UseTerminalReturn {
  const context = useContext(TerminalContext);

  if (context === undefined) {
    throw new Error('useTerminalContext must be used within a TerminalProvider');
  }

  return context;
}
