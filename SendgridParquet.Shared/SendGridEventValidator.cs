using System.Text.Json;

namespace SendgridParquet.Shared;

public static class SendGridEventValidator
{
    /// <summary>
    /// 1 イベントあたりの推定 in-memory サイズ上限 (既定 4 MiB)。
    /// SendGrid Event Webhook の元メッセージは最大 768 KB。
    /// https://www.twilio.com/docs/sendgrid/for-developers/tracking-events/twilio-sendgrid-event-webhook-overview
    /// </summary>
    public const int DefaultMaxEventBytes = 4 * 1024 * 1024;

    public static long EstimateEventBytes(SendGridEvent sendGridEvent)
    {
        long total = 0;
        total += EstimateStringBytes(sendGridEvent.Email);
        total += EstimateStringBytes(sendGridEvent.Event);
        total += EstimateStringBytes(sendGridEvent.Category);
        total += EstimateStringBytes(sendGridEvent.SgEventId);
        total += EstimateStringBytes(sendGridEvent.SgMessageId);
        total += EstimateStringBytes(sendGridEvent.SgTemplateId);
        total += EstimateStringBytes(sendGridEvent.SmtpId);
        total += EstimateStringBytes(sendGridEvent.UserAgent);
        total += EstimateStringBytes(sendGridEvent.Ip);
        total += EstimateStringBytes(sendGridEvent.Url);
        total += EstimateStringBytes(sendGridEvent.Reason);
        total += EstimateStringBytes(sendGridEvent.Status);
        total += EstimateStringBytes(sendGridEvent.Response);
        total += EstimateStringBytes(sendGridEvent.Attempt);
        total += EstimateStringBytes(sendGridEvent.Type);
        total += EstimateStringBytes(sendGridEvent.BounceClassification);
        total += EstimateStringBytes(sendGridEvent.MarketingCampaignName);
        total += EstimateStringBytes(sendGridEvent.Pool?.Name);
        total += EstimateJsonElementBytes(sendGridEvent.UniqueArgs);
        total += 8L; // Timestamp
        total += EstimateNullableIntBytes(sendGridEvent.Tls);
        total += EstimateNullableIntBytes(sendGridEvent.AsmGroupId);
        total += EstimateNullableIntBytes(sendGridEvent.MarketingCampaignId);
        total += EstimateNullableIntBytes(sendGridEvent.Pool?.Id);
        total += EstimateNullableLongBytes(sendGridEvent.SendAt);
        return total;
    }

    public static bool IsWithinMaxEventBytes(SendGridEvent sendGridEvent, int maxEventBytes) =>
        EstimateEventBytes(sendGridEvent) <= maxEventBytes;

    private static long EstimateStringBytes(string? value) => (value?.Length ?? 0) * 2L;

    private static long EstimateNullableIntBytes(int? value) => value.HasValue ? 4L : 1L;

    private static long EstimateNullableLongBytes(long? value) => value.HasValue ? 8L : 1L;

    private static long EstimateJsonElementBytes(JsonElement? value)
    {
        if (value is not { } element)
        {
            return 0;
        }

        return element.GetRawText().Length * 2L;
    }
}
