using System;
using System.Collections.Generic;

namespace SendgridParquetViewer.Models;

public sealed record ParquetFileManifest(
    string Key,
    int Day,
    int Hour,
    long? SizeBytes,
    DateTimeOffset? LastModified,
    string? Sha256Hash,
    string? ETag
);

public sealed record ParquetDayManifest(int Day, IReadOnlyList<ParquetFileManifest> Files);

public sealed record ParquetMonthManifest(int Year, int Month, IReadOnlyList<ParquetDayManifest> Days);
