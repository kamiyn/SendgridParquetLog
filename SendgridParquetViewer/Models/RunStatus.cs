using System.Text.Json.Serialization;

namespace SendgridParquetViewer.Models;

public class RunStatus
{
    [JsonPropertyName("lockId")]
    public string LockId { get; init; } = string.Empty;

    [JsonPropertyName("startTime")]
    public DateTimeOffset StartTime { get; init; }

    [JsonPropertyName("endTime")]
    public DateTimeOffset? EndTime { get; set; }

    [JsonPropertyName("targetDays")]
    public IList<DateOnly> TargetDays { get; init; } = [];

    [JsonPropertyName("targetPaths")]
    public IList<string> TargetPathPrefixes { get; init; } = [];
}
