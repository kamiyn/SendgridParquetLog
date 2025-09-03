using Dapper;

using DuckDB.NET.Data;

using Microsoft.Extensions.Options;

using SendgridParquet.Shared;

using SendgridParquetViewer.Models;

using ZLogger;

namespace SendgridParquetViewer.Services;

public class DuckDbService(IOptions<S3Options> s3Options, ILogger<DuckDbService> logger)
{
    private readonly S3Options _s3Options = s3Options.Value;

    private async ValueTask<DuckDBConnection> CreateConnection(CancellationToken ct)
    {
        try
        {
            // https://duckdb.net/docs/connection-string.html#in-memory-database
            var connection = new DuckDBConnection("DataSource = :memory:");
            await connection.OpenAsync(ct);
            // Install and load httpfs extension for S3 support
            await using (var cmd = connection.CreateCommand())
            {
                cmd.CommandText = "INSTALL httpfs; LOAD httpfs;";
                await cmd.ExecuteNonQueryAsync(ct);
            }
            await using (var cmd = connection.CreateCommand())
            {
                cmd.CommandText = GetCreateSecretSql();
                await cmd.ExecuteNonQueryAsync(ct);
            }
            return connection;
        }
        catch (Exception ex)
        {
            logger.ZLogError(ex, $"Failed to create DuckDB connection");
            throw;
        }
    }

    /// <summary>
    /// DuckDB S3 API Support
    /// https://duckdb.org/docs/stable/core_extensions/httpfs/s3api.html
    /// </summary>
    /// <returns></returns>
    private string GetCreateSecretSql()
    {
        // Escape single quotes in credentials to avoid breaking SQL string literal
        var accessKeyEsc = _s3Options.ACCESSKEY.Replace("'", "''");
        var secretKeyEsc = _s3Options.SECRETKEY.Replace("'", "''");
        var regionEsc = _s3Options.REGION.Replace("'", "''");

        var serviceUri = new Uri(_s3Options.SERVICEURL);
        string endpoint = serviceUri is { IsDefaultPort: false, Port: > 0 }
            ? $"{serviceUri.Host}:{serviceUri.Port}"
            : serviceUri.Host;

        if (serviceUri.IsLoopback)
        {
            // URL style: use 'path' for localhost (MinIO dev), otherwise prefer 'virtual'
            return $@"
CREATE SECRET minio (
    TYPE S3,
    KEY_ID '{accessKeyEsc}',
    SECRET '{secretKeyEsc}',
    ENDPOINT '{endpoint}',
    REGION '{regionEsc}',
    USE_SSL {(serviceUri.Scheme == "https").ToString().ToLower()},
    URL_STYLE 'path'
);";
        }
        return $@"
CREATE SECRET s3_secret (
    TYPE S3,
    PROVIDER config,
    KEY_ID '{accessKeyEsc}',
    SECRET '{secretKeyEsc}',
    ENDPOINT '{endpoint}',
    REGION '{regionEsc}'
);";
    }

    public async ValueTask<IList<SendGridEventParquet>> GetEventsByDateAsync(string folder, SendGridSearchCondition condition, int? limit,
        CancellationToken ct = default)
    {
        try
        {
            using var connection = await CreateConnection(ct);
            var s3Path = $"s3://{_s3Options.BUCKETNAME}/{folder}/*";
            var whereClause = condition.BuildWhereClause();
            var limitClause = limit.HasValue ? $"LIMIT {limit.Value}" : string.Empty;

            // 複数のParquetを読んだ後に timestamp で ORDER BY をかけている
            var sql = $@"
                SELECT {SendGridEventParquet.SelectColumns}
                FROM parquet_scan('{s3Path}')
                {whereClause}
                ORDER BY timestamp DESC
                {limitClause}";

            var events = await connection.QueryAsync<SendGridEventParquet>(sql, ct);
            return events.ToList();
        }
        catch (Exception ex)
        {
            logger.ZLogError(ex, $"Error querying events by {folder}");
            throw;
        }
    }
}
