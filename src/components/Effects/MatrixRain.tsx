import React from 'react';

import { useTerminalContext } from '../../hooks/TerminalContext';
import { useMatrixAnimation } from '../../hooks/useMatrixAnimation';

export const MatrixRain: React.FC = () => {
  const { matrixEnabled, theme } = useTerminalContext();
  const { canvasRef } = useMatrixAnimation(matrixEnabled, theme);

  if (!matrixEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1, // Behind everything
        opacity: 0.8, // Slight transparency
        pointerEvents: 'none', // Don't block clicks
      }}
    />
  );
};
