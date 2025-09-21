import { AsyncDuckDB, ConsoleLogger } from '@duckdb/duckdb-wasm';

const state = {
    config: null,
    duckDbPromise: null,
    registeredFiles: new Set(),
};

function normalizeBasePath(path) {
    if (!path) {
        return '/lib/duckdb-wasm';
    }

    return path.endsWith('/') ? path.slice(0, -1) : path;
}

function ensureConfig(rawConfig) {
    if (!rawConfig) {
        throw new Error('DuckDB configuration is required.');
    }

    if (state.config) {
        return state.config;
    }

    const bundleBasePath = normalizeBasePath(rawConfig.bundleBasePath ?? rawConfig.BundleBasePath ?? '/lib/duckdb-wasm');
    const moduleLoader = rawConfig.moduleLoader ?? rawConfig.ModuleLoader ?? 'duckdb-browser-bundle.js';
    const mainModule = rawConfig.mainModule ?? rawConfig.MainModule ?? 'duckdb-eh.wasm';
    const pthreadWorker = rawConfig.pthreadWorker ?? rawConfig.PthreadWorker ?? 'duckdb-browser-coi.pthread.worker.js';
    const mainWorker = rawConfig.mainWorker ?? rawConfig.MainWorker ?? 'duckdb-browser-eh.worker.js';

    state.config = {
        bundleBasePath,
        moduleLoader,
        mainModule,
        pthreadWorker: pthreadWorker || null,
        mainWorker,
    };

    return state.config;
}

function resolveAsset(path, fileName) {
    return `${path}/${fileName}`;
}

async function loadDuckDb() {
    if (!state.config) {
        throw new Error('Call initialize before using DuckDB.');
    }

    if (!state.duckDbPromise) {
        state.duckDbPromise = (async () => {
            const workerUrl = resolveAsset(state.config.bundleBasePath, state.config.mainWorker);
            const worker = new Worker(workerUrl, { type: 'module' });
            const logger = new ConsoleLogger();
            const db = new AsyncDuckDB(logger, worker);
            const mainModuleUrl = resolveAsset(state.config.bundleBasePath, state.config.mainModule);
            const pthreadWorkerUrl = state.config.pthreadWorker
                ? resolveAsset(state.config.bundleBasePath, state.config.pthreadWorker)
                : undefined;

            await db.instantiate(mainModuleUrl, pthreadWorkerUrl);
            return { db, worker };
        })();
    }

    return state.duckDbPromise;
}

function toVirtualPath(key) {
    return `parquet/${key}`;
}

async function ensureFilesRegistered(db, fileKeys) {
    if (!Array.isArray(fileKeys) || fileKeys.length === 0) {
        return [];
    }

    const uniqueKeys = new Set();
    const normalizedKeys = [];

    for (const key of fileKeys) {
        if (typeof key !== 'string') {
            continue;
        }

        const trimmed = key.trim();
        if (trimmed.length === 0 || uniqueKeys.has(trimmed)) {
            continue;
        }

        uniqueKeys.add(trimmed);
        normalizedKeys.push(trimmed);
    }

    if (normalizedKeys.length === 0) {
        return [];
    }

    const virtualPaths = [];

    for (const key of normalizedKeys) {
        const virtualPath = toVirtualPath(key);
        if (!state.registeredFiles.has(virtualPath)) {
            const response = await fetch(`api/parquet/file?key=${encodeURIComponent(key)}`);
            if (!response.ok) {
                throw new Error(`Failed to download parquet file (${response.status})`);
            }

            const buffer = new Uint8Array(await response.arrayBuffer());
            await db.registerFileBuffer(virtualPath, buffer);
            state.registeredFiles.add(virtualPath);
        }

        virtualPaths.push(virtualPath);
    }

    return virtualPaths;
}

function escapePathLiteral(path) {
    return path.replace(/'/g, "''");
}

function buildReadParquetArguments(paths) {
    return paths.map((path) => `'${escapePathLiteral(path)}'`).join(', ');
}

function escapeSqlLiteral(value) {
    return value.replace(/\\/g, '\\\\').replace(/'/g, "''");
}

function normalizeLikePattern(raw) {
    const trimmed = raw.trim();
    const hasWildcard = /[%_]/.test(trimmed);
    return hasWildcard ? trimmed : `%${trimmed}%`;
}

function normalizeValue(value) {
    if (value === undefined || value === null) {
        return null;
    }

    if (typeof value === 'bigint') {
        return Number(value);
    }

    if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
        return JSON.stringify(value);
    }

    return value;
}

function normalizeRow(row, columns) {
    const result = {};
    for (const column of columns) {
        result[column] = normalizeValue(row[column]);
    }

    return result;
}

function extractString(source, primary, fallback) {
    const value = source?.[primary] ?? source?.[fallback];
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function extractNumber(source, primary, fallback) {
    const raw = source?.[primary] ?? source?.[fallback];
    if (typeof raw === 'number' && Number.isFinite(raw)) {
        return raw;
    }

    if (typeof raw === 'string' && raw.length > 0) {
        const parsed = Number.parseInt(raw, 10);
        return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
}

function extractFileKeys(request) {
    const keys = request?.FileKeys ?? request?.fileKeys;
    if (!Array.isArray(keys)) {
        return [];
    }

    return keys;
}

export async function initialize(rawConfig) {
    ensureConfig(rawConfig);
    await loadDuckDb();
}

export async function queryEvents(request) {
    if (!request) {
        throw new Error('A query request is required.');
    }

    ensureConfig(state.config ?? {});
    const duck = await loadDuckDb();

    const fileKeys = extractFileKeys(request);
    if (fileKeys.length === 0) {
        return [];
    }

    const paths = await ensureFilesRegistered(duck.db, fileKeys);
    if (paths.length === 0) {
        return [];
    }

    const selectColumns = request?.SelectColumns ?? request?.selectColumns ?? '*';
    const clauses = [];

    const email = extractString(request, 'Email', 'email');
    if (email) {
        const pattern = normalizeLikePattern(email);
        clauses.push(`email ILIKE '${escapeSqlLiteral(pattern)}' ESCAPE '\\'`);
    }

    const eventType = extractString(request, 'EventType', 'eventType');
    if (eventType) {
        clauses.push(`event = '${escapeSqlLiteral(eventType)}'`);
    }

    const templateId = extractString(request, 'SgTemplateId', 'sgTemplateId');
    if (templateId) {
        clauses.push(`sg_template_id = '${escapeSqlLiteral(templateId)}'`);
    }

    const limitValue = extractNumber(request, 'Limit', 'limit');
    const limitClause = limitValue && limitValue > 0 ? ` LIMIT ${Math.min(limitValue, 5000)}` : '';

    const whereClause = clauses.length > 0 ? ` WHERE ${clauses.join(' AND ')}` : '';
    const readArguments = buildReadParquetArguments(paths);
    const sql = `SELECT ${selectColumns} FROM read_parquet(${readArguments}, union_by_name=true)${whereClause} ORDER BY Timestamp DESC${limitClause}`;

    const connection = await duck.db.connect();

    try {
        const result = await connection.query(sql);
        const columns = Array.isArray(result?.schema?.fields)
            ? result.schema.fields.map((field) => field?.name).filter((name) => typeof name === 'string' && name.length > 0)
            : [];
        const rows = result.toArray().map((row) => normalizeRow(row, columns));

        if (typeof result.close === 'function') {
            result.close();
        } else if (typeof result.release === 'function') {
            result.release();
        }

        return rows;
    } finally {
        await connection.close();
    }
}

export async function dispose() {
    if (!state.duckDbPromise) {
        return;
    }

    try {
        const instance = await state.duckDbPromise;
        await instance.db.terminate();
        instance.worker.terminate();
    } finally {
        state.duckDbPromise = null;
        state.registeredFiles.clear();
    }
}

export function __getInternalState() {
    return state;
}
