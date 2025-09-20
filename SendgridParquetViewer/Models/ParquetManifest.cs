using System;
using System.Collections.Generic;

namespace SendgridParquetViewer.Models;

public record ParquetFileManifest(
    string Key,
    int Day,
    int Hour,
    long? SizeBytes,
    DateTimeOffset? LastModified,
    string? Sha256Hash,
    string? ETag
);

public record ParquetDayManifest(int Day, IReadOnlyList<ParquetFileManifest> Files);

public record ParquetMonthManifest(int Year, int Month, IReadOnlyList<ParquetDayManifest> Days);
