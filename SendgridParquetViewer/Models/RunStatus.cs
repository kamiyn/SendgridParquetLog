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

    public string DaysProgress() => $"{CompletedDays} / {TargetDays.Count}";

    [JsonPropertyName("currentDay")]
    public DateOnly? CurrentDay { get; set; }

    [JsonPropertyName("currentDayTotalFiles")]
    public int? CurrentDayTotalFiles { get; set; }

    [JsonPropertyName("currentDayProcessedFiles")]
    public int? CurrentDayProcessedFiles { get; set; }

    [JsonPropertyName("currentDayProcessedBytes")]
    public long? CurrentDayProcessedBytes { get; set; }

    [JsonPropertyName("lastProcessedFile")]
    public string? LastProcessedFile { get; set; }

    /// <summary>
    /// 読み込み失敗したファイルはすべて記録する
    /// </summary>
    [JsonPropertyName("failedOriginalFiles")]
    public List<string> FailedOriginalFiles { get; } = new();

    public string CurrentDayProgress() => $"{CurrentDayProcessedFiles} / {CurrentDayTotalFiles}";

    [JsonPropertyName("deletedOriginalFile")]
    public int DeletedOriginalFile { get; set; }

    [JsonPropertyName("outputFilesCreated")]
    public int OutputFilesCreated { get; set; }

    [JsonPropertyName("lastOutputFile")]
    public string? LastOutputFile { get; set; }

    [JsonPropertyName("failedOutputFiles")]
    public List<string> FailedOutputFiles { get; } = new();

    [JsonPropertyName("lastUpdated")]
    public DateTimeOffset LastUpdated { get; set; }

    [JsonIgnore]
    internal List<Exception> Errors { get; } = new();

    [JsonPropertyName("errorCount")]
    public int ErrorCount => Errors.Count;

    public DateTimeOffset GetLastActivityTimestamp() => LastUpdated == default ? StartTime : LastUpdated;
}
