import React from 'react';

import { BP } from '../../config/breakpoints';
import { useMediaQuery } from '../../hooks/useMediaQuery';

import { TerminalInputDesktop } from './TerminalInputDesktop';
import { TerminalInputMobile } from './TerminalInputMobile';

interface TerminalInputProps {
  keyboardInsetPx?: number;
  isKeyboardOpen?: boolean;
  isViewportSettled?: boolean;
}

export const TerminalInput: React.FC<TerminalInputProps> = ({
  keyboardInsetPx = 0,
  isKeyboardOpen = false,
  isViewportSettled = true,
}) => {
  const isMobile = useMediaQuery(
    `(max-width: ${BP.mobile}px), (hover: none) and (pointer: coarse)`
  );

  return isMobile ? (
    <TerminalInputMobile
      keyboardInsetPx={keyboardInsetPx}
      isKeyboardOpen={isKeyboardOpen}
      isViewportSettled={isViewportSettled}
    />
  ) : (
    <TerminalInputDesktop />
  );
};
