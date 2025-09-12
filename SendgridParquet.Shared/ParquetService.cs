using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Parquet;
using Parquet.Data;
using Parquet.Schema;

namespace SendgridParquet.Shared;

public class ParquetService
{
    // Paired field definition and processing function
    private record FieldProcessor(DataField Field, Func<IEnumerable<SendGridEvent>, DataColumn> ProcessorFunc);

    private static readonly FieldProcessor[] FieldProcessors = CreateFieldProcessors();

    private static FieldProcessor[] CreateFieldProcessors()
    {
        var emailField = new DataField(SendGridWebHookFields.Email, typeof(string));
        var timestampField = new DataField(SendGridWebHookFields.Timestamp, typeof(long));
        var eventField = new DataField(SendGridWebHookFields.Event, typeof(string));
        var categoryField = new DataField(SendGridWebHookFields.Category, typeof(string));
        var sgEventIdField = new DataField(SendGridWebHookFields.SgEventId, typeof(string));
        var sgMessageIdField = new DataField(SendGridWebHookFields.SgMessageId, typeof(string));
        var sgTemplateIdField = new DataField(SendGridWebHookFields.SgTemplateId, typeof(string));
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
        // 業務上必要であれば UniqueArgs から個別に取得する
        //var uniqueArgsField = new DataField(SendGridWebHookFields.UniqueArgs, typeof(string));
        var marketingCampaignIdField = new DataField(SendGridWebHookFields.MarketingCampaignId, typeof(int?));
        var marketingCampaignNameField = new DataField(SendGridWebHookFields.MarketingCampaignName, typeof(string));
        var poolNameField = new DataField(SendGridWebHookFields.PoolNameParquetColumn, typeof(string));
        var poolIdField = new DataField(SendGridWebHookFields.PoolIdParquetColumn, typeof(int?));
        var sendAtField = new DataField(SendGridWebHookFields.SendAt, typeof(long?));

        return
        [
            new FieldProcessor(emailField,
                events => new DataColumn(emailField,
                    events.Select(e => e.Email ?? string.Empty).ToArray())),

            new FieldProcessor(timestampField,
                events => new DataColumn(timestampField,
                    events.Select(e => e.Timestamp).ToArray())),

            new FieldProcessor(eventField,
                events => new DataColumn(eventField,
                    events.Select(e => e.Event ?? string.Empty).ToArray())),

            new FieldProcessor(categoryField,
                events => new DataColumn(categoryField,
                    events.Select(e => e.Category ?? string.Empty).ToArray())),

            new FieldProcessor(sgEventIdField,
                events => new DataColumn(sgEventIdField,
                    events.Select(e => e.SgEventId ?? string.Empty).ToArray())),

            new FieldProcessor(sgMessageIdField,
                events => new DataColumn(sgMessageIdField,
                    events.Select(e => e.SgMessageId ?? string.Empty).ToArray())),

            new FieldProcessor(sgTemplateIdField,
                events => new DataColumn(sgTemplateIdField,
                    events.Select(e => e.SgTemplateId ?? string.Empty).ToArray())),

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

            //new FieldProcessor(uniqueArgsField,
            //    events => new DataColumn(uniqueArgsField,
            //        events.Select(e => e.UniqueArgs.HasValue ? e.UniqueArgs.Value.GetRawText() : string.Empty).ToArray())),

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
                    events.Select(e => e.SendAt).ToArray()))
        ];
    }

    public async Task<Stream?> ConvertToParquetAsync(IReadOnlyCollection<SendGridEvent> events)
    {
        if (!events.Any())
        {
            return null;
        }
        var stream = new MemoryStream();
        // Extract fields from FieldProcessors
        Field[] fields = FieldProcessors.Select(fp => fp.Field).ToArray<Field>();
        await using var writer = await ParquetWriter.CreateAsync(new ParquetSchema(fields), stream);
        using var groupWriter = writer.CreateRowGroup();
        foreach (var processor in FieldProcessors)
        {
            var dataColumn = processor.ProcessorFunc(events);
            await groupWriter.WriteColumnAsync(dataColumn);
        }
        return stream;
    }

    public async IAsyncEnumerable<SendGridEvent> ReadRowGroupEventsAsync(
        ParquetRowGroupReader rowGroupReader,
        ParquetReader parquetReader,
        [System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken token = default)
    {
        ParquetSchema schema = parquetReader.Schema;
        // Read required columns safely (if missing or read fails, yield no rows)
        var emailColumn = await TryReadRequiredColumnAsync(rowGroupReader, schema, SendGridWebHookFields.Email, token);
        if (emailColumn is null) yield break;
        var timestampColumn = await TryReadRequiredColumnAsync(rowGroupReader, schema, SendGridWebHookFields.Timestamp, token);
        if (timestampColumn is null) yield break;
        var eventColumn = await TryReadRequiredColumnAsync(rowGroupReader, schema, SendGridWebHookFields.Event, token);
        if (eventColumn is null) yield break;

        // Get optional columns
        var categoryColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.Category);
        var sgEventIdColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.SgEventId);
        var sgMessageIdColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.SgMessageId);
        var sgTemplateIdColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.SgTemplateId);
        var smtpIdColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.SmtpIdParquetColumn);
        var userAgentColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.UserAgent);
        var ipColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.Ip);
        var urlColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.Url);
        var reasonColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.Reason);
        var statusColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.Status);
        var responseColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.Response);
        var tlsColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.Tls);
        var attemptColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.Attempt);
        var typeColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.Type);
        var bounceClassificationColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.BounceClassification);
        var asmGroupIdColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.AsmGroupId);
        //var uniqueArgsColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.UniqueArgs);
        var marketingCampaignIdColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.MarketingCampaignId);
        var marketingCampaignNameColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.MarketingCampaignName);
        var poolNameColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.PoolNameParquetColumn);
        var poolIdColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.PoolIdParquetColumn);
        var sendAtColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.SendAt);

        int rowCount = emailColumn.Data.Length;
        for (int idx = 0; idx < rowCount; idx++)
        {
            yield return new SendGridEvent
            {
                Email = emailColumn.Data.GetValue(idx)?.ToString() ?? string.Empty,
                Timestamp = ConvertToNullableLong(timestampColumn.Data.GetValue(idx)) ?? 0,
                Event = eventColumn.Data.GetValue(idx)?.ToString() ?? string.Empty,
                Category = categoryColumn?.Data.GetValue(idx)?.ToString(),
                SgEventId = sgEventIdColumn?.Data.GetValue(idx)?.ToString(),
                SgMessageId = sgMessageIdColumn?.Data.GetValue(idx)?.ToString(),
                SgTemplateId = sgTemplateIdColumn?.Data.GetValue(idx)?.ToString(),
                SmtpId = smtpIdColumn?.Data.GetValue(idx)?.ToString(),
                UserAgent = userAgentColumn?.Data.GetValue(idx)?.ToString(),
                Ip = ipColumn?.Data.GetValue(idx)?.ToString(),
                Url = urlColumn?.Data.GetValue(idx)?.ToString(),
                Reason = reasonColumn?.Data.GetValue(idx)?.ToString(),
                Status = statusColumn?.Data.GetValue(idx)?.ToString(),
                Response = responseColumn?.Data.GetValue(idx)?.ToString(),
                Tls = ConvertToNullableInt(tlsColumn?.Data.GetValue(idx)),
                Attempt = attemptColumn?.Data.GetValue(idx)?.ToString(),
                Type = typeColumn?.Data.GetValue(idx)?.ToString(),
                BounceClassification = bounceClassificationColumn?.Data.GetValue(idx)?.ToString(),
                AsmGroupId = ConvertToNullableInt(asmGroupIdColumn?.Data.GetValue(idx)),
                //UniqueArgs = TryParseJsonElement(uniqueArgsColumn?.Data.GetValue(idx)?.ToString()),
                MarketingCampaignId = ConvertToNullableInt(marketingCampaignIdColumn?.Data.GetValue(idx)),
                MarketingCampaignName = marketingCampaignNameColumn?.Data.GetValue(idx)?.ToString(),
                Pool = new Pool
                {
                    Name = poolNameColumn?.Data.GetValue(idx)?.ToString(),
                    Id = ConvertToNullableInt(poolIdColumn?.Data.GetValue(idx)) ?? 0
                },
                SendAt = ConvertToNullableLong(sendAtColumn?.Data.GetValue(idx))
            };
        }
    }

    private async Task<DataColumn?> TryReadColumnAsync(ParquetRowGroupReader rowGroupReader, ParquetSchema schema, string fieldName)
    {
        try
        {
            DataField? field = schema.GetDataFields().FirstOrDefault(f => f.Name == fieldName);
            return field == null ? null : await rowGroupReader.ReadColumnAsync(field);
        }
        catch
        {
            return null;
        }
    }

    private async Task<DataColumn?> TryReadRequiredColumnAsync(ParquetRowGroupReader rowGroupReader, ParquetSchema schema, string fieldName, CancellationToken token)
    {
        try
        {
            DataField? field = schema.GetDataFields().FirstOrDefault(f => f.Name == fieldName);
            if (field == null)
            {
                return null;
            }
            return await rowGroupReader.ReadColumnAsync(field, token);
        }
        catch
        {
            return null;
        }
    }

    private static int? ConvertToNullableInt(object? value) =>
        value switch
        {
            int i => i,
            long l => (int)l,
            _ => null
        };

    private static long? ConvertToNullableLong(object? value) =>
        value switch
        {
            int i => i,
            long l => l,
            _ => null
        };

    // Parquet の列に JSON 文字列を格納すると "Payload value bigger than allowed" エラーになるためコメントアウト
    //private static JsonElement? TryParseJsonElement(string? json)
    //{
    //    if (string.IsNullOrWhiteSpace(json))
    //    {
    //        return null;
    //    }
    //    try
    //    {
    //        using var doc = JsonDocument.Parse(json);
    //        return doc.RootElement.Clone();
    //    }
    //    catch
    //    {
    //        // 解析に失敗した場合は空扱い（null）
    //        return null;
    //    }
    //}
}
