import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: resolve(__dirname, '../wwwroot/js'),
    emptyOutDir: false,
    assetsInlineLimit: 0,
    sourcemap: false,
    lib: {
      entry: resolve(__dirname, 'src/duckdbInterop.ts'),
      name: 'DuckDbInterop',
      formats: ['es'],
      fileName: () => 'duckdbInterop.js',
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.wasm')) {
            return 'duckdbInterop-[name][extname]';
          }
          if (assetInfo.name?.endsWith('.worker.js')) {
            return 'duckdbInterop-[name][extname]';
          }
          return 'duckdbInterop-[name][extname]';
        },
        chunkFileNames: 'duckdbInterop-[name].js',
        entryFileNames: 'duckdbInterop.js',
      },
    },
  },
});
