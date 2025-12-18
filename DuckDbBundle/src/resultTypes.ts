import type * as duckdb from '@duckdb/duckdb-wasm';

export type DuckDbBundleConfig = {
  bundleBasePath: string
  mainModule: string
  mainWorker: string
  moduleLoader: string
  pthreadWorker?: string | null
};

export type DuckDbInstance = {
  loader: typeof duckdb
  db: duckdb.AsyncDuckDB
  worker: Worker
};

export type ResultState = {
  columns: string[]
  rows: string[][]
  targetColumn: number[]
  error: string
  sql: string
  isLoading: boolean
  currentRegisteringUrl?: string
  executeCustomSql?: (sql: string) => Promise<void>
};

export type DuckDbQueryPayload = {
  columns: string[]
  rows: string[][]
  sql: string
};

export type ResultAppHandle = {
  runQuery(searchCondition: SearchCondition): Promise<void>
  reset(): void
  unmount(): void
};

export type SearchCondition = {
  parquetUrls: string[]
  email: string
  eventType: string
  sgTemplateId: string
};

// Histogram types
export type HistogramBar = {
  day: number
  hour: number
  count: number
};

export type HistogramState = {
  bars: HistogramBar[]
  maxCount: number
  barWidth: number
  mode: 'day' | 'month'
  error: string
  isLoading: boolean
  searchExecuted: boolean
  currentRegisteringUrl?: string
};

export type HistogramAppHandle = {
  runQuery(searchCondition: SearchCondition, mode: 'day' | 'month', targetDate: { year: number, month: number, day?: number }): Promise<void>
  reset(): void
  unmount(): void
};
