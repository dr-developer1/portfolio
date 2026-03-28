import { useEffect, useMemo, useRef, useState } from 'react';

import { UI_CONSTANTS } from '../config/constants';

export interface KeyboardViewportState {
  keyboardInsetPx: number;
  isKeyboardOpen: boolean;
  isViewportSettled: boolean;
}

export const computeKeyboardInset = (baselineHeight: number, visibleHeight: number): number => {
  if (!Number.isFinite(baselineHeight) || !Number.isFinite(visibleHeight)) {
    return 0;
  }

  return Math.max(0, Math.round(baselineHeight - visibleHeight));
};

interface UseKeyboardViewportOptions {
  enabled?: boolean;
}

const getVisibleViewportHeight = (): number => {
  if (typeof window === 'undefined') {
    return 0;
  }

  const viewport = window.visualViewport;
  if (!viewport) {
    return window.innerHeight;
  }

  return viewport.height + viewport.offsetTop;
};

export const useKeyboardViewport = (
  options: UseKeyboardViewportOptions = {}
): KeyboardViewportState => {
  const { enabled = true } = options;

  const baselineHeightRef = useRef(0);
  const settleTimerRef = useRef<number | null>(null);

  const [keyboardInsetPx, setKeyboardInsetPx] = useState(0);
  const [isViewportSettled, setIsViewportSettled] = useState(true);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return;
    }

    const clearSettleTimer = () => {
      if (settleTimerRef.current !== null) {
        window.clearTimeout(settleTimerRef.current);
        settleTimerRef.current = null;
      }
    };

    const queueSettledState = () => {
      clearSettleTimer();
      setIsViewportSettled(false);

      settleTimerRef.current = window.setTimeout(() => {
        setIsViewportSettled(true);
      }, UI_CONSTANTS.MOBILE_KEYBOARD.VIEWPORT_SETTLE_DELAY_MS);
    };

    const syncState = () => {
      const visibleHeight = getVisibleViewportHeight();

      if (visibleHeight <= 0) {
        return;
      }

      if (baselineHeightRef.current === 0) {
        baselineHeightRef.current = visibleHeight;
      }

      // Orientation changes and browser UI chrome changes can increase the available height.
      if (visibleHeight > baselineHeightRef.current) {
        baselineHeightRef.current = visibleHeight;
      }

      const nextInset = computeKeyboardInset(baselineHeightRef.current, visibleHeight);
      setKeyboardInsetPx(nextInset);

      // When keyboard is effectively closed, refresh the baseline for future calculations.
      if (nextInset <= UI_CONSTANTS.MOBILE_KEYBOARD.OPEN_THRESHOLD_PX) {
        baselineHeightRef.current = visibleHeight;
      }

      queueSettledState();
    };

    const handleOrientationChange = () => {
      clearSettleTimer();
      setIsViewportSettled(false);

      window.setTimeout(() => {
        baselineHeightRef.current = getVisibleViewportHeight();
        syncState();
      }, UI_CONSTANTS.MOBILE_KEYBOARD.VIEWPORT_SETTLE_DELAY_MS);
    };

    baselineHeightRef.current = getVisibleViewportHeight();
    syncState();

    const viewport = window.visualViewport;
    viewport?.addEventListener('resize', syncState);
    viewport?.addEventListener('scroll', syncState);
    window.addEventListener('resize', syncState);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      clearSettleTimer();
      viewport?.removeEventListener('resize', syncState);
      viewport?.removeEventListener('scroll', syncState);
      window.removeEventListener('resize', syncState);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [enabled]);

  const isKeyboardOpen = useMemo(
    () =>
      enabled && keyboardInsetPx > UI_CONSTANTS.MOBILE_KEYBOARD.OPEN_THRESHOLD_PX,
    [enabled, keyboardInsetPx]
  );

  const safeKeyboardInset = enabled ? keyboardInsetPx : 0;
  const safeViewportSettled = enabled ? isViewportSettled : true;

  return {
    keyboardInsetPx: safeKeyboardInset,
    isKeyboardOpen,
    isViewportSettled: safeViewportSettled,
  };
};
