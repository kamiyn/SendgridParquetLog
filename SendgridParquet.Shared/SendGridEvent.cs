using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace SendgridParquet.Shared;

public class SendGridEvent
{
    [JsonPropertyName(SendGridWebHookFields.Email)]
    public string? Email { get; set; }

    /// <summary>
    /// UnixTime seconds
    /// </summary>
    [JsonPropertyName(SendGridWebHookFields.Timestamp)]
    public long Timestamp { get; set; }

    [JsonPropertyName(SendGridWebHookFields.Event)]
    public string? Event { get; set; }

    /// <summary>
    /// 送信時に string array として送るケースで問題
    /// Categories are custom tags that you set for the purpose of organizing your emails. If you send single categories as an array, they will be returned by the webhook as an array. If you send single categories as a string, they will be returned by the webhook as a string.
    /// </summary>
    [JsonPropertyName(SendGridWebHookFields.Category)]
    public string? Category { get; set; }

    [JsonPropertyName(SendGridWebHookFields.SgEventId)]
    public string? SgEventId { get; set; }

    [JsonPropertyName(SendGridWebHookFields.SgMessageId)]
    public string? SgMessageId { get; set; }

    [JsonPropertyName(SendGridWebHookFields.SgTemplateId)]
    public string? SgTemplateId { get; set; }

    [JsonPropertyName(SendGridWebHookFields.SmtpId)]
    public string? SmtpId { get; set; }

    [JsonPropertyName(SendGridWebHookFields.UserAgent)]
    public string? UserAgent { get; set; }

    [JsonPropertyName(SendGridWebHookFields.Ip)]
    public string? Ip { get; set; }

    [JsonPropertyName(SendGridWebHookFields.Url)]
    public string? Url { get; set; }

    [JsonPropertyName(SendGridWebHookFields.Reason)]
    public string? Reason { get; set; }

    [JsonPropertyName(SendGridWebHookFields.Status)]
    public string? Status { get; set; }

    [JsonPropertyName(SendGridWebHookFields.Response)]
    public string? Response { get; set; }

    [JsonPropertyName(SendGridWebHookFields.Tls)]
    public int? Tls { get; set; }

    [JsonPropertyName(SendGridWebHookFields.Attempt)]
    public string? Attempt { get; set; }

    [JsonPropertyName(SendGridWebHookFields.Type)]
    public string? Type { get; set; }

    [JsonPropertyName(SendGridWebHookFields.BounceClassification)]
    public string? BounceClassification { get; set; }

    [JsonPropertyName(SendGridWebHookFields.AsmGroupId)]
    public int? AsmGroupId { get; set; }

    [JsonPropertyName(SendGridWebHookFields.UniqueArgs)]
    public Dictionary<string, object>? UniqueArgs { get; set; }

    [JsonPropertyName(SendGridWebHookFields.MarketingCampaignId)]
    public int? MarketingCampaignId { get; set; }

    [JsonPropertyName(SendGridWebHookFields.MarketingCampaignName)]
    public string? MarketingCampaignName { get; set; }

    [JsonPropertyName(SendGridWebHookFields.Pool)]
    public Pool? Pool { get; set; }

    [JsonPropertyName(SendGridWebHookFields.SendAt)]
    public long? SendAt { get; set; }

    // Additional properties for Viewer compatibility
    public string? PoolName => Pool?.Name;
    public int? PoolId => Pool?.Id;
}

public class Pool
{
    [JsonPropertyName(SendGridWebHookFields.PoolFields.Name)]
    public string? Name { get; set; }

    [JsonPropertyName(SendGridWebHookFields.PoolFields.Id)]
    public int Id { get; set; }
}
