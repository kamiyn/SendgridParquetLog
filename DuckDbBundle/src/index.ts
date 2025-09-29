import type { App } from 'vue';
import { createApp, reactive } from 'vue';
import { formatISO9075 } from 'date-fns';
import * as duckdb from '@duckdb/duckdb-wasm';
import ResultApp from './ResultApp.vue';
import type {
  DuckDbBundleConfig,
  DuckDbInstance,
  DuckDbQueryPayload,
  ResultAppHandle,
  ResultState,
  SearchCondition
} from './resultTypes';

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

function toDisplayValue(column: string, value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  // console.log("toDisplayValue", column, value);
  switch (column) {
    case "timestamp":
      return formatISO9075(new Date(Number(value) * 1000))
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}

/**
 * 表に表示するカラム番号の配列を返す
 */
function CalcTargetColumn(columns: string[]): number[] {
  const showColumns = [
    "timestamp",
    "email",
    "event",
    "category",
    // "reason",
    // "status",
    "response",
    "sg_template_id",
    "marketing_campaign_name",
  ];

  const targetColumn: number[] = [];
  for (const column of showColumns) {
    const idx = columns.indexOf(column);
    if (idx >= 0) {
      targetColumn.push(idx);
    }
  }

  return targetColumn;
}


export function createResultApp(
  element: Element | null | undefined,
  config: DuckDbBundleConfig
): ResultAppHandle {
  if (!config || typeof config.bundleBasePath !== 'string') {
    throw new Error('DuckDB configuration is required.');
  }
  if (!element) {
    throw new Error('A host element is required to mount the result application.');
  }
  const existing = resultAppRegistry.get(element);
  if (existing) {
    return existing.handle;
  }
  element.innerHTML = '';

  const resolvedConfig: DuckDbBundleConfig = {
    bundleBasePath: config.bundleBasePath,
    mainModule: config.mainModule,
    mainWorker: config.mainWorker,
    moduleLoader: config.moduleLoader,
    pthreadWorker: config.pthreadWorker ?? null
  };

  const state = reactive<ResultState>({
    columns: [],
    rows: [],
    targetColumn: [],
    error: '',
    sql: '',
    isLoading: false
  });

  const handle: ResultAppHandle = {
    async runQuery(searchCondition: SearchCondition) {
      if (!searchCondition?.parquetUrls?.length) {
        state.error = 'Select a parquet file to query.';
        state.columns = [];
        state.rows = [];
        state.isLoading = false;
        return;
      }

      state.error = '';
      state.sql = '';
      state.columns = [];
      state.rows = [];
      state.isLoading = true;

      try {
        const result = await executeQuery(resolvedConfig, searchCondition);
        state.columns = result.columns;
        state.rows = result.rows;
        state.targetColumn = CalcTargetColumn(result.columns);
        state.sql = result.sql;
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
      element.innerHTML = '';
      resultAppRegistry.delete(element);
    }
  };

  // element に Vue3 app としてマウントする
  const app = createApp(ResultApp, { state });
  app.mount(element);
  resultAppRegistry.set(element, { app, handle });
  return handle;
}

/**
 * WHERE句を組み立てる
 */
function whereClause(searchCondition: SearchCondition): string {
  const conditions = [];
  if (searchCondition.email) {
    // Escape single quotes to prevent SQL injection
    const emailEscaped = searchCondition.email.replace("'", "''");
    conditions.push(`email ILIKE '${emailEscaped}'`)
  }
  if (searchCondition.eventType) {
    // Escape single quotes to prevent SQL injection
    const eventEscaped = searchCondition.eventType.replace("'", "''");
    conditions.push(`event = '${eventEscaped}'`);
  }
  if (searchCondition.sgTemplateId) {
    // Escape single quotes to prevent SQL injection
    const sgTemplateIdEscaped = searchCondition.sgTemplateId.replace("'", "''");
    conditions.push(`sg_template_id = '${sgTemplateIdEscaped}'`);
  }

  if (conditions.length == 0) {
    return "";
  }
  return "WHERE " + conditions.join(" AND ");
}

async function executeQuery(
  config: DuckDbBundleConfig,
  searchCondition: SearchCondition
): Promise<DuckDbQueryPayload> {
  const { db } = await loadDuckDb(config);
  const connection = await db.connect();

  try {
    const virtualFileNames = [];
    for (const parquetUrl of searchCondition.parquetUrls) {
      const virtualName = parquetUrl.split('/').pop(); // スラッシュで区切った末尾のファイル名を仮想ファイル名として使用
      if (!virtualName) {
        continue;
      }
      virtualFileNames.push(virtualName);
      await db.registerFileURL(
        virtualName, // 仮想ファイル名
        parquetUrl, // 対応するURL
        duckdb.DuckDBDataProtocol.HTTP, // プロトコル
        false // ファイル全体をキャッシュするかどうか
      );
    }

    // UNION ALL クエリ でテーブルを結合してクエリを実施する
    const unionClauses = virtualFileNames.map(name => `SELECT * FROM '${name}'`);
    const fullQuery = `
SELECT 
    *
FROM (
    ${unionClauses.join(' UNION ALL ')}
) AS all_records
${whereClause(searchCondition)}
ORDER BY timestamp
LIMIT 1000;
    `;

    const result = await connection.query(fullQuery);
    const columns = Array.isArray(result?.schema?.fields)
      ? result.schema.fields.map(field => field.name ?? '').filter(name => Boolean(name))
      : [];
    // columns の順番に合わせて row を作る
    const rowValues = result.toArray().map(row => columns.map(column => toDisplayValue(column, row[column])));
    return {
      columns,
      rows: rowValues,
      sql: fullQuery,
    } satisfies DuckDbQueryPayload;
  } finally {
    await connection.close();
  }
}

const {
  AsyncDuckDB,
  AsyncDuckDBConnection,
  ConsoleLogger
} = duckdb;

export {
  AsyncDuckDB,
  AsyncDuckDBConnection,
  ConsoleLogger,
};
