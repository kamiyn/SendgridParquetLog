import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function copySourcePlugin() {
  return {
    name: 'copy-duckdb-source',
    generateBundle() {
      const sourcePath = resolve(__dirname, 'src/index.js');
      const sourceContent = readFileSync(sourcePath, 'utf8');
      this.emitFile({
        type: 'asset',
        fileName: 'duckdb-browser-bundle.source.js',
        source: sourceContent,
      });
    },
  };
}

export default defineConfig({
  plugins: [copySourcePlugin()],
  build: {
    outDir: resolve(__dirname, '../SendgridParquetViewer/wwwroot/duckdb'),
    emptyOutDir: false,
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      formats: ['es'],
      fileName: () => 'duckdb-browser-bundle.js'
    },
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  esbuild: {
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true
  }
});
