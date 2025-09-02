using Dapper;

using DuckDB.NET.Data;

using Microsoft.Extensions.Options;

using SendgridParquet.Shared;

using SendgridParquetViewer.Models;
using SendgridParquetViewer.Options;

namespace SendgridParquetViewer.Services;

public record struct YearMonthDayOptional(int? Year, int? Month, int? Day);

public class DuckDbService
{
    private readonly S3Options _s3Options;
    private readonly ILogger<DuckDbService> _logger;

    public DuckDbService(IOptions<S3Options> s3Options, ILogger<DuckDbService> logger)
    {
        _s3Options = s3Options.Value;
        _logger = logger;
    }

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
            _logger.LogError(ex, "Failed to create DuckDB connection");
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

    public async ValueTask<IList<SendGridEvent>> GetEventsByDateAsync(YearMonthDayOptional ymd, string? email, int? limit, CancellationToken ct = default)
    {
        try
        {
            using var connection = await CreateConnection(ct);
            string nonCompactionFolder = SendGridPathUtility.GetS3NonCompactionFolder(ymd.Year, ymd.Month, ymd.Day);
            var s3Path = $"s3://{_s3Options.BUCKETNAME}/{nonCompactionFolder}/*";

            // 現時点では 日付が path として表現されているため WHERE 句での絞り込みは email のみ
            var emailFilter = !string.IsNullOrWhiteSpace(email)
                ? $"WHERE email LIKE '{email.Replace("'", "''") /* シングルクオートを除去して safe にする */}'"
                : string.Empty;

            var limitClause = limit.HasValue ? $"LIMIT {limit.Value}" : string.Empty;

            // 複数のParquetを読んだ後に timestamp で ORDER BY をかけている
            var sql = $@"
                SELECT {SendGridEvent.SelectColumns}
                FROM parquet_scan('{s3Path}')
                {emailFilter}
                ORDER BY timestamp DESC
                {limitClause}";

            var events = await connection.QueryAsync<SendGridEvent>(sql, ct);
            return events.ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error querying events by date: {Year}-{Month:D2}-{Day:D2}", ymd.Year, ymd.Month, ymd.Day);
            throw;
        }
    }
}
