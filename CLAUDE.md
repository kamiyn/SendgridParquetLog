# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a .NET 10.0 application that receives SendGrid Event Webhooks and stores them as Parquet files in S3-compatible storage. The project uses .NET Aspire for local development orchestration.

## Architecture

### Solution Structure
- **SendgridParquetLogger**: Main web API project handling webhook reception, Parquet conversion, and S3 storage
- **SendgridParquetLog.AppHost**: .NET Aspire orchestrator for local development (manages MinIO, Redis, and API)
- **SendgridParquetLog.ServiceDefaults**: Shared Aspire service configurations

### Key Components
- **WebhookController**: Receives SendGrid events at `/webhook/sendgrid` and health checks at `/webhook/health`
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

In Aspire environment, these are automatically configured to use local MinIO instance.

## Important Notes

- Swagger/OpenAPI is only available in DEBUG builds (controlled by conditional compilation)
- The application automatically creates S3 bucket if it doesn't exist
- Parquet files are compatible with DuckDB for direct querying
- All timestamps are stored in UTC