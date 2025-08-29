using SendgridParquet.Shared;

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

    public static readonly string SelectColumns = $@"
        {SendGridWebHookFields.Email} AS {nameof(Email)},
        {SendGridWebHookFields.Timestamp} AS {nameof(Timestamp)},
        {SendGridWebHookFields.Event} AS {nameof(Event)},
        {SendGridWebHookFields.Category} AS {nameof(Category)},
        {SendGridWebHookFields.SgEventId} AS {nameof(SgEventId)},
        {SendGridWebHookFields.SgMessageId} AS {nameof(SgMessageId)},
        {SendGridWebHookFields.SmtpIdParquetColumn} AS {nameof(SmtpId)},
        {SendGridWebHookFields.UserAgent} AS {nameof(UserAgent)},
        {SendGridWebHookFields.Ip} AS {nameof(Ip)},
        {SendGridWebHookFields.Url} AS {nameof(Url)},
        {SendGridWebHookFields.Reason} AS {nameof(Reason)},
        {SendGridWebHookFields.Status} AS {nameof(Status)},
        {SendGridWebHookFields.Response} AS {nameof(Response)},
        {SendGridWebHookFields.Tls} AS {nameof(Tls)},
        {SendGridWebHookFields.Attempt} AS {nameof(Attempt)},
        {SendGridWebHookFields.Type} AS {nameof(Type)},
        {SendGridWebHookFields.BounceClassification} AS {nameof(BounceClassification)},
        {SendGridWebHookFields.AsmGroupId} AS {nameof(AsmGroupId)},
        {SendGridWebHookFields.UniqueArgs} AS {nameof(UniqueArgs)},
        {SendGridWebHookFields.MarketingCampaignId} AS {nameof(MarketingCampaignId)},
        {SendGridWebHookFields.MarketingCampaignName} AS {nameof(MarketingCampaignName)},
        {SendGridWebHookFields.PoolNameParquetColumn} AS {nameof(PoolName)},
        {SendGridWebHookFields.PoolIdParquetColumn} AS {nameof(PoolId)},
        {SendGridWebHookFields.SendAt} AS {nameof(SendAt)}";
}
