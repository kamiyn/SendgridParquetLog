import type * as duckdb from '@duckdb/duckdb-wasm';

export type DuckDbBundleConfig = {
  bundleBasePath: string;
  mainModule: string;
  mainWorker: string;
  moduleLoader: string;
  pthreadWorker?: string | null;
}

export type DuckDbInstance = {
  loader: typeof duckdb;
  db: duckdb.AsyncDuckDB;
  worker: Worker;
}

export type ResultState = {
  columns: string[];
  rows: string[][];
  error: string;
  isLoading: boolean;
}

export type DuckDbQueryPayload = {
  columns: string[];
  rows: Array<{ values: string[] }>;
}

export type ResultAppHandle = {
  runQuery(searchCondition: SearchCondition): Promise<void>;
  reset(): void;
  unmount(): void;
}

export type SearchCondition = {
  parquetUrls: string[];
  email: string;
  eventType: string;
  sgTemplateId: string;
};
