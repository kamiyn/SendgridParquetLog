using System.Text.Json.Serialization;

namespace SendgridParquetLogger.Models;

public class LockInfo
{
    [JsonPropertyName("lockId")]
    public string LockId { get; set; } = string.Empty;

    [JsonPropertyName("ownerId")]
    public string OwnerId { get; set; } = string.Empty;

    [JsonPropertyName("acquiredAt")]
    public DateTimeOffset AcquiredAt { get; set; }

    [JsonPropertyName("expiresAt")]
    public DateTimeOffset ExpiresAt { get; set; }

    [JsonPropertyName("hostName")]
    public string HostName { get; set; } = string.Empty;
}
