import { useCallback, useEffect, useRef } from 'react';
import type { RefObject } from 'react';

import { UI_CONSTANTS } from '../config/constants';

interface UseEnsureFocusedElementVisibleOptions<T extends HTMLElement> {
  elementRef: RefObject<T | null>;
  enabled?: boolean;
  isKeyboardOpen?: boolean;
  isViewportSettled?: boolean;
}

export const useEnsureFocusedElementVisible = <T extends HTMLElement>({
  elementRef,
  enabled = true,
  isKeyboardOpen = false,
  isViewportSettled = true,
}: UseEnsureFocusedElementVisibleOptions<T>) => {
  const timeoutRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const cancelScheduledEnsureVisible = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const ensureVisible = useCallback(
    (behavior: ScrollBehavior = 'smooth') => {
      if (!enabled) {
        return;
      }

      const element = elementRef.current;
      if (!element) {
        return;
      }

      element.scrollIntoView({
        behavior,
        block: 'center',
        inline: 'nearest',
      });
    },
    [elementRef, enabled]
  );

  const scheduleEnsureVisible = useCallback(
    (delayMs: number = UI_CONSTANTS.MOBILE_KEYBOARD.FOCUS_SCROLL_DELAY_MS) => {
      if (!enabled) {
        return;
      }

      cancelScheduledEnsureVisible();

      timeoutRef.current = window.setTimeout(() => {
        animationFrameRef.current = window.requestAnimationFrame(() => {
          ensureVisible('smooth');
        });
      }, delayMs);
    },
    [cancelScheduledEnsureVisible, enabled, ensureVisible]
  );

  useEffect(() => {
    return () => {
      cancelScheduledEnsureVisible();
    };
  }, [cancelScheduledEnsureVisible]);

  useEffect(() => {
    if (!enabled || !isKeyboardOpen || !isViewportSettled) {
      return;
    }

    if (document.activeElement !== elementRef.current) {
      return;
    }

    ensureVisible('smooth');
  }, [elementRef, enabled, ensureVisible, isKeyboardOpen, isViewportSettled]);

  return {
    ensureVisible,
    scheduleEnsureVisible,
    cancelScheduledEnsureVisible,
  };
};
