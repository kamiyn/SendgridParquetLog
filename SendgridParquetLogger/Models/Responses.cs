using System;
using System.Text.Json.Serialization;

namespace SendgridParquetLogger.Models;

public sealed record HealthResponse(
    [property: JsonPropertyName("status")] string Status,
    [property: JsonPropertyName("timestamp")] DateTimeOffset Timestamp
);

public sealed record ErrorResponse(
    [property: JsonPropertyName("error")] string Error,
    [property: JsonPropertyName("code")] string Code
);

public sealed record ProcessOkResponse(
    [property: JsonPropertyName("count")] int Count,
    [property: JsonPropertyName("message")] string? Message
);

