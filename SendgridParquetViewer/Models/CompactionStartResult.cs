namespace SendgridParquetViewer.Models;

public class CompactionStartResult
{
    public Task? StartTask { get; init; }
    public DateTimeOffset? StartTime { get; init; }
    public string Reason { get; init; } = string.Empty;
}
