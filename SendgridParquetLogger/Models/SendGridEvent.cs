using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace SendgridParquetLogger.Models;

public class SendGridEvent
{
    [JsonPropertyName("email")]
    public string? Email { get; set; }

    [JsonPropertyName("timestamp")]
    public long Timestamp { get; set; }

    [JsonPropertyName("event")]
    public string? Event { get; set; }

    [JsonPropertyName("category")]
    public string? Category { get; set; }

    [JsonPropertyName("sg_event_id")]
    public string? SgEventId { get; set; }

    [JsonPropertyName("sg_message_id")]
    public string? SgMessageId { get; set; }

    [JsonPropertyName("smtp-id")]
    public string? SmtpId { get; set; }

    [JsonPropertyName("useragent")]
    public string? UserAgent { get; set; }

    [JsonPropertyName("ip")]
    public string? Ip { get; set; }

    [JsonPropertyName("url")]
    public string? Url { get; set; }

    [JsonPropertyName("reason")]
    public string? Reason { get; set; }

    [JsonPropertyName("status")]
    public string? Status { get; set; }

    [JsonPropertyName("response")]
    public string? Response { get; set; }

    [JsonPropertyName("tls")]
    public int? Tls { get; set; }

    [JsonPropertyName("attempt")]
    public string? Attempt { get; set; }

    [JsonPropertyName("type")]
    public string? Type { get; set; }

    [JsonPropertyName("bounce_classification")]
    public string? BounceClassification { get; set; }

    [JsonPropertyName("asm_group_id")]
    public int? AsmGroupId { get; set; }

    [JsonPropertyName("unique_args")]
    public Dictionary<string, object>? UniqueArgs { get; set; }

    [JsonPropertyName("marketing_campaign_id")]
    public int? MarketingCampaignId { get; set; }

    [JsonPropertyName("marketing_campaign_name")]
    public string? MarketingCampaignName { get; set; }

    [JsonPropertyName("pool")]
    public Pool? Pool { get; set; }

    [JsonPropertyName("send_at")]
    public long? SendAt { get; set; }

    public DateTime GetDateTime()
    {
        return DateTimeOffset.FromUnixTimeSeconds(Timestamp).DateTime;
    }
}

public class Pool
{
    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("id")]
    public int Id { get; set; }
}
