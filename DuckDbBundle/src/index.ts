import type { App } from 'vue';
import { createApp, reactive } from 'vue';
import * as duckdb from '@duckdb/duckdb-wasm';
import * as arrow from 'apache-arrow';
import ResultApp from './ResultApp.vue';
import type {
  DuckDbBundleConfig,
  DuckDbInstance,
  DuckDbQueryPayload,
  ResultAppHandle,
  ResultState
} from './resultTypes';

const {
  AsyncDuckDB,
  AsyncDuckDBConnection,
  ConsoleLogger,
  selectBundle
} = duckdb;

const duckDbState: {
  duckDbPromise: Promise<DuckDbInstance> | null;
  httpFsInitialized: boolean;
} = {
  duckDbPromise: null,
  httpFsInitialized: false
};

const resultAppRegistry = new WeakMap<Element, { app: App<Element>; handle: ResultAppHandle }>();

async function loadDuckDb(config: DuckDbBundleConfig): Promise<DuckDbInstance> {
  if (!duckDbState.duckDbPromise) {
    duckDbState.duckDbPromise = (async () => {
      if (!config) {
        throw new Error('DuckDB configuration is required.');
      }

      const moduleLoaderPath = `${config.bundleBasePath}/${config.moduleLoader}`;
      const loader = (await import(/* @vite-ignore */ moduleLoaderPath)) as typeof duckdb;
      const workerPath = `${config.bundleBasePath}/${config.mainWorker}`;
      const worker = new Worker(workerPath, { type: 'module' });
      const logger = new loader.ConsoleLogger();
      const db = new loader.AsyncDuckDB(logger, worker);
      const mainModuleUrl = `${config.bundleBasePath}/${config.mainModule}`;
      const pthreadWorkerUrl = config.pthreadWorker
        ? `${config.bundleBasePath}/${config.pthreadWorker}`
        : null;

      await db.instantiate(mainModuleUrl, pthreadWorkerUrl);
      return { loader, db, worker } satisfies DuckDbInstance;
    })();
  }

  return duckDbState.duckDbPromise;
}

async function ensureHttpFs(connection: duckdb.AsyncDuckDBConnection): Promise<void> {
  if (duckDbState.httpFsInitialized) {
    return;
  }

  try {
    await connection.query("INSTALL 'httpfs';");
  } catch (error) {
    const message = typeof (error as { message?: unknown })?.message === 'string'
      ? (error as { message: string }).message
      : String(error ?? '');
    if (!message.includes('already installed')) {
      throw error;
    }
  }

  await connection.query("LOAD 'httpfs';");
  duckDbState.httpFsInitialized = true;
}

function toDisplayValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}

function resolveParquetUrl(parquetUrl: string): string {
  if (!parquetUrl) {
    return parquetUrl;
  }

  if (parquetUrl.startsWith('http://') || parquetUrl.startsWith('https://')) {
    return parquetUrl;
  }

  const baseUrl = typeof window === 'object' && window.location
    ? window.location.origin
    : globalThis.location?.origin ?? '';

  return new URL(parquetUrl, baseUrl).toString();
}

function cloneRowValues(rows: DuckDbQueryPayload['rows']): string[][] {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.map(row => {
    const values = Array.isArray(row?.values) ? row.values : [];
    return values.map(value => String(value ?? ''));
  });
}

function ensureHostElement(element: Element | null | undefined): Element {
  if (!element) {
    throw new Error('A host element is required to mount the result application.');
  }

  return element;
}

export function createResultApp(
  element: Element | null | undefined,
  config: DuckDbBundleConfig
): ResultAppHandle {
  if (!config || typeof config.bundleBasePath !== 'string') {
    throw new Error('DuckDB configuration is required.');
  }

  const host = ensureHostElement(element);
  const existing = resultAppRegistry.get(host);
  if (existing) {
    return existing.handle;
  }

  const resolvedConfig: DuckDbBundleConfig = {
    bundleBasePath: config.bundleBasePath,
    mainModule: config.mainModule,
    mainWorker: config.mainWorker,
    moduleLoader: config.moduleLoader,
    pthreadWorker: config.pthreadWorker ?? null
  };

  host.innerHTML = '';
  const state = reactive<ResultState>({
    columns: [],
    rows: [],
    error: '',
    isLoading: false
  });

  const app = createApp(ResultApp, { state });
  app.mount(host);

  const handle: ResultAppHandle = {
    async runQuery(parquetUrl: string, sql: string) {
      const source = typeof parquetUrl === 'string' ? parquetUrl.trim() : '';
      const statement = typeof sql === 'string' ? sql.trim() : '';

      if (!source) {
        state.error = 'Select a parquet file to query.';
        state.columns = [];
        state.rows = [];
        state.isLoading = false;
        return;
      }

      if (!statement) {
        state.error = 'Enter a SQL statement.';
        state.columns = [];
        state.rows = [];
        state.isLoading = false;
        return;
      }

      state.error = '';
      state.columns = [];
      state.rows = [];
      state.isLoading = true;

      try {
        const result = await executeQuery(resolvedConfig, source, statement);
        state.columns = Array.isArray(result.columns) ? [...result.columns] : [];
        state.rows = cloneRowValues(result.rows);
      } catch (error) {
        state.error = error instanceof Error ? error.message : String(error ?? '');
      } finally {
        state.isLoading = false;
      }
    },
    reset() {
      state.error = '';
      state.columns = [];
      state.rows = [];
      state.isLoading = false;
    },
    unmount() {
      app.unmount();
      host.innerHTML = '';
      resultAppRegistry.delete(host);
    }
  };

  resultAppRegistry.set(host, { app, handle });
  return handle;
}

export async function executeQuery(
  config: DuckDbBundleConfig,
  parquetUrl: string,
  sql: string
): Promise<DuckDbQueryPayload> {
  if (!config) {
    throw new Error('DuckDB configuration is required.');
  }

  if (!parquetUrl) {
    throw new Error('A parquet URL must be provided.');
  }

  const { db } = await loadDuckDb(config);
  const connection = await db.connect();

  try {
    await ensureHttpFs(connection);
    const resolvedParquetUrl = resolveParquetUrl(parquetUrl);
    const sourceLiteral = JSON.stringify(resolvedParquetUrl);

    try {
      await connection.query(`CREATE OR REPLACE TEMP VIEW parquet_source AS SELECT * FROM read_parquet(${sourceLiteral});`);
      const result = await connection.query(sql);
      const columns = Array.isArray(result?.schema?.fields)
        ? result.schema.fields.map(field => field.name ?? '').filter(name => Boolean(name))
        : [];

      const rowValues = result.toArray().map(row => columns.map(column => toDisplayValue(row[column])));

      closeArrowTable(result);

      return {
        columns,
        rows: rowValues.map(values => ({ values }))
      } satisfies DuckDbQueryPayload;
    } finally {
      await connection.query('DROP VIEW IF EXISTS parquet_source;');
    }
  } finally {
    await connection.close();
  }
}

function closeArrowTable(result: any) {
  if (typeof result.close === 'function') {
    result.close();
  } else if (typeof result.release === 'function') {
    result.release();
  }
}

export {
  AsyncDuckDB,
  AsyncDuckDBConnection,
  ConsoleLogger,
  arrow,
  loadDuckDb,
  selectBundle
};

export type { DuckDbBundleConfig, DuckDbInstance, DuckDbQueryPayload, ResultAppHandle, ResultState } from './resultTypes';
// export * from '@duckdb/duckdb-wasm';
