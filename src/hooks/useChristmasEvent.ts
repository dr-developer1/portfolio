import { useEffect, useState } from 'react';
import { isChristmasEventActive } from '../utils/christmasEvent';

export function useChristmasEvent(): boolean {
  const [active, setActive] = useState(isChristmasEventActive);

  useEffect(() => {
    const refresh = () => setActive(isChristmasEventActive());
    // Recheck open tabs across midnight and when returning from suspension.
    const interval = window.setInterval(refresh, 30_000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);

  return active;
}
