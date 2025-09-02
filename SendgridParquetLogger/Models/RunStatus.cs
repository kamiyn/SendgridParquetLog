using System.Text.Json.Serialization;

namespace SendgridParquetLogger.Models;

public class RunStatus
{
    [JsonPropertyName("startTime")]
    public DateTimeOffset StartTime { get; set; }

    [JsonPropertyName("endTime")]
    public DateTimeOffset? EndTime { get; set; }

    [JsonPropertyName("processedDates")]
    public List<string> ProcessedDates { get; set; } = new();
}
