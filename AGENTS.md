# AGENTS.md

プロンプトに書かれた内容、および、処理内容 を Markdown 形式 ./codinglog/Gpt<yyyyMMddHHmm>.md ファイルへ記録してください

プルリクエストメッセージ案を出力する際は VSCode extension でコピーしやすいよう ''' ''' で囲ってください

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

In Aspire environment, these are automatically configured to use local MinIO instance.

## S3 Storage Layout

- Raw webhook uploads land under `v3raw/YYYY/MM/DD/<Base64UrlHash>.parquet`. The hash is the SHA-256 of the Parquet payload, so duplicate retries overwrite.
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
