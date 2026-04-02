import { useEffect, useRef, useState } from 'react';

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

export const computeKeyboardOpenThreshold = (baselineHeight: number): number => {
  if (!Number.isFinite(baselineHeight) || baselineHeight <= 0) {
    return UI_CONSTANTS.MOBILE_KEYBOARD.OPEN_THRESHOLD_PX;
  }

  return Math.max(
    UI_CONSTANTS.MOBILE_KEYBOARD.OPEN_THRESHOLD_PX,
    Math.round(baselineHeight * UI_CONSTANTS.MOBILE_KEYBOARD.OPEN_THRESHOLD_RATIO)
  );
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
  const lastReportedInsetRef = useRef(0);
  const keyboardOpenRef = useRef(false);

  const [keyboardInsetPx, setKeyboardInsetPx] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
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
      const openThreshold = computeKeyboardOpenThreshold(baselineHeightRef.current);
      const nextKeyboardOpen = nextInset > openThreshold;
      const nextReportedInset = nextKeyboardOpen ? nextInset : 0;

      let shouldQueueSettledState = false;

      if (nextKeyboardOpen !== keyboardOpenRef.current) {
        keyboardOpenRef.current = nextKeyboardOpen;
        setIsKeyboardOpen(nextKeyboardOpen);
        shouldQueueSettledState = true;
      }

      if (nextReportedInset !== lastReportedInsetRef.current) {
        if (nextKeyboardOpen) {
          shouldQueueSettledState = true;
        }

        lastReportedInsetRef.current = nextReportedInset;
        setKeyboardInsetPx(nextReportedInset);
      }

      if (shouldQueueSettledState) {
        queueSettledState();
      }

      // When keyboard is effectively closed, refresh the baseline for future calculations.
      if (!nextKeyboardOpen) {
        baselineHeightRef.current = visibleHeight;
      }
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
    keyboardOpenRef.current = false;
    lastReportedInsetRef.current = 0;
    syncState();

    const viewport = window.visualViewport;
    viewport?.addEventListener('resize', syncState);
    window.addEventListener('resize', syncState);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      clearSettleTimer();
      viewport?.removeEventListener('resize', syncState);
      window.removeEventListener('resize', syncState);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [enabled]);

  const safeKeyboardInset = enabled && isKeyboardOpen ? keyboardInsetPx : 0;
  const safeViewportSettled = enabled ? isViewportSettled : true;

  return {
    keyboardInsetPx: safeKeyboardInset,
    isKeyboardOpen: enabled ? isKeyboardOpen : false,
    isViewportSettled: safeViewportSettled,
  };
};
