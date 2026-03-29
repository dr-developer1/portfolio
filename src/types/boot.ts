/**
 * Boot Sequence Type Definitions
 *
 * Types for the interactive boot sequence that plays before the terminal loads.
 * Supports multiple boot modes for easter eggs and special experiences.
 */

/**
 * Available boot modes, triggered by different user inputs
 */
export type BootMode = 'normal' | 'admin' | 'dev' | 'matrix';

/**
 * Boot sequence phase - tracks where we are in the boot process
 */
export type BootPhase = 'waiting' | 'booting' | 'complete';

/**
 * Individual boot message configuration
 */
export interface BootMessage {
  /** The text content of the message */
  text: string;
  /** Optional delay in ms before showing next message (default: 150) */
  delay?: number;
  /** Optional status indicator shown after the message */
  status?: 'ok' | 'fail' | 'warn' | 'none';
}

/**
 * Complete boot sequence state
 */
export interface BootState {
  /** Current phase of the boot process */
  phase: BootPhase;
  /** Boot mode determines which messages are shown */
  mode: BootMode;
  /** Index of the current message being displayed */
  currentMessageIndex: number;
  /** Whether the user has interacted (click/keypress) - enables audio */
  userInteracted: boolean;
}

/**
 * Return type for the useBootSequence hook
 */
export interface UseBootSequenceReturn {
  /** Current boot state */
  state: BootState;
  /** Start the boot sequence with optional mode override */
  startBoot: (mode?: BootMode) => void;
  /** Skip directly to terminal (accessibility) */
  skipBoot: () => void;
  /** Current messages based on boot mode */
  messages: BootMessage[];
}

/**
 * Return type for the useSecretCode hook
 */
export interface UseSecretCodeReturn {
  /** Detected boot mode from secret code, or null if none detected */
  detectedMode: BootMode | null;
  /** Currently typed text (for display in boot screen) */
  typedText: string;
  /** Reset the detection buffer */
  reset: () => void;
  /** Feed a complete input value from an input element (for mobile virtual keyboard support) */
  feedInput: (value: string) => void;
}

/**
 * Props for the BootScreen component
 */
export interface BootScreenProps {
  /** Callback when boot sequence completes, receives the boot mode that was used */
  onBootComplete: (mode: BootMode) => void;
  /** Callback when boot mode is determined (before boot messages start) */
  onModeDetected?: (mode: BootMode) => void;
}

/**
 * Props for the StartPrompt component
 */
export interface StartPromptProps {
  /** Hint text shown below the main prompt */
  hint?: string;
  /** Currently typed text to display after the prompt */
  typedText?: string;
  /** Callback to start the boot sequence (used for mobile tap-to-start) */
  onStart?: () => void;
  /** Feed input value to secret code detection (for mobile virtual keyboard) */
  onInputChange?: (value: string) => void;
  /** Callback to skip boot sequence instantly */
  onSkip?: () => void;
}

/**
 * Props for the BootMessages component
 */
export interface BootMessagesProps {
  /** Messages to display */
  messages: BootMessage[];
  /** Index of the last visible message */
  currentIndex: number;
}
