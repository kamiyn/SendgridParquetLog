using System.Text.Json.Serialization;

namespace SendgridParquetLogger.Models;

public class RunStatus
{
    [JsonPropertyName("startTime")]
    public DateTimeOffset StartTime { get; set; }

    [JsonPropertyName("endTime")]
    public DateTimeOffset? EndTime { get; set; }

    [JsonPropertyName("targetDays")]
    public IList<DateOnly> TargetDays { get; set; } = [];

    [JsonPropertyName("targetPaths")]
    public IList<string> TargetPaths { get; set; } = [];
}
