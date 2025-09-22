import Handlebars from 'handlebars';
import * as duckdb from '@duckdb/duckdb-wasm';

const { AsyncDuckDB, AsyncDuckDBConnection, ConsoleLogger } = duckdb;

const queryResultsTemplateSource = `{{#if hasColumns}}
    <table class="table table-striped table-hover table-sm align-middle">
        <thead>
            <tr>
                <th scope="col" class="text-nowrap">詳細</th>
                {{#each columns}}
                    <th scope="col" class="text-nowrap">{{this}}</th>
                {{/each}}
            </tr>
        </thead>
        <tbody>
            {{#if hasRows}}
                {{#each rows}}
                    <tr data-row-index="{{@index}}">
                        <td>
                            <button type="button" class="btn btn-link p-0" data-action="show-details" data-row-index="{{@index}}">表示</button>
                        </td>
                        {{#each values}}
                            <td class="text-nowrap">{{this}}</td>
                        {{/each}}
                    </tr>
                {{/each}}
            {{else}}
                <tr>
                    <td class="text-muted" colspan="{{totalColumns}}">検索結果がありません。</td>
                </tr>
            {{/if}}
        </tbody>
    </table>
{{else}}
    <div class="alert alert-info" role="status">表示する列がありません。</div>
{{/if}}`;

const queryResultsTemplate = Handlebars.compile(queryResultsTemplateSource.trim());

const state = {
    config: null,
    duckDbPromise: undefined,
    httpFsInitialized: false,
};

function normalizeBasePath(path) {
    if (!path) {
        return '/duckdb';
    }

    return path.endsWith('/') ? path.slice(0, -1) : path;
}

function ensureConfig(rawConfig) {
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
        mainWorker,
    };

    return state.config;
}

async function loadDuckDb(config) {
    if (state.duckDbPromise) {
        return state.duckDbPromise;
    }

    state.duckDbPromise = (async () => {
        const moduleLoaderPath = `${config.bundleBasePath}/${config.moduleLoader}`;
        const loader = await import(/* @vite-ignore */ moduleLoaderPath);
        const workerPath = `${config.bundleBasePath}/${config.mainWorker}`;
        const worker = new Worker(workerPath, { type: 'module' });
        const logger = new loader.ConsoleLogger();
        const db = new loader.AsyncDuckDB(logger, worker);
        const mainModuleUrl = `${config.bundleBasePath}/${config.mainModule}`;
        const pthreadWorkerUrl = config.pthreadWorker ? `${config.bundleBasePath}/${config.pthreadWorker}` : null;

        await db.instantiate(mainModuleUrl, pthreadWorkerUrl ?? undefined);
        return { loader, db, worker };
    })();

    return state.duckDbPromise;
}

async function ensureHttpFs(connection) {
    if (state.httpFsInitialized) {
        return;
    }

    try {
        await connection.query("INSTALL 'httpfs';");
    } catch (error) {
        const message = typeof error?.message === 'string' ? error.message : String(error ?? '');
        if (!message.includes('already installed')) {
            throw error;
        }
    }

    await connection.query("LOAD 'httpfs';");
    state.httpFsInitialized = true;
}

function toDisplayValue(value) {
    if (value === null || value === undefined) {
        return '';
    }

    if (typeof value === 'object') {
        try {
            return JSON.stringify(value);
        } catch (error) {
            return String(value);
        }
    }

    return String(value);
}

function resolveParquetUrl(parquetUrl) {
    if (!parquetUrl) {
        return parquetUrl;
    }

    if (parquetUrl.startsWith('http://') || parquetUrl.startsWith('https://')) {
        return parquetUrl;
    }

    const baseUrl = typeof window === 'object' && window.location
        ? window.location.origin
        : (globalThis.location?.origin ?? '');

    return new URL(parquetUrl, baseUrl).toString();
}

function ensureElement(element, name) {
    if (!element) {
        throw new Error(`${name} element is required.`);
    }

    return element;
}

function normalizeLikePattern(raw) {
    const trimmed = raw.trim();
    const hasWildcard = /[%_]/.test(trimmed);
    return hasWildcard ? trimmed : `%${trimmed}%`;
}

function escapeSqlLiteral(value) {
    return value.replace(/\\/g, '\\\\').replace(/'/g, "''");
}

function buildWhereClause(request) {
    const clauses = [];

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

function buildLimitClause(limit) {
    if (typeof limit !== 'number' || !Number.isFinite(limit)) {
        return '';
    }

    const normalized = Math.max(1, Math.min(Math.trunc(limit), 5000));
    return ` LIMIT ${normalized}`;
}

function renderQueryResultWithTemplate(targetElement, context, dotNetHelper) {
    targetElement.innerHTML = queryResultsTemplate(context);

    if (!dotNetHelper || typeof dotNetHelper.invokeMethodAsync !== 'function' || context.rowCount === 0) {
        return;
    }

    const buttons = targetElement.querySelectorAll('[data-action="show-details"]');
    buttons.forEach((button) => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const indexValue = button.dataset.rowIndex;
            const parsedIndex = typeof indexValue === 'string' ? Number.parseInt(indexValue, 10) : Number.NaN;

            if (Number.isNaN(parsedIndex)) {
                return;
            }

            dotNetHelper.invokeMethodAsync('ShowEventDetailsFromJs', parsedIndex).catch((error) => {
                console.warn('Failed to notify detail handler', error);
            });
        });
    });
}

function toExecuteRows(result, columns) {
    if (!Array.isArray(columns) || columns.length === 0) {
        return [];
    }

    const rows = result.toArray().map((row) => {
        const values = columns.map((column) => toDisplayValue(row[column]));
        return { values };
    });

    return rows;
}

function ensureRequest(request) {
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

    return {
        fileUrls: normalizedFileUrls,
        email: request.email ?? null,
        eventType: request.eventType ?? null,
        sgTemplateId: request.sgTemplateId ?? null,
        limit: typeof request.limit === 'number' ? request.limit : null,
        selectColumns: request.selectColumns ?? null,
    };
}

export async function initialize(rawConfig) {
    const config = ensureConfig(rawConfig);
    await loadDuckDb(config);
}

export async function queryEvents(rawConfig, rawRequest, targetElement, options) {
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
                .filter((name) => Boolean(name));

            const rows = toExecuteRows(result, columns);

            if (typeof result.close === 'function') {
                result.close();
            } else if (typeof result.release === 'function') {
                result.release();
            }

            const response = {
                columns,
                rows,
            };

            const context = {
                columns,
                rows,
                hasColumns: columns.length > 0,
                hasRows: rows.length > 0,
                columnCount: columns.length,
                rowCount: rows.length,
                totalColumns: columns.length + 1,
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

export function clearResults(targetElement) {
    if (!targetElement) {
        return;
    }

    targetElement.innerHTML = '';
}

export async function dispose() {
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
        state.config = null;
        state.httpFsInitialized = false;
    }
}

export { AsyncDuckDB, AsyncDuckDBConnection, ConsoleLogger };
export * from '@duckdb/duckdb-wasm';
