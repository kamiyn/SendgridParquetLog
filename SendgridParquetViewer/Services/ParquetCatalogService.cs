using System.Globalization;

using SendgridParquet.Shared;

using SendgridParquetViewer.Models;

using ZLogger;

namespace SendgridParquetViewer.Services;

public class ParquetCatalogService(
    ILogger<ParquetCatalogService> logger,
    S3StorageService s3StorageService)
{
    public async Task<ParquetMonthManifest> GetCompactionMonthManifestAsync(int year, int month, CancellationToken ct)
    {
        var prefix = SendGridPathUtility.GetS3CompactionPrefix(year, month, null, null);
        var objectKeys = (await s3StorageService.ListFilesAsync(prefix, ct)).ToArray();

        var bufferLength = objectKeys.Length;
        var entriesBuffer = new ParquetFileManifest[bufferLength];
        var entryCount = 0;

        foreach (string key in objectKeys)
        {
            if (!TryParseCompactionKey(key, out var parts))
            {
                logger.ZLogWarning($"Skipping unexpected compaction key format: {key}");
                continue;
            }

            if (parts.Year != year || parts.Month != month)
            {
                // Defensive: ignore other months if prefix listing returned them
                continue;
            }

            S3ObjectMetadata? metadata = await s3StorageService.GetObjectMetadataAsync(key, ct);
            if (metadata is null)
            {
                logger.ZLogWarning($"Metadata not found for compaction object: {key}");
                continue;
            }

            if (entryCount == entriesBuffer.Length)
            {
                var newSize = Math.Max(4, entriesBuffer.Length * 2);
                Array.Resize(ref entriesBuffer, newSize);
            }

            entriesBuffer[entryCount++] = new ParquetFileManifest(
                Key: key,
                Day: parts.Day,
                Hour: parts.Hour,
                SizeBytes: metadata.ContentLength,
                LastModified: metadata.LastModified,
                Sha256Hash: metadata.Sha256Hash,
                ETag: metadata.ETag
            );
        }

        var entries = entryCount == 0
            ? []
            : entriesBuffer.AsSpan(0, entryCount).ToArray();

        var grouped = entries
            .GroupBy(e => e.Day)
            .OrderBy(g => g.Key)
            .Select(g => new ParquetDayManifest(
                g.Key,
                g.OrderBy(e => e.Hour).ThenBy(e => e.Key, StringComparer.Ordinal).ToArray()))
            .ToArray();

        return new ParquetMonthManifest(year, month, grouped);
    }

    private static bool TryParseCompactionKey(string key, out (int Year, int Month, int Day, int Hour) parts)
    {
        parts = default;
        if (string.IsNullOrWhiteSpace(key))
        {
            return false;
        }

        var segments = key.Split('/', StringSplitOptions.RemoveEmptyEntries);
        if (segments.Length < 6)
        {
            return false;
        }

        if (!string.Equals(segments[0], "v3compaction", StringComparison.Ordinal))
        {
            return false;
        }

        if (!TryParseInt(segments[1], 4, out int year) ||
            !TryParseInt(segments[2], 2, out int month) ||
            !TryParseInt(segments[3], 2, out int day) ||
            !TryParseInt(segments[4], 2, out int hour))
        {
            return false;
        }

        parts = (year, month, day, hour);
        return true;
    }

    private static bool TryParseInt(string value, int expectedLength, out int result)
    {
        if (value.Length != expectedLength)
        {
            result = default;
            return false;
        }

        return int.TryParse(value, NumberStyles.None, CultureInfo.InvariantCulture, out result);
    }

    internal static bool IsValidCompactionObjectKey(string? key)
    {
        if (string.IsNullOrWhiteSpace(key))
        {
            return false;
        }

        if (!key.StartsWith("v3compaction/", StringComparison.Ordinal))
        {
            return false;
        }

        if (key.Contains("../", StringComparison.Ordinal) || key.Contains("..\\", StringComparison.Ordinal))
        {
            return false;
        }

        return true;
    }
}
