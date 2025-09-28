import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { copyFile, mkdir, readdir, rm, readFile, writeFile } from 'node:fs/promises';

const currentDir = fileURLToPath(new URL('.', import.meta.url));
const outputDirectory = resolve(currentDir, '../SendgridParquetViewer/wwwroot/duckdb');
const sourceDirectory = resolve(currentDir, 'src');
const duckDbPackageJsonPath = resolve(currentDir, 'node_modules/@duckdb/duckdb-wasm/package.json');
const duckDbAssetFiles = Object.freeze([
  'duckdb-browser.mjs',
  'duckdb-eh.wasm',
  'duckdb-browser-eh.worker.js',
  'duckdb-browser-coi.pthread.worker.js'
]);

async function downloadDuckDbAssets() {
  const packageJson = JSON.parse(await readFile(duckDbPackageJsonPath, 'utf8'));
  const baseUrl = new URL(`https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@${packageJson.version}/dist/`);
  await mkdir(outputDirectory, { recursive: true });

  const downloadTasks = duckDbAssetFiles.map(async (fileName) => {
    const assetUrl = new URL(fileName, baseUrl);
    const response = await fetch(assetUrl);

    if (!response.ok) {
      throw new Error(`Failed to download ${assetUrl.toString()}: ${response.status} ${response.statusText}`);
    }

    const fileBuffer = Buffer.from(await response.arrayBuffer());
    await writeFile(resolve(outputDirectory, fileName), fileBuffer);
  });

  await Promise.all(downloadTasks);
}

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

function downloadDuckDbAssetsPlugin() {
  return {
    name: 'download-duckdb-assets',
    apply: 'build',
    async buildStart() {
      await downloadDuckDbAssets();
    }
  };
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

export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development';
  return {
    plugins: [vue(), downloadDuckDbAssetsPlugin(), copySourcesPlugin()],
    build: {
      outDir: outputDirectory,
      emptyOutDir: false,
      lib: {
        entry: resolve(currentDir, 'src/index.ts'),
        formats: ['es'],
        fileName: () => 'duckdb-browser-bundle.js'
      },
      sourcemap: isDevelopment,
      minify: !isDevelopment,
      rollupOptions: {
        external: [],
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
    define: {
      // ライブラリ内で 'process.env.NODE_ENV' などを参照している箇所を、
      // ビルド時に空のオブジェクトに置き換えることでエラーを回避します。
      'process.env': {}
    }
  };
});
