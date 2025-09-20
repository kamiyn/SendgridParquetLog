const SELECT_COLUMNS = [
  "email AS Email",
  "timestamp AS Timestamp",
  "event AS Event",
  "category AS Category",
  "sg_event_id AS SgEventId",
  "sg_message_id AS SgMessageId",
  "sg_template_id AS SgTemplateId",
  "useragent AS UserAgent",
  "ip AS Ip",
  "url AS Url",
  "reason AS Reason",
  "status AS Status",
  "response AS Response",
  "attempt AS Attempt",
  "type AS Type",
  "bounce_classification AS BounceClassification",
  "asm_group_id AS AsmGroupId",
  "marketing_campaign_name AS MarketingCampaignName",
  "pool_id AS PoolId",
  "send_at AS SendAt"
].join(", ");

const INDEXED_DB_NAME = "sendgrid-parquet-cache";
const INDEXED_DB_VERSION = 1;
const INDEXED_DB_STORE = "files";

const state = {
  duckdb: null,
  db: null,
  connection: null,
  dbReady: null,
  worker: null,
  indexedDb: null,
  manifestCache: new Map(), // monthKey -> manifest
  dayFileMap: new Map(), // dayKey -> Set(fileKey)
  loadedFiles: new Map() // fileKey -> metadata
};

export async function initialize() {
  await ensureDuckDb();
  await ensureIndexedDb();
}

export async function ensureMonthPrepared(year, month) {
  await initialize();
  const manifest = await fetchManifest(year, month);
  const downloadedDays = await ensureMonthFiles(manifest);
  return {
    manifest,
    downloadedDays: Array.from(downloadedDays)
  };
}

export async function queryEvents(request) {
  await initialize();
  const { year, month, day, email, eventType, sgTemplateId, limit } = request ?? {};
  if (typeof year !== "number" || typeof month !== "number" || typeof day !== "number") {
    return [];
  }

  const dayKey = makeDayKey(year, month, day);
  const files = state.dayFileMap.get(dayKey);
  if (!files || files.size === 0) {
    return [];
  }

  const fileListSql = Array.from(files)
    .map(escapeSqlLiteral)
    .map(f => `'${f}'`)
    .join(", ");

  const conditions = [];
  const parameters = [];

  if (email && typeof email === "string" && email.trim().length > 0) {
    conditions.push("Email LIKE ?");
    parameters.push(email);
  }

  if (eventType && typeof eventType === "string" && eventType.trim().length > 0) {
    conditions.push("Event = ?");
    parameters.push(eventType);
  }

  if (sgTemplateId && typeof sgTemplateId === "string" && sgTemplateId.trim().length > 0) {
    conditions.push("SgTemplateId = ?");
    parameters.push(sgTemplateId);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const limitClause = typeof limit === "number" && Number.isFinite(limit) && limit > 0
    ? `LIMIT ${Math.trunc(limit)}`
    : "";

  const sql = `SELECT ${SELECT_COLUMNS} FROM parquet_scan([${fileListSql}]) ${whereClause} ORDER BY Timestamp DESC ${limitClause}`;
  const result = await state.connection.query(sql, parameters);
  const rows = result.toArray();
  result.close();
  return rows;
}

async function ensureDuckDb() {
  if (state.dbReady) {
    return state.dbReady;
  }

  state.dbReady = (async () => {
    if (state.connection) {
      return state.connection;
    }

    const duckdbModule = await import("/lib/duckdb-wasm/duckdb-browser.mjs");
    const bundleBase = "/lib/duckdb-wasm";
    const bundles = {
      mainModule: `${bundleBase}/duckdb-eh.wasm`,
      mainWorker: `${bundleBase}/duckdb-browser-eh.worker.js`,
    };
    const worker = new Worker(bundles.mainWorker, { type: "module" });
    const db = new duckdbModule.AsyncDuckDB(new duckdbModule.ConsoleLogger(), worker);

    try {
      await db.instantiate(bundles.mainModule);
    } catch (err) {
      worker.terminate();
      throw err;
    }

    const connection = await db.connect();

    state.duckdb = duckdbModule;
    state.db = db;
    state.connection = connection;
    state.worker = worker;
    return connection;
  })();

  return state.dbReady;
}

async function ensureIndexedDb() {
  if (state.indexedDb) {
    return state.indexedDb;
  }

  state.indexedDb = await new Promise((resolve, reject) => {
    const request = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(INDEXED_DB_STORE)) {
        db.createObjectStore(INDEXED_DB_STORE, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB open failed"));
  });

  return state.indexedDb;
}

async function fetchManifest(year, month) {
  const monthKey = makeMonthKey(year, month);
  if (state.manifestCache.has(monthKey)) {
    return state.manifestCache.get(monthKey);
  }

  const response = await fetch(`/api/parquet/month/${year}/${month}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load manifest ${year}-${month}: ${response.status}`);
  }
  const manifest = await response.json();
  state.manifestCache.set(monthKey, manifest);
  return manifest;
}

async function ensureMonthFiles(manifest) {
  const downloadedDays = new Set();
  if (!manifest || !Array.isArray(manifest.Days)) {
    return downloadedDays;
  }

  const year = manifest.Year;
  const month = manifest.Month;
  const monthKey = makeMonthKey(year, month);

  for (const dayEntry of manifest.Days) {
    if (!dayEntry || typeof dayEntry.Day !== "number" || !Array.isArray(dayEntry.Files)) {
      continue;
    }

    const dayKey = makeDayKey(year, month, dayEntry.Day);
    const filesForDay = [];

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
    }
  }

  return downloadedDays;
}

async function ensureFileBuffer(fileEntry, year, month, day) {
  const expectedHash = typeof fileEntry.Sha256Hash === "string" && fileEntry.Sha256Hash.length > 0
    ? fileEntry.Sha256Hash.toLowerCase()
    : null;

  const cached = await getCachedFile(fileEntry.Key);
  if (cached) {
    const cachedHash = typeof cached.hash === "string" ? cached.hash.toLowerCase() : null;
    if (expectedHash && cachedHash === expectedHash) {
      return new Uint8Array(cached.data);
    }

    const computed = await computeSha256Hex(cached.data);
    if (expectedHash && computed !== expectedHash) {
      await deleteCachedFile(fileEntry.Key);
    } else {
      if (cachedHash !== computed) {
        await storeFileRecord({ key: fileEntry.Key, hash: computed, data: cached.data });
      }
      return new Uint8Array(cached.data);
    }
  }

  const buffer = await downloadFile(fileEntry.Key);
  const computedHash = await computeSha256Hex(buffer);
  if (expectedHash && computedHash !== expectedHash) {
    throw new Error(`Hash mismatch for ${fileEntry.Key}`);
  }

  await storeFileRecord({ key: fileEntry.Key, hash: computedHash, data: buffer });
  return new Uint8Array(buffer);
}

async function downloadFile(key) {
  const response = await fetch(`/api/parquet/file?key=${encodeURIComponent(key)}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to download ${key}: ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  const headerHash = response.headers.get("x-parquet-sha256");
  if (headerHash) {
    const formattedHeaderHash = headerHash.toLowerCase();
    const computed = await computeSha256Hex(buffer);
    if (computed !== formattedHeaderHash) {
      throw new Error(`Hash mismatch for ${key} (header)`);
    }
  }

  return buffer;
}

async function registerFileBuffer(fileEntry, buffer, year, month, day) {
  const key = fileEntry.Key;
  if (!key) {
    return;
  }

  if (!state.db) {
    await ensureDuckDb();
  }

  if (!state.loadedFiles.has(key)) {
    await state.db.registerFileBuffer(key, buffer);
  }

  state.loadedFiles.set(key, {
    year,
    month,
    day,
    hour: fileEntry.Hour,
    hash: fileEntry.Sha256Hash
  });

  const dayKey = makeDayKey(year, month, day);
  if (!state.dayFileMap.has(dayKey)) {
    state.dayFileMap.set(dayKey, new Set());
  }
  state.dayFileMap.get(dayKey)?.add(key);
}

async function getCachedFile(key) {
  const db = await ensureIndexedDb();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction(INDEXED_DB_STORE, "readonly");
    const store = tx.objectStore(INDEXED_DB_STORE);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB get failed"));
  });
}

async function storeFileRecord(record) {
  const db = await ensureIndexedDb();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction(INDEXED_DB_STORE, "readwrite");
    const store = tx.objectStore(INDEXED_DB_STORE);
    const request = store.put(record);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("IndexedDB put failed"));
  });
}

async function deleteCachedFile(key) {
  const db = await ensureIndexedDb();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction(INDEXED_DB_STORE, "readwrite");
    const store = tx.objectStore(INDEXED_DB_STORE);
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("IndexedDB delete failed"));
  });
}

async function computeSha256Hex(buffer) {
  let arrayBuffer;
  if (buffer instanceof ArrayBuffer) {
    arrayBuffer = buffer;
  } else if (ArrayBuffer.isView(buffer)) {
    arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  } else {
    throw new Error("Unsupported buffer type for hashing");
  }
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

function makeMonthKey(year, month) {
  return `${pad(year, 4)}-${pad(month, 2)}`;
}

function makeDayKey(year, month, day) {
  return `${makeMonthKey(year, month)}-${pad(day, 2)}`;
}

function pad(value, length) {
  const num = typeof value === "number" ? value : parseInt(value, 10);
  return num.toString().padStart(length, "0");
}

function escapeSqlLiteral(value) {
  return value.replace(/'/g, "''");
}
