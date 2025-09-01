using System.Text.Json;

using Parquet;
using Parquet.Data;
using Parquet.Schema;

using SendgridParquet.Shared;

using SendgridParquetLogger.Models;

namespace SendgridParquetLogger.Services;

public class ParquetService
{
    // Paired field definition and processing function
    private record FieldProcessor(DataField Field, Func<IEnumerable<SendGridEvent>, DataColumn> ProcessorFunc);

    private static readonly FieldProcessor[] FieldProcessors = CreateFieldProcessors();

    private static FieldProcessor[] CreateFieldProcessors()
    {
        var emailField = new DataField(SendGridWebHookFields.Email, typeof(string));
        var timestampField = new DataField(SendGridWebHookFields.Timestamp, typeof(DateTime));
        var eventField = new DataField(SendGridWebHookFields.Event, typeof(string));
        var categoryField = new DataField(SendGridWebHookFields.Category, typeof(string));
        var sgEventIdField = new DataField(SendGridWebHookFields.SgEventId, typeof(string));
        var sgMessageIdField = new DataField(SendGridWebHookFields.SgMessageId, typeof(string));
        var smtpIdField = new DataField(SendGridWebHookFields.SmtpIdParquetColumn, typeof(string));
        var userAgentField = new DataField(SendGridWebHookFields.UserAgent, typeof(string));
        var ipField = new DataField(SendGridWebHookFields.Ip, typeof(string));
        var urlField = new DataField(SendGridWebHookFields.Url, typeof(string));
        var reasonField = new DataField(SendGridWebHookFields.Reason, typeof(string));
        var statusField = new DataField(SendGridWebHookFields.Status, typeof(string));
        var responseField = new DataField(SendGridWebHookFields.Response, typeof(string));
        var tlsField = new DataField(SendGridWebHookFields.Tls, typeof(int?));
        var attemptField = new DataField(SendGridWebHookFields.Attempt, typeof(string));
        var typeField = new DataField(SendGridWebHookFields.Type, typeof(string));
        var bounceClassificationField = new DataField(SendGridWebHookFields.BounceClassification, typeof(string));
        var asmGroupIdField = new DataField(SendGridWebHookFields.AsmGroupId, typeof(int?));
        var uniqueArgsField = new DataField(SendGridWebHookFields.UniqueArgs, typeof(string));
        var marketingCampaignIdField = new DataField(SendGridWebHookFields.MarketingCampaignId, typeof(int?));
        var marketingCampaignNameField = new DataField(SendGridWebHookFields.MarketingCampaignName, typeof(string));
        var poolNameField = new DataField(SendGridWebHookFields.PoolNameParquetColumn, typeof(string));
        var poolIdField = new DataField(SendGridWebHookFields.PoolIdParquetColumn, typeof(int?));
        var sendAtField = new DataField(SendGridWebHookFields.SendAt, typeof(DateTime?));

        return
        [
            new FieldProcessor(emailField,
                events => new DataColumn(emailField,
                    events.Select(e => e.Email ?? string.Empty).ToArray())),

            new FieldProcessor(timestampField,
                events => new DataColumn(timestampField,
                    events.Select(e => e.GetDateTime()).ToArray())),

            new FieldProcessor(eventField,
                events => new DataColumn(eventField,
                    events.Select(e => e.Event ?? string.Empty).ToArray())),

            new FieldProcessor(categoryField,
                events => new DataColumn(categoryField,
                    events.Select(e => e.Category != null ? JsonSerializer.Serialize(e.Category) : string.Empty).ToArray())),

            new FieldProcessor(sgEventIdField,
                events => new DataColumn(sgEventIdField,
                    events.Select(e => e.SgEventId ?? string.Empty).ToArray())),

            new FieldProcessor(sgMessageIdField,
                events => new DataColumn(sgMessageIdField,
                    events.Select(e => e.SgMessageId ?? string.Empty).ToArray())),

            new FieldProcessor(smtpIdField,
                events => new DataColumn(smtpIdField,
                    events.Select(e => e.SmtpId ?? string.Empty).ToArray())),

            new FieldProcessor(userAgentField,
                events => new DataColumn(userAgentField,
                    events.Select(e => e.UserAgent ?? string.Empty).ToArray())),

            new FieldProcessor(ipField,
                events => new DataColumn(ipField,
                    events.Select(e => e.Ip ?? string.Empty).ToArray())),

            new FieldProcessor(urlField,
                events => new DataColumn(urlField,
                    events.Select(e => e.Url ?? string.Empty).ToArray())),

            new FieldProcessor(reasonField,
                events => new DataColumn(reasonField,
                    events.Select(e => e.Reason ?? string.Empty).ToArray())),

            new FieldProcessor(statusField,
                events => new DataColumn(statusField,
                    events.Select(e => e.Status ?? string.Empty).ToArray())),

            new FieldProcessor(responseField,
                events => new DataColumn(responseField,
                    events.Select(e => e.Response ?? string.Empty).ToArray())),

            new FieldProcessor(tlsField,
                events => new DataColumn(tlsField,
                    events.Select(e => e.Tls).ToArray())),

            new FieldProcessor(attemptField,
                events => new DataColumn(attemptField,
                    events.Select(e => e.Attempt ?? string.Empty).ToArray())),

            new FieldProcessor(typeField,
                events => new DataColumn(typeField,
                    events.Select(e => e.Type ?? string.Empty).ToArray())),

            new FieldProcessor(bounceClassificationField,
                events => new DataColumn(bounceClassificationField,
                    events.Select(e => e.BounceClassification ?? string.Empty).ToArray())),

            new FieldProcessor(asmGroupIdField,
                events => new DataColumn(asmGroupIdField,
                    events.Select(e => e.AsmGroupId).ToArray())),

            new FieldProcessor(uniqueArgsField,
                events => new DataColumn(uniqueArgsField,
                    events.Select(e => e.UniqueArgs != null ? JsonSerializer.Serialize(e.UniqueArgs) : string.Empty).ToArray())),

            new FieldProcessor(marketingCampaignIdField,
                events => new DataColumn(marketingCampaignIdField,
                    events.Select(e => e.MarketingCampaignId).ToArray())),

            new FieldProcessor(marketingCampaignNameField,
                events => new DataColumn(marketingCampaignNameField,
                    events.Select(e => e.MarketingCampaignName ?? string.Empty).ToArray())),

            new FieldProcessor(poolNameField,
                events => new DataColumn(poolNameField,
                    events.Select(e => e.Pool?.Name ?? string.Empty).ToArray())),

            new FieldProcessor(poolIdField,
                events => new DataColumn(poolIdField,
                    events.Select(e => e.Pool?.Id).ToArray())),

            new FieldProcessor(sendAtField,
                events => new DataColumn(sendAtField,
                    events.Select(e => e.SendAt.HasValue ? DateTimeOffset.FromUnixTimeSeconds(e.SendAt.Value).DateTime : (DateTime?)null).ToArray()))
        ];
    }

    public async ValueTask<byte[]?> ConvertToParquetAsync(ICollection<SendGridEvent> sendGridEvents)
    {
        if (!sendGridEvents.Any())
        {
            return null;
        }
        using var stream = new MemoryStream();
        // Extract fields from FieldProcessors
        Field[] fields = FieldProcessors.Select(fp => fp.Field).ToArray<Field>();
        await using ParquetWriter writer = await ParquetWriter.CreateAsync(new ParquetSchema(fields), stream);
        using ParquetRowGroupWriter groupWriter = writer.CreateRowGroup();
        foreach (FieldProcessor processor in FieldProcessors)
        {
            DataColumn dataColumn = processor.ProcessorFunc(sendGridEvents);
            await groupWriter.WriteColumnAsync(dataColumn);
        }

        return stream.ToArray();
    }
}
