/* Pyodide CDN type declarations */
declare module 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.mjs' {
  export function loadPyodide(options?: { indexURL?: string }): Promise<unknown>;
}
