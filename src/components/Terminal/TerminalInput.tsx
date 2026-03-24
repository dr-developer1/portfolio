import React from 'react';

import { BP } from '../../config/breakpoints';
import { useMediaQuery } from '../../hooks/useMediaQuery';

import { TerminalInputDesktop } from './TerminalInputDesktop';
import { TerminalInputMobile } from './TerminalInputMobile';

export const TerminalInput: React.FC = () => {
  const isMobile = useMediaQuery(
    `(max-width: ${BP.mobile}px), (hover: none) and (pointer: coarse)`
  );

  return isMobile ? <TerminalInputMobile /> : <TerminalInputDesktop />;
};
