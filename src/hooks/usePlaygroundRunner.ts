/**
 * usePlaygroundRunner Hook
 *
 * Handles execution of code in isolated workers with stdout/stderr capture.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import type { PlaygroundLanguage, PlaygroundOutputEntry } from '../types/playground';
import { generateLineId } from '../utils/helpers';

const RUN_TIMEOUT_MS = 20000;

type WorkerMessage = {
  id: string;
  type: 'stdout' | 'stderr' | 'result' | 'error' | 'status';
  payload: string;
};

type StopReason = 'stopped' | 'timeout' | 'error' | 'complete';

type StopOptions = {
  terminate?: boolean;
  statusMessage?: string;
};

export function usePlaygroundRunner() {
  const [outputs, setOutputs] = useState<PlaygroundOutputEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const currentRunIdRef = useRef<string | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const jsWorkerRef = useRef<Worker | null>(null);
  const pyWorkerRef = useRef<Worker | null>(null);

  const appendOutput = useCallback((type: PlaygroundOutputEntry['type'], message: string) => {
    setOutputs((prev) => [
      ...prev,
      {
        id: generateLineId(),
        type,
        message,
        timestamp: Date.now(),
      },
    ]);
  }, []);

  /** Create only the worker needed for the given language */
  const getOrCreateWorker = useCallback((language: PlaygroundLanguage): Worker => {
    if (language === 'python') {
      if (!pyWorkerRef.current) {
        pyWorkerRef.current = new Worker(
          new URL('../workers/playground-py.worker.ts', import.meta.url),
          { type: 'module' }
        );
      }
      return pyWorkerRef.current;
    }

    if (!jsWorkerRef.current) {
      jsWorkerRef.current = new Worker(
        new URL('../workers/playground-js.worker.ts', import.meta.url),
        { type: 'module' }
      );
    }
    return jsWorkerRef.current;
  }, []);

  const resetWorkers = useCallback(() => {
    if (jsWorkerRef.current) {
      jsWorkerRef.current.terminate();
      jsWorkerRef.current = null;
    }
    if (pyWorkerRef.current) {
      pyWorkerRef.current.terminate();
      pyWorkerRef.current = null;
    }
  }, []);

  const stopRun = useCallback(
    (reason?: StopReason, options: StopOptions = {}) => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (options.statusMessage) {
        appendOutput('status', options.statusMessage);
      } else if (reason === 'stopped') {
        appendOutput('status', 'Execution stopped.');
      }

      if (currentRunIdRef.current) {
        currentRunIdRef.current = null;
      }

      setIsRunning(false);

      const shouldTerminate =
        (options.terminate ?? reason === 'stopped') || reason === 'timeout' || reason === 'error';
      if (shouldTerminate) {
        resetWorkers();
      }
    },
    [appendOutput, resetWorkers]
  );

  const runCode = useCallback(
    (language: PlaygroundLanguage, code: string) => {
      setOutputs([]);
      setIsRunning(true);

      const runId = generateLineId();
      currentRunIdRef.current = runId;

      const worker = getOrCreateWorker(language);

      const handleMessage = (event: MessageEvent<WorkerMessage>) => {
        if (event.data.id !== runId) return;

        if (event.data.type === 'error') {
          appendOutput('stderr', event.data.payload);
          appendOutput('status', 'Execution finished with errors.');
          cleanup();
          stopRun('error', { terminate: true });
          return;
        }

        if (event.data.type === 'status') {
          appendOutput('status', event.data.payload);
          cleanup();
          stopRun('complete', { terminate: false });
          return;
        }

        const type = event.data.type === 'result' ? 'result' : event.data.type;
        appendOutput(type, event.data.payload);
      };

      const handleError = (event: ErrorEvent) => {
        appendOutput('stderr', event.message || 'Worker crashed unexpectedly.');
        cleanup();
        stopRun('error', { terminate: true });
      };

      const cleanup = () => {
        worker.removeEventListener('message', handleMessage);
        worker.removeEventListener('error', handleError);
      };

      worker.addEventListener('message', handleMessage);
      worker.addEventListener('error', handleError);

      timeoutRef.current = window.setTimeout(() => {
        appendOutput('stderr', 'Execution timed out.');
        cleanup();
        stopRun('timeout', { terminate: true, statusMessage: 'Execution timed out.' });
      }, RUN_TIMEOUT_MS);

      worker.postMessage({ id: runId, language, code });
    },
    [appendOutput, getOrCreateWorker, stopRun]
  );

  const clearOutputs = useCallback(() => {
    setOutputs([]);
  }, []);

  useEffect(() => {
    return () => {
      resetWorkers();
    };
  }, [resetWorkers]);

  return {
    outputs,
    isRunning,
    runCode,
    stopRun,
    clearOutputs,
  };
}
