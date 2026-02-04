import { useCallback, useState } from 'react';

import { BootScreen } from './components/Boot';
import { Terminal } from './components/Terminal/Terminal';
import { TerminalProvider } from './hooks/TerminalProvider';
import { useTerminalContext } from './hooks/TerminalContext';

import './App.css';

/**
 * Inner component that has access to TerminalContext
 */
interface AppContentProps {
  bootComplete: boolean;
  onBootComplete: () => void;
}

const AppContent: React.FC<AppContentProps> = ({ bootComplete, onBootComplete }) => {
  const { setUserInteracted, setBootMode } = useTerminalContext();

  const handleBootComplete = useCallback(() => {
    // Mark that user has interacted (enables audio)
    setUserInteracted();
    // Notify parent
    onBootComplete();
  }, [setUserInteracted, onBootComplete]);

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
