import {
  AsyncDuckDB,
  AsyncDuckDBConnection,
  ConsoleLogger,
} from '@duckdb/duckdb-wasm';

const BUNDLE = {
  mainModule: new URL('@duckdb/duckdb-wasm/dist/duckdb-eh.wasm', import.meta.url).toString(),
  mainWorker: new URL('@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js', import.meta.url),
  pthreadWorker: new URL('@duckdb/duckdb-wasm/dist/duckdb-browser-coi.pthread.worker.js', import.meta.url).toString(),
};

const SELECT_COLUMNS = [
  'email AS Email',
  'timestamp AS Timestamp',
  'event AS Event',
  'category AS Category',
  'sg_event_id AS SgEventId',
  'sg_message_id AS SgMessageId',
  'sg_template_id AS SgTemplateId',
  'useragent AS UserAgent',
  'ip AS Ip',
  'url AS Url',
  'reason AS Reason',
  'status AS Status',
  'response AS Response',
  'attempt AS Attempt',
  'type AS Type',
  'bounce_classification AS BounceClassification',
  'asm_group_id AS AsmGroupId',
  'marketing_campaign_name AS MarketingCampaignName',
  'pool_id AS PoolId',
  'send_at AS SendAt',
].join(', ');

const INDEXED_DB_NAME = 'sendgrid-parquet-cache';
const INDEXED_DB_VERSION = 1;
const INDEXED_DB_STORE = 'files';

interface ManifestFile {
  readonly Key: string;
  readonly Sha256Hash?: string | null;
  readonly Hour?: number | null;
}

interface ManifestDay {
  readonly Day: number;
  readonly Files: readonly ManifestFile[];
}

interface MonthManifest {
  readonly Year: number;
  readonly Month: number;
  readonly Days: readonly ManifestDay[];
}

interface FileRecord {
  readonly key: string;
  readonly hash: string;
  readonly data: ArrayBuffer;
}

interface StoredFileRecord {
  readonly key: string;
  readonly hash: string;
  readonly data: ArrayBuffer;
}

interface FileMetadata {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly hour?: number | null;
  readonly hash?: string | null;
}

type DuckDbConnectionPromise = Promise<AsyncDuckDBConnection>;

type DownloadStage =
  | 'download:init'
  | 'download:manifest-ready'
  | 'download:days:start'
  | 'download:day:start'
  | 'download:day:complete'
  | 'download:file:cache-hit'
  | 'download:file:cache-miss'
  | 'download:file:start'
  | 'download:file:success'
  | 'download:file:hash-mismatch'
  | 'download:error';

export interface DownloadProgressEvent {
  readonly stage: DownloadStage;
  readonly detail: Record<string, unknown>;
  readonly timestamp: string;
}

interface TelemetryConfig {
  readonly enabled: boolean;
  readonly endpoint?: string;
  readonly protocol?: string;
  readonly headers: Record<string, string>;
  readonly serviceName?: string;
}

type ProgressListener = (event: DownloadProgressEvent) => void;

let progressListener: ProgressListener | null = null;

export function setDownloadProgressListener(listener: ProgressListener | null): void {
  progressListener = listener;
}

let telemetryConfigPromise: Promise<TelemetryConfig | null> | null = null;

async function fetchTelemetryConfig(): Promise<TelemetryConfig | null> {
  if (!telemetryConfigPromise) {
    telemetryConfigPromise = (async () => {
      try {
        const response = await fetch('/api/telemetry/config', {
          credentials: 'include',
          cache: 'no-store',
        });
        if (!response.ok) {
          return null;
        }
        const json = await response.json() as Partial<TelemetryConfig> & { headers?: Record<string, string> };
        if (!json || !json.enabled || !json.endpoint) {
          return null;
        }
        return {
          enabled: true,
          endpoint: json.endpoint,
          protocol: json.protocol ?? 'http/protobuf',
          headers: json.headers ?? {},
          serviceName: json.serviceName ?? 'SendgridParquetViewer',
        } satisfies TelemetryConfig;
      } catch (error) {
        console.warn('[duckdb-download] telemetry config fetch failed', error);
        return null;
      }
    })();
  }

  return telemetryConfigPromise;
}

function emitProgress(stage: DownloadStage, detail: Record<string, unknown>): void {
  const event: DownloadProgressEvent = {
    stage,
    detail,
    timestamp: new Date().toISOString(),
  };

  try {
    console.info('[duckdb-download]', event);
  } catch {
    /* ignore */
  }

  if (progressListener) {
    try {
      progressListener(event);
    } catch (error) {
      console.warn('[duckdb-download] progress listener error', error);
    }
  }

  void sendTelemetry(event);
}

async function sendTelemetry(event: DownloadProgressEvent): Promise<void> {
  const config = await fetchTelemetryConfig();
  if (!config?.enabled || !config.endpoint) {
    return;
  }

  let protocol = config.protocol?.toLowerCase();
  if (protocol === 'grpc') {
    console.warn('[duckdb-download] grpc protocol not supported in browsers; falling back to http/protobuf');
    protocol = 'http/protobuf';
  }

  let target = config.endpoint.trim();
  if (!target.endsWith('/v1/logs')) {
    target = `${target.replace(/\/$/,'')}/v1/logs`;
  }

  const timeUnixNano = `${Date.now()}000000`;
  const attributes = [
    {
      key: 'download.stage',
      value: { stringValue: event.stage },
    },
  ];

  const body = {
    resourceLogs: [
      {
        resource: {
          attributes: [
            {
              key: 'service.name',
              value: { stringValue: config.serviceName ?? 'SendgridParquetViewer' },
            },
          ],
        },
        scopeLogs: [
          {
            scope: {
              name: 'duckdbInterop',
              version: '1.0.0',
            },
            logRecords: [
              {
                timeUnixNano,
                severityText: 'INFO',
                body: { stringValue: JSON.stringify(event) },
                attributes,
              },
            ],
          },
        ],
      },
    ],
  };

  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };

  for (const [key, value] of Object.entries(config.headers)) {
    headers[key] = value;
  }

  try {
    await fetch(target, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      keepalive: true,
    });
  } catch (error) {
    console.warn('[duckdb-download] telemetry send failed', error);
  }
}

const state: {
  db: AsyncDuckDB | null;
  connection: AsyncDuckDBConnection | null;
  dbReady: DuckDbConnectionPromise | null;
  worker: Worker | null;
  indexedDb: IDBDatabase | null;
  manifestCache: Map<string, MonthManifest>;
  dayFileMap: Map<string, Set<string>>;
  loadedFiles: Map<string, FileMetadata>;
} = {
  db: null,
  connection: null,
  dbReady: null,
  worker: null,
  indexedDb: null,
  manifestCache: new Map(),
  dayFileMap: new Map(),
  loadedFiles: new Map(),
};

export async function initialize(): Promise<void> {
  await ensureDuckDb();
  await ensureIndexedDb();
}

export async function ensureMonthPrepared(year: number, month: number): Promise<{
  manifest: MonthManifest;
  downloadedDays: number[];
}> {
  await initialize();
  emitProgress('download:init', { year, month });
  const manifest = await fetchManifest(year, month);
  emitProgress('download:manifest-ready', {
    year,
    month,
    days: manifest.Days?.length ?? 0,
  });
  const downloadedDays = await ensureMonthFiles(manifest);
  return {
    manifest,
    downloadedDays: Array.from(downloadedDays).sort((a, b) => a - b),
  };
}

interface QueryEventsRequest {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly email?: string;
  readonly eventType?: string;
  readonly sgTemplateId?: string;
  readonly limit?: number;
}

export async function queryEvents(request: QueryEventsRequest): Promise<unknown[]> {
  await initialize();
  const { year, month, day, email, eventType, sgTemplateId, limit } = request ?? {} as QueryEventsRequest;
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return [];
  }

  const dayKey = makeDayKey(year, month, day);
  const files = state.dayFileMap.get(dayKey);
  if (!files || files.size === 0) {
    return [];
  }

  const fileListSql = Array.from(files)
    .map(escapeSqlLiteral)
    .map((f) => `'${f}'`)
    .join(', ');

  const conditions: string[] = [];
  const parameters: string[] = [];

  if (email && email.trim().length > 0) {
    conditions.push('Email LIKE ?');
    parameters.push(email);
  }

  if (eventType && eventType.trim().length > 0) {
    conditions.push('Event = ?');
    parameters.push(eventType);
  }

  if (sgTemplateId && sgTemplateId.trim().length > 0) {
    conditions.push('SgTemplateId = ?');
    parameters.push(sgTemplateId);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limitClause = Number.isFinite(limit) && (limit ?? 0) > 0
    ? `LIMIT ${Math.trunc(limit ?? 0)}`
    : '';

  const sql = `SELECT ${SELECT_COLUMNS} FROM parquet_scan([${fileListSql}]) ${whereClause} ORDER BY Timestamp DESC ${limitClause}`;
  const connection = await ensureDuckDb();
  const result = await connection.query(sql, parameters);
  const rows = result.toArray();
  result.close();
  return rows;
}

async function ensureDuckDb(): Promise<AsyncDuckDBConnection> {
  if (state.dbReady) {
    return state.dbReady;
  }

  state.dbReady = (async () => {
    if (state.connection) {
      return state.connection;
    }

    const worker = new Worker(BUNDLE.mainWorker, { type: 'module' });
    const db = new AsyncDuckDB(new ConsoleLogger(), worker);

    try {
      await db.instantiate(BUNDLE.mainModule, BUNDLE.pthreadWorker);
    } catch (error) {
      worker.terminate();
      throw error;
    }

    const connection = await db.connect();
    state.db = db;
    state.connection = connection;
    state.worker = worker;
    return connection;
  })();

  return state.dbReady;
}

async function ensureIndexedDb(): Promise<IDBDatabase> {
  if (state.indexedDb) {
    return state.indexedDb;
  }

  state.indexedDb = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(INDEXED_DB_STORE)) {
        db.createObjectStore(INDEXED_DB_STORE, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB open failed'));
  });

  return state.indexedDb;
}

async function fetchManifest(year: number, month: number): Promise<MonthManifest> {
  const monthKey = makeMonthKey(year, month);
  const cached = state.manifestCache.get(monthKey);
  if (cached) {
    return cached;
  }

  const response = await fetch(`/api/parquet/month/${year}/${month}`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to load manifest ${year}-${month}: ${response.status}`);
  }
  const manifest = await response.json() as MonthManifest;
  state.manifestCache.set(monthKey, manifest);
  return manifest;
}

async function ensureMonthFiles(manifest: MonthManifest | null | undefined): Promise<Set<number>> {
  const downloadedDays = new Set<number>();
  if (!manifest?.Days) {
    return downloadedDays;
  }

  const year = manifest.Year;
  const month = manifest.Month;
  emitProgress('download:days:start', {
    year,
    month,
    days: manifest.Days.length,
  });

  for (const dayEntry of manifest.Days) {
    if (!dayEntry || typeof dayEntry.Day !== 'number' || !Array.isArray(dayEntry.Files)) {
      continue;
    }

    const dayKey = makeDayKey(year, month, dayEntry.Day);
    const filesForDay: string[] = [];
    emitProgress('download:day:start', {
      year,
      month,
      day: dayEntry.Day,
      fileCount: dayEntry.Files.length,
    });

    for (const fileEntry of dayEntry.Files) {
      if (!fileEntry?.Key) {
        continue;
      }

      const fileBuffer = await ensureFileBuffer(fileEntry, year, month, dayEntry.Day);
      await registerFileBuffer(fileEntry, fileBuffer, year, month, dayEntry.Day);
      filesForDay.push(fileEntry.Key);
    }

    if (filesForDay.length > 0) {
      state.dayFileMap.set(dayKey, new Set(filesForDay));
      downloadedDays.add(dayEntry.Day);
      emitProgress('download:day:complete', {
        year,
        month,
        day: dayEntry.Day,
        files: filesForDay.length,
      });
    }
  }

  return downloadedDays;
}

async function ensureFileBuffer(fileEntry: ManifestFile, year: number, month: number, day: number): Promise<Uint8Array> {
  const expectedHash = fileEntry.Sha256Hash?.toLowerCase() ?? null;
  const cached = await getCachedFile(fileEntry.Key);
  if (cached) {
    const cachedHash = cached.hash?.toLowerCase() ?? null;
    if (expectedHash && cachedHash === expectedHash) {
      emitProgress('download:file:cache-hit', { key: fileEntry.Key, year, month, day, source: 'match' });
      return new Uint8Array(cached.data);
    }

    const computed = await computeSha256Hex(cached.data);
    if (expectedHash && computed !== expectedHash) {
      await deleteCachedFile(fileEntry.Key);
    } else {
      if (cachedHash !== computed) {
        await storeFileRecord({ key: fileEntry.Key, hash: computed, data: cached.data });
      }
      emitProgress('download:file:cache-hit', { key: fileEntry.Key, year, month, day, hashMismatchResolved: cachedHash !== computed });
      return new Uint8Array(cached.data);
    }
  }

  emitProgress('download:file:cache-miss', { key: fileEntry.Key, year, month, day });
  const buffer = await downloadFile(fileEntry.Key, year, month, day);
  const computedHash = await computeSha256Hex(buffer);
  if (expectedHash && computedHash !== expectedHash) {
    emitProgress('download:file:hash-mismatch', { key: fileEntry.Key, year, month, day, expectedHash, computedHash });
    throw new Error(`Hash mismatch for ${fileEntry.Key}`);
  }

  await storeFileRecord({ key: fileEntry.Key, hash: computedHash, data: buffer });
  return new Uint8Array(buffer);
}

async function downloadFile(key: string, year: number, month: number, day: number): Promise<ArrayBuffer> {
  emitProgress('download:file:start', { key, year, month, day });
  let response: Response;
  try {
    response = await fetch(`/api/parquet/file?key=${encodeURIComponent(key)}`, { cache: 'no-store' });
  } catch (error) {
    emitProgress('download:error', { stage: 'download:file:start', key, year, month, day, message: (error as Error).message });
    throw error;
  }
  if (!response.ok) {
    emitProgress('download:error', { stage: 'download:file:start', key, year, month, day, status: response.status });
    throw new Error(`Failed to download ${key}: ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  const headerHash = response.headers.get('x-parquet-sha256');
  if (headerHash) {
    const formattedHeaderHash = headerHash.toLowerCase();
    const computed = await computeSha256Hex(buffer);
    if (computed !== formattedHeaderHash) {
      emitProgress('download:file:hash-mismatch', { key, year, month, day, expectedHash: formattedHeaderHash, computedHash: computed, source: 'header' });
      throw new Error(`Hash mismatch for ${key} (header)`);
    }
  }

  emitProgress('download:file:success', { key, year, month, day, source: 'network' });
  return buffer;
}

async function registerFileBuffer(fileEntry: ManifestFile, buffer: Uint8Array, year: number, month: number, day: number): Promise<void> {
  const key = fileEntry.Key;
  if (!key) {
    return;
  }

  if (!state.db) {
    await ensureDuckDb();
  }

  if (!state.loadedFiles.has(key)) {
    await state.db?.registerFileBuffer(key, buffer);
  }

  state.loadedFiles.set(key, {
    year,
    month,
    day,
    hour: fileEntry.Hour,
    hash: fileEntry.Sha256Hash ?? null,
  });

  const dayKey = makeDayKey(year, month, day);
  if (!state.dayFileMap.has(dayKey)) {
    state.dayFileMap.set(dayKey, new Set());
  }
  state.dayFileMap.get(dayKey)?.add(key);
}

async function getCachedFile(key: string): Promise<StoredFileRecord | null> {
  const db = await ensureIndexedDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(INDEXED_DB_STORE, 'readonly');
    const store = tx.objectStore(INDEXED_DB_STORE);
    const request = store.get(key);
    request.onsuccess = () => resolve((request.result as StoredFileRecord | null) ?? null);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB get failed'));
  });
}

async function storeFileRecord(record: FileRecord): Promise<void> {
  const db = await ensureIndexedDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(INDEXED_DB_STORE, 'readwrite');
    const store = tx.objectStore(INDEXED_DB_STORE);
    const request = store.put(record);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error('IndexedDB put failed'));
  });
}

async function deleteCachedFile(key: string): Promise<void> {
  const db = await ensureIndexedDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(INDEXED_DB_STORE, 'readwrite');
    const store = tx.objectStore(INDEXED_DB_STORE);
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error('IndexedDB delete failed'));
  });
}

async function computeSha256Hex(buffer: ArrayBuffer | ArrayBufferView): Promise<string> {
  let arrayBuffer: ArrayBuffer;
  if (buffer instanceof ArrayBuffer) {
    arrayBuffer = buffer;
  } else if (ArrayBuffer.isView(buffer)) {
    arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  } else {
    throw new Error('Unsupported buffer type for hashing');
  }
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function makeMonthKey(year: number, month: number): string {
  return `${pad(year, 4)}-${pad(month, 2)}`;
}

function makeDayKey(year: number, month: number, day: number): string {
  return `${makeMonthKey(year, month)}-${pad(day, 2)}`;
}

function pad(value: number, length: number): string {
  return Math.trunc(value).toString().padStart(length, '0');
}

function escapeSqlLiteral(value: string): string {
  return value.replace(/'/g, "''");
}
