import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Monaco is a large dependency but loaded on-demand; adjust warning threshold accordingly
    chunkSizeWarningLimit: 5000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('monaco-editor') || id.includes('@monaco-editor/react')) {
            return 'monaco';
          }
          if (id.includes('esbuild-wasm')) {
            return 'esbuild';
          }
          return undefined;
        },
      },
    },
  },
});
