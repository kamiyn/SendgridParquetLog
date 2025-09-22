import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { copyFile, mkdir, readdir, rm } from 'node:fs/promises';

const currentDir = fileURLToPath(new URL('.', import.meta.url));
const outputDirectory = resolve(currentDir, '../wwwroot/duckdb');
const sourceDirectory = resolve(currentDir, 'src');

async function copyDirectoryContents(sourceRoot, targetRoot) {
  await mkdir(targetRoot, { recursive: true });
  const entries = await readdir(sourceRoot, { withFileTypes: true });

  await Promise.all(entries.map(async (entry) => {
    const sourcePath = resolve(sourceRoot, entry.name);
    const targetPath = resolve(targetRoot, entry.name);

    if (entry.isDirectory()) {
      await copyDirectoryContents(sourcePath, targetPath);
      return;
    }

    await copyFile(sourcePath, targetPath);
  }));
}

async function ensureSourceCopies() {
  await rm(resolve(outputDirectory, 'src'), { recursive: true, force: true });
  await copyDirectoryContents(sourceDirectory, resolve(outputDirectory, 'src'));
}

function copySourcesPlugin() {
  return {
    name: 'copy-duckdb-source-files',
    apply: 'build',
    async closeBundle() {
      await ensureSourceCopies();
    }
  };
}

export default defineConfig({
  build: {
    outDir: outputDirectory,
    emptyOutDir: false,
    lib: {
      entry: resolve(currentDir, 'src/index.ts'),
      formats: ['es'],
      fileName: () => 'duckdb-browser-bundle.js'
    },
    sourcemap: true,
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
  },
  plugins: [copySourcesPlugin()]
});
