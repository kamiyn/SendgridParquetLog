namespace SendgridParquetViewer.Models;

public class SendGridEvent
{
    public string Email { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public string Event { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string? SgEventId { get; set; }
    public string? SgMessageId { get; set; }
    public string? SmtpId { get; set; }
    public string? UserAgent { get; set; }
    public string? Ip { get; set; }
    public string? Url { get; set; }
    public string? Reason { get; set; }
    public string? Status { get; set; }
    public string? Response { get; set; }
    public int? Tls { get; set; }
    public string? Attempt { get; set; }
    public string? Type { get; set; }
    public string? BounceClassification { get; set; }
    public int? AsmGroupId { get; set; }
    public string? UniqueArgs { get; set; }
    public int? MarketingCampaignId { get; set; }
    public string? MarketingCampaignName { get; set; }
    public string? PoolName { get; set; }
    public int? PoolId { get; set; }
    public DateTime? SendAt { get; set; }
}
