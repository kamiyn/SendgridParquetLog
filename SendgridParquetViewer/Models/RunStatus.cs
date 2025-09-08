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

    // Progress fields (optional for backward compatibility)
    [JsonPropertyName("completedDays")]
    public int CompletedDays { get; set; }

    [JsonPropertyName("currentDay")]
    public DateOnly? CurrentDay { get; set; }

    [JsonPropertyName("currentDayTotalFiles")]
    public int? CurrentDayTotalFiles { get; set; }

    [JsonPropertyName("currentDayProcessedFiles")]
    public int? CurrentDayProcessedFiles { get; set; }

    [JsonPropertyName("outputFilesCreated")]
    public int OutputFilesCreated { get; set; }

    [JsonPropertyName("lastUpdated")]
    public DateTimeOffset LastUpdated { get; set; }
}
