using System.Collections.Generic;

namespace SendgridParquetViewer.Models;

public sealed record TelemetryConfigDto(
    bool Enabled,
    string? Endpoint,
    string? Protocol,
    IReadOnlyDictionary<string, string> Headers,
    string? ServiceName
);
