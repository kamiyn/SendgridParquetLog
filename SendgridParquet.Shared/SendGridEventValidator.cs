using System;
using System.Buffers;
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

        var counter = new CountingBufferWriter();
        using var writer = new Utf8JsonWriter(counter, new JsonWriterOptions { SkipValidation = true });
        element.WriteTo(writer);
        writer.Flush();
        return counter.WrittenBytes * 2L;
    }

    private sealed class CountingBufferWriter : IBufferWriter<byte>
    {
        private byte[] _buffer = new byte[4096];

        public long WrittenBytes { get; private set; }

        public void Advance(int count) => WrittenBytes += count;

        public Memory<byte> GetMemory(int sizeHint = 0)
        {
            EnsureCapacity(sizeHint);
            return _buffer;
        }

        public Span<byte> GetSpan(int sizeHint = 0)
        {
            EnsureCapacity(sizeHint);
            return _buffer;
        }

        private void EnsureCapacity(int sizeHint)
        {
            if (sizeHint <= 0 || sizeHint <= _buffer.Length)
            {
                return;
            }

            _buffer = new byte[Math.Max(sizeHint, _buffer.Length * 2)];
        }
    }
}
