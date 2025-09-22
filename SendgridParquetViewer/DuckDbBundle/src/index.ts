import Handlebars from 'handlebars';
import * as duckdb from '@duckdb/duckdb-wasm';
import queryResultsTemplateSource from './templates/query-results-template.html?raw';

type DuckDbLoaderModule = Pick<typeof duckdb, 'ConsoleLogger' | 'AsyncDuckDB'>;

type DuckDbConnection = duckdb.AsyncDuckDBConnection;

type AsyncQueryResult = Awaited<ReturnType<DuckDbConnection['query']>>;

type QueryRows = ReturnType<AsyncQueryResult['toArray']>;

type QueryRow = QueryRows extends ReadonlyArray<infer TRow>
  ? TRow extends Record<string, unknown>
    ? TRow
    : Record<string, unknown>
  : Record<string, unknown>;

interface LoadedDuckDb {
  readonly loader: DuckDbLoaderModule;
  readonly db: duckdb.AsyncDuckDB;
  readonly worker: Worker;
}

interface DuckDbState {
  config?: DuckDbBundleConfig;
  duckDbPromise?: Promise<LoadedDuckDb>;
  httpFsInitialized: boolean;
}

export interface DuckDbBundleConfig {
  readonly bundleBasePath: string;
  readonly moduleLoader: string;
  readonly mainWorker: string;
  readonly mainModule: string;
  readonly pthreadWorker?: string | null;
}

export interface ExecuteQueryRow {
  readonly values: ReadonlyArray<string>;
}

export interface ExecuteQueryResult {
  readonly columns: ReadonlyArray<string>;
  readonly rows: ReadonlyArray<ExecuteQueryRow>;
}

export interface QueryEventsRequest {
  readonly fileUrls: ReadonlyArray<string>;
  readonly email?: string | null;
  readonly eventType?: string | null;
  readonly sgTemplateId?: string | null;
  readonly limit?: number | null;
  readonly selectColumns?: string | null;
}

interface QueryRenderContext {
  readonly columns: ReadonlyArray<string>;
  readonly rows: ReadonlyArray<ExecuteQueryRow>;
  readonly hasColumns: boolean;
  readonly hasRows: boolean;
  readonly columnCount: number;
  readonly rowCount: number;
  readonly totalColumns: number;
}

interface QueryEventsOptions {
  readonly dotNetHelper?: DotNetHelper | null;
}

type DotNetHelper = {
  invokeMethodAsync<T>(method: string, ...args: unknown[]): Promise<T>;
};

const {
  AsyncDuckDB,
  AsyncDuckDBConnection,
  ConsoleLogger
} = duckdb;

const state: DuckDbState = {
  config: undefined,
  duckDbPromise: undefined,
  httpFsInitialized: false
};

const queryResultsTemplate = Handlebars.compile<QueryRenderContext>(queryResultsTemplateSource.trim());

function normalizeBasePath(path: string | null | undefined): string {
  if (!path) {
    return '/duckdb';
  }

  return path.endsWith('/') ? path.slice(0, -1) : path;
}

function ensureConfig(rawConfig: DuckDbBundleConfig | null | undefined): DuckDbBundleConfig {
  if (state.config) {
    return state.config;
  }

  if (!rawConfig) {
    throw new Error('DuckDB configuration is required.');
  }

  const bundleBasePath = normalizeBasePath(rawConfig.bundleBasePath ?? rawConfig.BundleBasePath ?? '/duckdb');
  const moduleLoader = rawConfig.moduleLoader ?? rawConfig.ModuleLoader ?? 'duckdb-browser-bundle.js';
  const mainModule = rawConfig.mainModule ?? rawConfig.MainModule ?? 'duckdb-eh.wasm';
  const pthreadWorker = rawConfig.pthreadWorker ?? rawConfig.PthreadWorker ?? 'duckdb-browser-coi.pthread.worker.js';
  const mainWorker = rawConfig.mainWorker ?? rawConfig.MainWorker ?? 'duckdb-browser-eh.worker.js';

  state.config = {
    bundleBasePath,
    moduleLoader,
    mainModule,
    pthreadWorker: pthreadWorker || null,
    mainWorker
  } satisfies DuckDbBundleConfig;

  return state.config;
}

async function loadDuckDb(config: DuckDbBundleConfig): Promise<LoadedDuckDb> {
  let promise = state.duckDbPromise;

  if (!promise) {
    promise = (async () => {
      const moduleLoaderPath = `${config.bundleBasePath}/${config.moduleLoader}`;
      const loader = (await import(/* @vite-ignore */ moduleLoaderPath)) as DuckDbLoaderModule;
      const workerPath = `${config.bundleBasePath}/${config.mainWorker}`;
      const worker = new Worker(workerPath, { type: 'module' });
      const logger = new loader.ConsoleLogger();
      const db = new loader.AsyncDuckDB(logger, worker);
      const mainModuleUrl = `${config.bundleBasePath}/${config.mainModule}`;
      const pthreadWorkerUrl = config.pthreadWorker ? `${config.bundleBasePath}/${config.pthreadWorker}` : null;

      await db.instantiate(mainModuleUrl, pthreadWorkerUrl ?? undefined);
      return { loader, db, worker } satisfies LoadedDuckDb;
    })();

    state.duckDbPromise = promise;
  }

  return promise;
}

async function ensureHttpFs(connection: duckdb.AsyncDuckDBConnection): Promise<void> {
  if (state.httpFsInitialized) {
    return;
  }

  try {
    await connection.query("INSTALL 'httpfs';");
  } catch (error: unknown) {
    const message = typeof (error as { message?: unknown })?.message === 'string'
      ? (error as { message?: string }).message
      : String(error ?? '');

    if (!message.includes('already installed')) {
      throw error;
    }
  }

  await connection.query("LOAD 'httpfs';");
  state.httpFsInitialized = true;
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

function ensureElement<TElement extends Element>(element: TElement | null | undefined, name: string): TElement {
  if (!element) {
    throw new Error(`${name} element is required.`);
  }

  return element;
}

function normalizeLikePattern(raw: string): string {
  const trimmed = raw.trim();
  const hasWildcard = /[%_]/.test(trimmed);
  return hasWildcard ? trimmed : `%${trimmed}%`;
}

function escapeSqlLiteral(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "''");
}

function buildWhereClause(request: QueryEventsRequest): string {
  const clauses: string[] = [];

  if (request.email && request.email.trim().length > 0) {
    const pattern = normalizeLikePattern(request.email);
    clauses.push(`email ILIKE '${escapeSqlLiteral(pattern)}' ESCAPE '\\'`);
  }

  if (request.eventType && request.eventType.trim().length > 0) {
    clauses.push(`event = '${escapeSqlLiteral(request.eventType)}'`);
  }

  if (request.sgTemplateId && request.sgTemplateId.trim().length > 0) {
    clauses.push(`sg_template_id = '${escapeSqlLiteral(request.sgTemplateId)}'`);
  }

  return clauses.length > 0 ? ` WHERE ${clauses.join(' AND ')}` : '';
}

function buildLimitClause(limit: number | null | undefined): string {
  if (typeof limit !== 'number' || !Number.isFinite(limit)) {
    return '';
  }

  const normalized = Math.max(1, Math.min(Math.trunc(limit), 5000));
  return ` LIMIT ${normalized}`;
}

function renderQueryResultWithTemplate(
  targetElement: Element,
  context: QueryRenderContext,
  dotNetHelper?: DotNetHelper | null
): void {
  targetElement.innerHTML = queryResultsTemplate(context);

  if (!dotNetHelper || context.rowCount === 0) {
    return;
  }

  const buttons = targetElement.querySelectorAll('[data-action="show-details"]');
  buttons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const indexValue = (button as HTMLElement).dataset.rowIndex;
      const parsedIndex = typeof indexValue === 'string' ? Number.parseInt(indexValue, 10) : Number.NaN;

      if (Number.isNaN(parsedIndex)) {
        return;
      }

      dotNetHelper.invokeMethodAsync('ShowEventDetailsFromJs', parsedIndex).catch((error: unknown) => {
        console.warn('Failed to notify detail handler', error);
      });
    });
  });
}

function toExecuteRows(result: AsyncQueryResult, columns: ReadonlyArray<string>): ReadonlyArray<ExecuteQueryRow> {
  if (columns.length === 0) {
    return [];
  }

  const rows = result
    .toArray()
    .map((row: QueryRow) => {
      const values = columns.map((column) => toDisplayValue(row[column]));
      return { values } satisfies ExecuteQueryRow;
    });

  return rows;
}

function ensureRequest(request: QueryEventsRequest | null | undefined): QueryEventsRequest {
  if (!request) {
    throw new Error('A query request is required.');
  }

  const fileUrls = Array.isArray(request.fileUrls) ? request.fileUrls : [];
  const normalizedFileUrls = fileUrls
    .map((url) => typeof url === 'string' ? url.trim() : '')
    .filter((url) => url.length > 0);

  if (normalizedFileUrls.length === 0) {
    throw new Error('At least one parquet file URL must be provided.');
  }

  const limit = typeof request.limit === 'number' ? request.limit : null;

  return {
    fileUrls: normalizedFileUrls,
    email: request.email ?? null,
    eventType: request.eventType ?? null,
    sgTemplateId: request.sgTemplateId ?? null,
    limit,
    selectColumns: request.selectColumns ?? null
  } satisfies QueryEventsRequest;
}

export async function initialize(rawConfig: DuckDbBundleConfig): Promise<void> {
  const config = ensureConfig(rawConfig);
  await loadDuckDb(config);
}

export async function queryEvents(
  rawConfig: DuckDbBundleConfig,
  rawRequest: QueryEventsRequest,
  targetElement: Element,
  options?: QueryEventsOptions | null
): Promise<ExecuteQueryResult> {
  const config = ensureConfig(rawConfig);
  const request = ensureRequest(rawRequest);
  const resolvedTarget = ensureElement(targetElement, 'Target container');
  const dotNetHelper = options?.dotNetHelper ?? null;

  const { db } = await loadDuckDb(config);
  const connection = await db.connect();

  try {
    await ensureHttpFs(connection);

    const resolvedUrls = request.fileUrls.map((url) => resolveParquetUrl(url));
    const sourceLiteral = JSON.stringify(resolvedUrls);

    try {
      await connection.query(`CREATE OR REPLACE TEMP VIEW parquet_source AS SELECT * FROM read_parquet(${sourceLiteral}, union_by_name=true);`);

      const selectColumns = request.selectColumns && request.selectColumns.trim().length > 0
        ? request.selectColumns
        : '*';
      const whereClause = buildWhereClause(request);
      const limitClause = buildLimitClause(request.limit);
      const sql = `SELECT ${selectColumns} FROM parquet_source${whereClause} ORDER BY Timestamp DESC${limitClause}`;

      const result = await connection.query(sql);
      const schemaFields = Array.isArray(result?.schema?.fields) ? result.schema.fields : [];
      const columns = schemaFields
        .map((field) => field?.name ?? '')
        .filter((name): name is string => Boolean(name));

      const rows = toExecuteRows(result, columns);

      if (typeof result.close === 'function') {
        result.close();
      } else if (typeof result.release === 'function') {
        result.release();
      }

      const response: ExecuteQueryResult = {
        columns,
        rows
      };

      const context: QueryRenderContext = {
        columns,
        rows,
        hasColumns: columns.length > 0,
        hasRows: rows.length > 0,
        columnCount: columns.length,
        rowCount: rows.length,
        totalColumns: columns.length + 1
      };

      renderQueryResultWithTemplate(resolvedTarget, context, dotNetHelper);
      return response;
    } finally {
      await connection.query('DROP VIEW IF EXISTS parquet_source;');
    }
  } finally {
    await connection.close();
  }
}

export function clearResults(targetElement: Element | null | undefined): void {
  if (!targetElement) {
    return;
  }

  (targetElement as HTMLElement).innerHTML = '';
}

export async function dispose(): Promise<void> {
  const promise = state.duckDbPromise;
  if (!promise) {
    return;
  }

  try {
    const { db, worker } = await promise;
    await db.terminate();
    worker.terminate();
  } finally {
    state.duckDbPromise = undefined;
    state.config = undefined;
    state.httpFsInitialized = false;
  }
}

export {
  AsyncDuckDB,
  AsyncDuckDBConnection,
  ConsoleLogger
};

export * from '@duckdb/duckdb-wasm';
