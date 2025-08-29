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
        email AS {nameof(Email)},
        timestamp AS {nameof(Timestamp)},
        event AS {nameof(Event)},
        category AS {nameof(Category)},
        sg_event_id AS {nameof(SgEventId)},
        sg_message_id AS {nameof(SgMessageId)},
        smtp_id AS {nameof(SmtpId)},
        useragent AS {nameof(UserAgent)},
        ip AS {nameof(Ip)},
        url AS {nameof(Url)},
        reason AS {nameof(Reason)},
        status AS {nameof(Status)},
        response AS {nameof(Response)},
        tls AS {nameof(Tls)},
        attempt AS {nameof(Attempt)},
        type AS {nameof(Type)},
        bounce_classification AS {nameof(BounceClassification)},
        asm_group_id AS {nameof(AsmGroupId)},
        unique_args AS {nameof(UniqueArgs)},
        marketing_campaign_id AS {nameof(MarketingCampaignId)},
        marketing_campaign_name AS {nameof(MarketingCampaignName)},
        pool_name AS {nameof(PoolName)},
        pool_id AS {nameof(PoolId)},
        send_at AS {nameof(SendAt)}";
}
