using System.Text.Json.Serialization;

namespace SendgridParquetLogger.Models;

public class RunStatus
{
    [JsonPropertyName("startTime")]
    public DateTimeOffset StartTime { get; init; }

    [JsonPropertyName("endTime")]
    public DateTimeOffset? EndTime { get; set; }

    [JsonPropertyName("targetDays")]
    public IList<DateOnly> TargetDays { get; init; } = [];

    [JsonPropertyName("targetPaths")]
    public IList<string> TargetPaths { get; init; } = [];
}
