import type { App } from 'vue';
import { createApp, reactive } from 'vue';
import { formatISO9075 } from 'date-fns';
import * as duckdb from '@duckdb/duckdb-wasm';
import ResultApp from './ResultApp.vue';
import HistogramApp from './HistogramApp.vue';
import type {
  DuckDbBundleConfig,
  DuckDbInstance,
  DuckDbQueryPayload,
  ResultAppHandle,
  ResultState,
  SearchCondition,
  HistogramState,
  HistogramAppHandle,
  HistogramBar,
} from './resultTypes';

const duckDbState: {
  duckDbPromise: Promise<DuckDbInstance> | null
  httpFsInitialized: boolean
} = {
  duckDbPromise: null,
  httpFsInitialized: false,
};

const resultAppRegistry = new WeakMap<Element, { app: App<Element>, handle: ResultAppHandle }>();

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
    case 'timestamp':
      return formatISO9075(new Date(Number(value) * 1000));
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
    'timestamp',
    'email',
    'event',
    'category',
    // "reason",
    // "status",
    'response',
    'sg_template_id',
    'marketing_campaign_name',
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
  config: DuckDbBundleConfig,
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
    pthreadWorker: config.pthreadWorker ?? null,
  };

  const state = reactive<ResultState>({
    columns: [],
    rows: [],
    targetColumn: [],
    error: '',
    sql: '',
    isLoading: false,
    currentRegisteringUrl: undefined,
    executeCustomSql: undefined,
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
        const result = await executeQuery(
          resolvedConfig,
          searchCondition,
          (url) => { state.currentRegisteringUrl = url; },
        );
        state.columns = result.columns;
        state.rows = result.rows;
        state.targetColumn = CalcTargetColumn(result.columns);
        state.sql = result.sql;
      }
      catch (error) {
        state.error = error instanceof Error ? error.message : String(error ?? '');
      }
      finally {
        state.currentRegisteringUrl = undefined;
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
    },
  };

  // executeCustomSql の実装を state に追加
  state.executeCustomSql = async (sql: string) => {
    if (!sql || !sql.trim()) {
      state.error = 'SQL query is empty.';
      return;
    }

    state.error = '';
    state.isLoading = true;

    try {
      const result = await executeCustomSqlQuery(resolvedConfig, sql);
      state.columns = result.columns;
      state.rows = result.rows;
      state.targetColumn = CalcTargetColumn(result.columns);
      state.sql = sql;
    }
    catch (error) {
      state.error = error instanceof Error ? error.message : String(error ?? '');
    }
    finally {
      state.isLoading = false;
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
    const emailEscaped = searchCondition.email.replace('\'', '\'\'');
    conditions.push(`email ILIKE '${emailEscaped}'`);
  }
  if (searchCondition.eventType) {
    // Escape single quotes to prevent SQL injection
    const eventEscaped = searchCondition.eventType.replace('\'', '\'\'');
    conditions.push(`event = '${eventEscaped}'`);
  }
  if (searchCondition.sgTemplateId) {
    // Escape single quotes to prevent SQL injection
    const sgTemplateIdEscaped = searchCondition.sgTemplateId.replace('\'', '\'\'');
    conditions.push(`sg_template_id = '${sgTemplateIdEscaped}'`);
  }

  if (conditions.length == 0) {
    return '';
  }
  return 'WHERE ' + conditions.join(' AND ');
}

type DuckDBException = {
  message: string
};

async function executeQuery(
  config: DuckDbBundleConfig,
  searchCondition: SearchCondition,
  displayRegisterFileURL?: (url: string | undefined) => void,
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
      try {
        displayRegisterFileURL?.(parquetUrl);
        await db.registerFileURL(
          virtualName, // 仮想ファイル名
          parquetUrl, // 対応するURL
          duckdb.DuckDBDataProtocol.HTTP, // プロトコル
          false, // ファイル全体をキャッシュするかどうか
        );
      }
      catch (ex) {
        if (((<DuckDBException>ex).message?.startsWith('File already registered:'))) {
          // 同一名称の登録によるエラーは抑制する
        }
        else {
          console.error(ex);
        }
      }
    }

    // 有効なファイルがない場合は空の結果を返す
    if (virtualFileNames.length === 0) {
      return {
        columns: [],
        rows: [],
        sql: '-- No valid parquet files to query',
      };
    }

    // read_parquet で複数ファイルを一括読み込み
    const sanitizedFileNames = virtualFileNames.map(
      name => `'${name.replace(/'/g, '\'\'')}'`,
    );
    const fileList = sanitizedFileNames.join(',');
    const fullQuery = `
SELECT *
FROM read_parquet([${fileList}])
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
  }
  finally {
    await connection.close();
  }
}

/**
 * カスタム SQL を実行する（ファイル登録は行わない）
 */
async function executeCustomSqlQuery(
  config: DuckDbBundleConfig,
  sql: string,
): Promise<DuckDbQueryPayload> {
  const { db } = await loadDuckDb(config);
  const connection = await db.connect();
  try {
    const result = await connection.query(sql);
    const columns = Array.isArray(result?.schema?.fields)
      ? result.schema.fields.map(field => field.name ?? '').filter(name => Boolean(name))
      : [];
    // columns の順番に合わせて row を作る
    const rowValues = result.toArray().map(row => columns.map(column => toDisplayValue(column, row[column])));
    return {
      columns,
      rows: rowValues,
      sql,
    } satisfies DuckDbQueryPayload;
  }
  finally {
    await connection.close();
  }
}

const histogramAppRegistry = new WeakMap<Element, { app: App<Element>, handle: HistogramAppHandle }>();

export function createHistogramApp(
  element: Element | null | undefined,
  config: DuckDbBundleConfig,
): HistogramAppHandle {
  if (!config || typeof config.bundleBasePath !== 'string') {
    throw new Error('DuckDB configuration is required.');
  }
  if (!element) {
    throw new Error('A host element is required to mount the histogram application.');
  }
  const existing = histogramAppRegistry.get(element);
  if (existing) {
    return existing.handle;
  }
  element.innerHTML = '';

  const resolvedConfig: DuckDbBundleConfig = {
    bundleBasePath: config.bundleBasePath,
    mainModule: config.mainModule,
    mainWorker: config.mainWorker,
    moduleLoader: config.moduleLoader,
    pthreadWorker: config.pthreadWorker ?? null,
  };

  const state = reactive<HistogramState>({
    bars: [],
    maxCount: 0,
    barWidth: 15,
    mode: 'day',
    error: '',
    isLoading: false,
    searchExecuted: false,
    currentRegisteringUrl: undefined,
  });

  const handle: HistogramAppHandle = {
    async runQuery(searchCondition: SearchCondition, mode: 'day' | 'month', targetDate: { year: number, month: number, day?: number }) {
      if (!searchCondition?.parquetUrls?.length) {
        state.error = 'Select a parquet file to query.';
        state.bars = [];
        state.isLoading = false;
        state.searchExecuted = true;
        return;
      }

      state.error = '';
      state.bars = [];
      state.isLoading = true;
      state.searchExecuted = false;
      state.mode = mode;
      state.barWidth = mode === 'day' ? 15 : 1;

      try {
        const result = await executeHistogramQuery(
          resolvedConfig,
          searchCondition,
          (url) => { state.currentRegisteringUrl = url; },
        );

        // Build histogram bars
        const bars = buildHistogramBars(result, mode, targetDate);
        state.bars = bars;
        state.maxCount = bars.length > 0 ? Math.max(...bars.map(b => b.count)) : 0;
        state.searchExecuted = true;
      }
      catch (error) {
        state.error = error instanceof Error ? error.message : String(error ?? '');
        state.searchExecuted = true;
      }
      finally {
        state.currentRegisteringUrl = undefined;
        state.isLoading = false;
      }
    },
    reset() {
      state.error = '';
      state.bars = [];
      state.maxCount = 0;
      state.isLoading = false;
      state.searchExecuted = false;
    },
    unmount() {
      app.unmount();
      element.innerHTML = '';
      histogramAppRegistry.delete(element);
    },
  };

  const app = createApp(HistogramApp, { state });
  app.mount(element);
  histogramAppRegistry.set(element, { app, handle });
  return handle;
}

function buildHistogramBars(
  queryResult: { day: number, hour: number, count: number }[],
  mode: 'day' | 'month',
  targetDate: { year: number, month: number, day?: number },
): HistogramBar[] {
  const bars: HistogramBar[] = [];

  if (mode === 'day') {
    // 1日分: 24時間
    for (let hour = 0; hour < 24; hour++) {
      const result = queryResult.find(r => r.hour === hour);
      bars.push({
        day: targetDate.day ?? 1,
        hour,
        count: result?.count ?? 0,
      });
    }
  }
  else {
    // 1か月分: 日数 × 24時間
    // NOTE: targetDate.month is 1-indexed (1–12) from C#; JavaScript Date expects 0-indexed months (0–11).
    // Passing day = 0 returns the last day of the previous month, which gives the number of days in targetDate.month.
    const daysInMonth = new Date(targetDate.year, targetDate.month, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const result = queryResult.find(r => r.day === day && r.hour === hour);
        bars.push({
          day,
          hour,
          count: result?.count ?? 0,
        });
      }
    }
  }

  return bars;
}

async function executeHistogramQuery(
  config: DuckDbBundleConfig,
  searchCondition: SearchCondition,
  displayRegisterFileURL?: (url: string | undefined) => void,
): Promise<{ day: number, hour: number, count: number }[]> {
  const { db } = await loadDuckDb(config);
  const connection = await db.connect();
  try {
    const virtualFileNames = [];
    for (const parquetUrl of searchCondition.parquetUrls) {
      const virtualName = parquetUrl.split('/').pop();
      if (!virtualName) {
        continue;
      }
      virtualFileNames.push(virtualName);
      try {
        displayRegisterFileURL?.(parquetUrl);
        await db.registerFileURL(
          virtualName,
          parquetUrl,
          duckdb.DuckDBDataProtocol.HTTP,
          false,
        );
      }
      catch (ex) {
        if (((<DuckDBException>ex).message?.startsWith('File already registered:'))) {
          // 同一名称の登録によるエラーは抑制する
        }
        else {
          console.error(ex);
        }
      }
    }

    if (virtualFileNames.length === 0) {
      return [];
    }

    const sanitizedFileNames = virtualFileNames.map(
      name => `'${name.replace(/'/g, '\'\'')}'`,
    );
    const fileList = sanitizedFileNames.join(',');

    // timestampはUnix秒なので、日本時間(UTC+9)に変換して日と時間を抽出
    const fullQuery = `
SELECT
  EXTRACT(DAY FROM to_timestamp(timestamp) AT TIME ZONE 'Asia/Tokyo') AS day,
  EXTRACT(HOUR FROM to_timestamp(timestamp) AT TIME ZONE 'Asia/Tokyo') AS hour,
  COUNT(*) AS count
FROM read_parquet([${fileList}])
${whereClause(searchCondition)}
GROUP BY day, hour
ORDER BY day, hour;
    `;

    // console.log('Histogram query:', fullQuery);

    const result = await connection.query(fullQuery);
    return result.toArray().map(row => ({
      day: Number(row.day),
      hour: Number(row.hour),
      count: Number(row.count),
    }));
  }
  finally {
    await connection.close();
  }
}

const {
  AsyncDuckDB,
  AsyncDuckDBConnection,
  ConsoleLogger,
} = duckdb;

export {
  AsyncDuckDB,
  AsyncDuckDBConnection,
  ConsoleLogger,
};
