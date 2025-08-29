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

    private DuckDBConnection CreateConnection()
    {
        try
        {
            // https://duckdb.net/docs/connection-string.html#in-memory-database
            var connection = new DuckDBConnection("DataSource = :memory:");
            connection.Open();
            // Install and load httpfs extension for S3 support
            using (var cmd = connection.CreateCommand())
            {
                cmd.CommandText = "INSTALL httpfs; LOAD httpfs;";
                cmd.ExecuteNonQuery();
            }
            using (var cmd = connection.CreateCommand())
            {
                var serviceUri = new Uri(_s3Options.ServiceUrl);
                cmd.CommandText = $@"
                    CREATE SECRET s3_secret (
                        TYPE S3,
                        KEY_ID '{_s3Options.AccessKey}',
                        SECRET '{_s3Options.SecretKey}',
                        ENDPOINT '{serviceUri.Host}:{serviceUri.Port}',
                        USE_SSL {(serviceUri.Scheme == "https").ToString().ToLower()},
                        URL_STYLE 'path'
                    );";
                cmd.ExecuteNonQuery();
            }

            return connection;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create DuckDB connection");
            throw;
        }
    }

    private string GetS3Path(YearMonthDayOptional ymd)
    {
        var basePath = $"s3://{_s3Options.BucketName}/{SendGridWebHookFields.ParquetSchemaVersion}";

        if (ymd.Year.HasValue)
        {
            basePath += $"/{ymd.Year:D4}";
            if (ymd.Month.HasValue)
            {
                basePath += $"/{ymd.Month:D2}";
                if (ymd.Day.HasValue)
                {
                    basePath += $"/{ymd.Day:D2}";
                }
                else
                {
                    basePath += "/*";
                }
            }
            else
            {
                basePath += "/*/*";
            }
        }
        else
        {
            basePath += "/*/*/*";
        }

        basePath += "/*";
        return basePath;
    }

    public async Task<IList<SendGridEvent>> GetEventsByDateAsync(YearMonthDayOptional ymd, string? email, int? limit)
    {
        try
        {
            using var connection = CreateConnection();
            var s3Path = GetS3Path(ymd);

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

            var events = await connection.QueryAsync<SendGridEvent>(sql);
            return events.ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error querying events by date: {Year}-{Month:D2}-{Day:D2}", ymd.Year, ymd.Month, ymd.Day);
            throw;
        }
    }
}
