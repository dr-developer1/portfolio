/**
 * Playground JS/TS Worker
 *
 * Executes JavaScript and TypeScript code in an isolated Web Worker.
 * TypeScript is transpiled via esbuild-wasm before execution.
 */

import * as esbuild from 'esbuild-wasm';

// ── Constants ────────────────────────────────────────────────────────────────

const ESBUILD_WASM_VERSION = '0.27.3';
const ESBUILD_WASM_URL = `https://unpkg.com/esbuild-wasm@${ESBUILD_WASM_VERSION}/esbuild.wasm`;

// ── Types ────────────────────────────────────────────────────────────────────

type RunMessage = {
  id: string;
  language: 'javascript' | 'typescript';
  code: string;
};

type WorkerResponse = {
  id: string;
  type: 'stdout' | 'stderr' | 'result' | 'error' | 'status';
  payload: string;
};

// ── esbuild Initialization ───────────────────────────────────────────────────

let esbuildInitPromise: Promise<void> | null = null;

async function ensureEsbuildReady(): Promise<void> {
  if (!esbuildInitPromise) {
    esbuildInitPromise = esbuild.initialize({ wasmURL: ESBUILD_WASM_URL }).catch((error) => {
      // Reset so that subsequent calls can retry initialization
      esbuildInitPromise = null;
      throw error;
    });
  }
  await esbuildInitPromise;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function send(message: WorkerResponse): void {
  self.postMessage(message);
}

function formatConsoleArg(arg: unknown): string {
  if (typeof arg === 'string') return arg;
  if (typeof arg === 'number' || typeof arg === 'boolean' || typeof arg === 'bigint') {
    return String(arg);
  }
  if (arg === null) return 'null';
  if (arg === undefined) return 'undefined';
  if (arg instanceof Error) return arg.message;
  if (typeof arg === 'object') {
    try {
      return JSON.stringify(arg, null, 2);
    } catch {
      return Object.prototype.toString.call(arg);
    }
  }
  return String(arg);
}

/** Build a console proxy that forwards output to the main thread */
function createConsoleProxy(id: string, originalConsole: Console): Console {
  const makeHandler =
    (type: 'stdout' | 'stderr') =>
    (...args: unknown[]) =>
      send({ id, type, payload: args.map(formatConsoleArg).join(' ') });

  const base = {
    log: makeHandler('stdout'),
    info: makeHandler('stdout'),
    warn: makeHandler('stderr'),
    error: makeHandler('stderr'),
    debug: makeHandler('stdout'),
    dir: makeHandler('stdout'),
    table: makeHandler('stdout'),
    trace: makeHandler('stderr'),
  } as Console;

  return new Proxy(base, {
    get(target, prop) {
      if (prop in target) return (target as unknown as Record<string | symbol, unknown>)[prop];
      const value = (originalConsole as unknown as Record<string | symbol, unknown>)[prop];
      return typeof value === 'function' ? value.bind(originalConsole) : value;
    },
  });
}

// ── Execution ────────────────────────────────────────────────────────────────

async function runJavaScript(code: string, id: string): Promise<void> {
  const originalConsole = self.console;
  const proxy = createConsoleProxy(id, originalConsole);
  const activeTimeouts = new Set<number>();
  const activeIntervals = new Set<number>();

  const trackedSetTimeout: typeof self.setTimeout = (handler, timeout, ...args) => {
    const timerId = self.setTimeout(handler, timeout, ...args);
    activeTimeouts.add(timerId);
    return timerId;
  };

  const trackedSetInterval: typeof self.setInterval = (handler, timeout, ...args) => {
    const timerId = self.setInterval(handler, timeout, ...args);
    activeIntervals.add(timerId);
    return timerId;
  };

  const trackedClearTimeout: typeof self.clearTimeout = (timerId) => {
    if (typeof timerId === 'number') {
      activeTimeouts.delete(timerId);
    }
    self.clearTimeout(timerId);
  };

  const trackedClearInterval: typeof self.clearInterval = (timerId) => {
    if (typeof timerId === 'number') {
      activeIntervals.delete(timerId);
    }
    self.clearInterval(timerId);
  };

  try {
    const asyncFn = new Function(
      'console',
      'setTimeout',
      'setInterval',
      'clearTimeout',
      'clearInterval',
      `return (async () => {\n${code}\n})();`
    );
    const result = await asyncFn(
      proxy,
      trackedSetTimeout,
      trackedSetInterval,
      trackedClearTimeout,
      trackedClearInterval
    );

    if (result !== undefined) {
      send({ id, type: 'result', payload: formatConsoleArg(result) });
    }

    send({ id, type: 'status', payload: 'Execution finished.' });
  } catch (error) {
    send({
      id,
      type: 'error',
      payload: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    activeTimeouts.forEach((timerId) => self.clearTimeout(timerId));
    activeIntervals.forEach((timerId) => self.clearInterval(timerId));
    activeTimeouts.clear();
    activeIntervals.clear();
  }
}

function containsModuleSyntax(code: string): boolean {
  return /^\s*import\s|^\s*export\s/m.test(code);
}

// ── Message Handler ──────────────────────────────────────────────────────────

self.onmessage = async (event: MessageEvent<RunMessage>) => {
  const { id, language, code } = event.data;

  try {
    if (containsModuleSyntax(code)) {
      send({
        id,
        type: 'error',
        payload:
          'ESM import/export is not supported in the playground runtime. Please inline code or avoid module syntax.',
      });
      return;
    }

    if (language === 'typescript') {
      await ensureEsbuildReady();
      const result = await esbuild.transform(code, {
        loader: 'ts',
        format: 'iife',
        target: 'es2020',
      });
      await runJavaScript(result.code, id);
      return;
    }

    await runJavaScript(code, id);
  } catch (error) {
    send({
      id,
      type: 'error',
      payload: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
