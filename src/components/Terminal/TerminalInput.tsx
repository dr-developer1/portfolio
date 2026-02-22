import React, { useState, useEffect } from 'react';
import { TerminalInputDesktop } from './TerminalInputDesktop';
import { TerminalInputMobile } from './TerminalInputMobile';

export const TerminalInput: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Matches standard tablet/mobile breakpoint
      setIsMobile(window.matchMedia('(max-width: 768px)').matches || window.matchMedia('(hover: none)').matches);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile ? <TerminalInputMobile /> : <TerminalInputDesktop />;
};

