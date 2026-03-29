import type { FC } from 'react';
import { useCallback, useState } from 'react';

import { BootScreen } from './components/Boot';
import { Terminal } from './components/Terminal/Terminal';
import { TerminalProvider } from './hooks/TerminalProvider';
import { useTerminalContext } from './hooks/TerminalContext';
import type { BootMode } from './types/boot';

/**
 * Inner component that has access to TerminalContext
 */
interface AppContentProps {
  bootComplete: boolean;
  onBootComplete: () => void;
}

const AppContent: FC<AppContentProps> = ({ bootComplete, onBootComplete }) => {
  const { setUserInteracted, setBootMode, setTheme } = useTerminalContext();

  const handleBootComplete = useCallback(
    (mode: BootMode) => {
      // Mark that user has interacted (enables audio)
      setUserInteracted();

      // Apply theme based on boot mode
      if (mode === 'matrix') {
        setTheme('matrix');
      }
      // For other modes, keep the stored theme

      // Notify parent
      onBootComplete();
    },
    [setUserInteracted, setTheme, onBootComplete]
  );

  if (!bootComplete) {
    return <BootScreen onBootComplete={handleBootComplete} onModeDetected={setBootMode} />;
  }

  return <Terminal />;
};

function App() {
  const [bootComplete, setBootComplete] = useState(false);

  const handleBootComplete = useCallback(() => {
    setBootComplete(true);
  }, []);

  return (
    <TerminalProvider>
      <AppContent bootComplete={bootComplete} onBootComplete={handleBootComplete} />
    </TerminalProvider>
  );
}

export default App;
