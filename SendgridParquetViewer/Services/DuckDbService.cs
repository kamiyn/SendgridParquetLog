using Dapper;

using DuckDB.NET.Data;

using Microsoft.Extensions.Options;

using SendgridParquetViewer.Models;
using SendgridParquetViewer.Options;

namespace SendgridParquetViewer.Services;

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

    private string GetS3Path(int? year = null, int? month = null, int? day = null)
    {
        var basePath = $"s3://{_s3Options.BucketName}/v1";

        if (year.HasValue)
        {
            basePath += $"/{year:D4}";
            if (month.HasValue)
            {
                basePath += $"/{month:D2}";
                if (day.HasValue)
                {
                    basePath += $"/{day:D2}";
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

    public async Task<IList<SendGridEvent>> GetEventsByDateAsync(int year, int month, int day)
    {
        try
        {
            using var connection = CreateConnection();
            var s3Path = GetS3Path(year, month, day);

            var sql = $@"
                SELECT {SendGridEvent.SelectColumns}
                FROM parquet_scan('{s3Path}')
                ORDER BY timestamp DESC";

            var events = await connection.QueryAsync<SendGridEvent>(sql);
            return events.ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error querying events by date: {Year}-{Month:D2}-{Day:D2}", year, month, day);
            throw;
        }
    }

    public async Task<IList<SendGridEvent>> GetEventsByMonthAsync(int year, int month, int limit = 1000)
    {
        try
        {
            using var connection = CreateConnection();
            var s3Path = GetS3Path(year, month);

            var sql = $@"
                SELECT {SendGridEvent.SelectColumns}
                FROM parquet_scan('{s3Path}')
                ORDER BY timestamp DESC
                LIMIT {limit}";

            var events = await connection.QueryAsync<SendGridEvent>(sql);
            return events.ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error querying events by month: {Year}-{Month:D2}", year, month);
            throw;
        }
    }

    public async Task<IList<SendGridEvent>> GetEventsByEmailAndMonthAsync(string email, int year, int month)
    {
        try
        {
            using var connection = CreateConnection();
            var s3Path = GetS3Path(year, month);

            var sql = $@"
                SELECT {SendGridEvent.SelectColumns}
                FROM parquet_scan('{s3Path}')
                WHERE email = @email
                ORDER BY timestamp DESC";

            var events = await connection.QueryAsync<SendGridEvent>(sql, new { email });
            return events.ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error querying events by email and month: {Email}, {Year}-{Month:D2}", email, year, month);
            throw;
        }
    }
}
