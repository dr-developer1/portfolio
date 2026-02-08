/**
 * Playground Python Worker (Pyodide)
 *
 * Loads Pyodide from CDN and executes Python code in an isolated Web Worker.
 */

// ── Constants ────────────────────────────────────────────────────────────────

const PYODIDE_VERSION = '0.24.1';
const PYODIDE_CDN_BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full`;

// ── Types ────────────────────────────────────────────────────────────────────

type RunMessage = {
  id: string;
  language: 'python';
  code: string;
};

type WorkerResponse = {
  id: string;
  type: 'stdout' | 'stderr' | 'result' | 'error' | 'status';
  payload: string;
};

type PyodideAPI = {
  setStdout: (config: { batched: (msg: string) => void }) => void;
  setStderr: (config: { batched: (msg: string) => void }) => void;
  loadPackagesFromImports: (code: string) => Promise<void>;
  runPythonAsync: (code: string) => Promise<unknown>;
};

// ── Pyodide Singleton ────────────────────────────────────────────────────────

let pyodideReady: Promise<PyodideAPI> | null = null;

function send(message: WorkerResponse): void {
  self.postMessage(message);
}

async function getPyodide(): Promise<PyodideAPI> {
  if (!pyodideReady) {
    pyodideReady = import('https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.mjs')
      .then(
        ({ loadPyodide }) =>
          loadPyodide({ indexURL: `${PYODIDE_CDN_BASE}/` }) as Promise<PyodideAPI>
      )
      .catch((error) => {
        // Reset so next call retries instead of caching a rejected promise
        pyodideReady = null;
        throw error;
      });
  }
  return pyodideReady;
}

// ── Message Handler ──────────────────────────────────────────────────────────

self.onmessage = async (event: MessageEvent<RunMessage>) => {
  const { id, code } = event.data;

  try {
    const pyodide = await getPyodide();

    pyodide.setStdout({
      batched: (msg: string) => send({ id, type: 'stdout', payload: msg }),
    });
    pyodide.setStderr({
      batched: (msg: string) => send({ id, type: 'stderr', payload: msg }),
    });

    await pyodide.loadPackagesFromImports(code);
    const result = await pyodide.runPythonAsync(code);

    if (result !== undefined) {
      send({ id, type: 'result', payload: String(result) });
    }

    send({ id, type: 'status', payload: 'Execution finished.' });
  } catch (error) {
    send({
      id,
      type: 'error',
      payload: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
