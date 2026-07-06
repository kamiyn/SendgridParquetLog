# AGENTS.md

プロンプトに書かれた内容、および、処理内容 を Markdown 形式 ./codinglog/Gpt<yyyyMMddHHmm>.md ファイルへ記録してください

プルリクエストメッセージ案を出力する際は VSCode extension でコピーしやすいよう コード形式 で出力してください

## Important Notes

- do not use 'sudo' command
- なるべく immuntable なデータ構造を使うこと。関数内で生成されたデータは IReadOnlyList<T> で返すのが望ましい
- IReadOnlyList<T> を作る際に、事前に要素数がわかるなら　ToArray() を使って配列にする。List<T> は避ける
- foreach に渡すオブジェクトを生成するために 複数の集合を合成する場合には IEnumerable<T> を返すような ローカル関数 として実装してメモリ割り当てを避ける
- コード修正の最後に dotnet format を実行する
- razor ファイルはCSharpコードを分離せず single file にする

## Project Overview

This is a .NET 10.0 application that receives SendGrid Event Webhooks and stores them as Parquet files in S3-compatible storage. The project uses .NET Aspire for local development orchestration.

## Architecture

### Solution Structure
- **SendgridParquetLogger**: Main web API project handling webhook reception, Parquet conversion, and S3 storage
- **SendgridParquetLog.AppHost**: .NET Aspire orchestrator for local development (manages MinIO, Redis, and API)
- **SendgridParquetLog.ServiceDefaults**: Shared Aspire service configurations

### Key Components
- **WebhookController**: Receives SendGrid events at `/webhook/sendgrid` and health checks at `/health6QQl`
- **ParquetService**: Converts SendGrid events to Parquet format using Parquet.Net
- **S3StorageService**: Handles S3 operations using AWS SDK with options pattern configuration
- **S3Options**: Configuration model bound from environment variables or appsettings.json

### Data Flow
1. SendGrid POSTs webhook events to `/webhook/sendgrid`
2. Events are converted to Parquet format
3. Files are stored in S3 with path: `sendgrid-events/yyyy/MM/dd/events_*.parquet`
4. Stored files can be queried with DuckDB or similar tools

## Development Commands

### Build
```bash
dotnet build
```

### Run with .NET Aspire (Recommended for local development)
```bash
dotnet run --project SendgridParquetLog.AppHost
```
This starts:
- MinIO on ports 9000 (API) and 9001 (Console)
- Redis for caching
- The SendgridParquetLogger API
- Aspire Dashboard on http://localhost:15000

### Run standalone API
```bash
cd SendgridParquetLogger
dotnet run
```

### Docker
```bash
# Build and run with Docker Compose
docker-compose build
docker-compose up -d

# View logs
docker-compose logs -f
```

### Testing
```bash
# Test webhook endpoint
./test-webhook.sh

# Generate OpenAPI specification
./generate-openapi.sh
```

## Configuration

The application uses ASP.NET Core Options pattern with S3Options bound from configuration:
- Environment variables: `S3__ACCESSKEY`, `S3__SECRETKEY`, `S3__SERVICEURL`, `S3__REGION`, `S3__BUCKETNAME`
- Configuration section: `S3` in appsettings.json

Webhook signature verification requires configuration via Options:
- `SENDGRID__VERIFICATIONKEY`: PEM or Base64(SPKI) public key
- `SENDGRID__ALLOWEDSKEW`: Timestamp skew parsed by `TimeSpan.Parse` (default `00:05:00`)
- `SENDGRID__MAXBODYBYTES`: Request body limit in bytes (default `1048576`)

Compaction behavior is bound from the `Compaction` section (`CompactionOptions`), configurable via `Compaction__*` environment variables or appsettings.json. Notable keys:
- `Compaction__MaxBatchSizeBytes`: Max bytes read per batch (default `201326592` = 192MB)
- `Compaction__DeleteParallelism`: Parallelism for deleting originals after verification (default `8`)
- `Compaction__FailedReadRetentionDays`: Days that must elapse since the first read failure before an unreadable Parquet file may be deleted (default `3`). Read failures are recorded on the S3 object as `x-amz-meta-read-failure-first-utc` / `x-amz-meta-read-failure-count`. The graduated mechanism applies both to producer-side download exceptions (transport `IOException` / timeout while fetching the object) and to consumer-side Parquet parse failures (a corrupt body that downloads but fails during row-group decoding, e.g. `IndexOutOfRangeException`) — the persistent-failure cases that otherwise hang a day's compaction. A file that fails to parse is skipped without committing any partial data (the consumer buffers each file and only flushes on full-parse success), so the batch still completes for the other files.
- `Compaction__FailedReadDeleteThreshold`: Failure count that must be reached before an unreadable Parquet file may be deleted (default `3`). Deletion happens only when both the retention period and this count are satisfied. Exceptions to the graduated path: empty (0-byte) files are deleted immediately, while HTTP non-success **status codes** (e.g. 403/503, where a response was received) are only recorded and never counted toward deletion.

**Consumer memory footprint (per v3raw file):** to avoid committing partial data on a parse failure, the compaction consumer buffers one raw file's decoded events in memory (`Dictionary<long, List<SendGridEvent>>`) and only flushes on full-parse success. Rough guide for a typical file of ~768 KB original webhook JSON: that is ≈ 900 events (~0.87 KB JSON/event), which `ConvertToParquetAsync` writes as a **single row group** (its default is 10,000 rows) of ≈ 32 KB compressed Parquet on S3, and which decodes to **≈ 0.8–0.9 MB in memory** (≈ 1 KB/event, ~1.1× the original JSON; measured ~0.84 MB for 908 events). During the flush a per-hour `ToArray()` copy briefly adds up to roughly the same again. Because such files are a single row group, this is essentially unchanged from the previous per-row-group buffering — peak memory only grows beyond one file when a raw file exceeds one row group (> 10,000 events, i.e. far larger than a single 768 KB webhook batch). Only one file is buffered at a time (the consumer is single-reader). Raw file size is itself bounded by `SENDGRID__MAXBODYBYTES` (default 1 MB) at ingest.

In Aspire environment, these are automatically configured to use local MinIO instance.

## S3 Storage Layout

- Raw webhook uploads land under `v3raw/YYYY/MM/DD/<Base64UrlHash>.parquet`. The hash is the SHA-256 of the Parquet payload, so duplicate retries overwrite.
- **Write-side read-back verification:** before uploading a freshly generated raw Parquet, the webhook path (`WebhookHelper.WriteParquet`) reads it back with `ParquetService.CountReadableEventsAsync` (decodes every row group) and requires the readable event count to equal the number written. If decoding throws or the count mismatches, it does **not** store the object and returns `500`, so SendGrid retries instead of silently dropping the batch (writes are content-addressed, so retries are idempotent). This closes the gap where a Parquet that is corrupt at write time would return `2xx` and only surface much later as an undecodable file during compaction. Cost: one extra in-memory decode per webhook POST (bounded by the ≤ `SENDGRID__MAXBODYBYTES` batch size).
- Compacted hourly outputs are written to `v3compaction/YYYY/MM/DD/HH/<Base64UrlHash>.parquet`, sharing the same hashing scheme.
- `v3compaction/run.json` tracks the active compaction run status (start/end timestamps, progress), and `v3compaction/run.lock` holds the distributed lock metadata.
- Compaction only targets days up to the prior UTC day; once merged, the per-day folders under `v3raw` can be treated as source archives while queries should use the hourly compaction tree.

## Important Notes

- Swagger/OpenAPI is only available in DEBUG builds (controlled by conditional compilation)
- The application automatically creates S3 bucket if it doesn't exist
- Parquet files are compatible with DuckDB for direct querying
- All timestamps are stored in UnixTime (long)
- 保存時のファイル分割は JST 基準
- Webhook body size limit and timestamp skew are configurable via `SENDGRID__MAXBODYBYTES` and `SENDGRID__ALLOWEDSKEW`.
