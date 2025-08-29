using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

using Parquet;
using Parquet.Data;
using Parquet.Schema;

using SendgridParquet.Shared;

using SendgridParquetLogger.Models;

namespace SendgridParquetLogger.Services;

public class ParquetService
{
    private static readonly Field[] ParquetFields =
    {
        new DataField(SendGridWebHookFields.Email, typeof(string)),
        new DataField(SendGridWebHookFields.Timestamp, typeof(DateTime)),
        new DataField(SendGridWebHookFields.Event, typeof(string)),
        new DataField(SendGridWebHookFields.Category, typeof(string)),
        new DataField(SendGridWebHookFields.SgEventId, typeof(string)),
        new DataField(SendGridWebHookFields.SgMessageId, typeof(string)),
        new DataField(SendGridWebHookFields.SmtpIdParquetColumn, typeof(string)),
        new DataField(SendGridWebHookFields.UserAgent, typeof(string)),
        new DataField(SendGridWebHookFields.Ip, typeof(string)),
        new DataField(SendGridWebHookFields.Url, typeof(string)),
        new DataField(SendGridWebHookFields.Reason, typeof(string)),
        new DataField(SendGridWebHookFields.Status, typeof(string)),
        new DataField(SendGridWebHookFields.Response, typeof(string)),
        new DataField(SendGridWebHookFields.Tls, typeof(int?)),
        new DataField(SendGridWebHookFields.Attempt, typeof(string)),
        new DataField(SendGridWebHookFields.Type, typeof(string)),
        new DataField(SendGridWebHookFields.BounceClassification, typeof(string)),
        new DataField(SendGridWebHookFields.AsmGroupId, typeof(int?)),
        new DataField(SendGridWebHookFields.UniqueArgs, typeof(string)),
        new DataField(SendGridWebHookFields.MarketingCampaignId, typeof(int?)),
        new DataField(SendGridWebHookFields.MarketingCampaignName, typeof(string)),
        new DataField(SendGridWebHookFields.PoolNameParquetColumn, typeof(string)),
        new DataField(SendGridWebHookFields.PoolIdParquetColumn, typeof(int?)),
        new DataField(SendGridWebHookFields.SendAt, typeof(DateTime?))
    };

    public async Task<byte[]> ConvertToParquetAsync(List<SendGridEvent> events)
    {
        if (events == null || !events.Any())
            return null!;

        var schema = new ParquetSchema(ParquetFields);

        using var stream = new MemoryStream();
        using (var writer = await ParquetWriter.CreateAsync(schema, stream))
        {
            using var groupWriter = writer.CreateRowGroup();

            var emails = events.Select(e => e.Email ?? string.Empty).ToArray();
            await groupWriter.WriteColumnAsync(new DataColumn((DataField)ParquetFields[0], emails));

            var timestamps = events.Select(e => e.GetDateTime()).ToArray();
            await groupWriter.WriteColumnAsync(new DataColumn((DataField)ParquetFields[1], timestamps));

            var eventNames = events.Select(e => e.Event ?? string.Empty).ToArray();
            await groupWriter.WriteColumnAsync(new DataColumn((DataField)ParquetFields[2], eventNames));

            var categories = events.Select(e => e.Category != null ? JsonSerializer.Serialize(e.Category) : string.Empty).ToArray();
            await groupWriter.WriteColumnAsync(new DataColumn((DataField)ParquetFields[3], categories));

            var sgEventIds = events.Select(e => e.SgEventId ?? string.Empty).ToArray();
            await groupWriter.WriteColumnAsync(new DataColumn((DataField)ParquetFields[4], sgEventIds));

            var sgMessageIds = events.Select(e => e.SgMessageId ?? string.Empty).ToArray();
            await groupWriter.WriteColumnAsync(new DataColumn((DataField)ParquetFields[5], sgMessageIds));

            var smtpIds = events.Select(e => e.SmtpId ?? string.Empty).ToArray();
            await groupWriter.WriteColumnAsync(new DataColumn((DataField)ParquetFields[6], smtpIds));

            var userAgents = events.Select(e => e.UserAgent ?? string.Empty).ToArray();
            await groupWriter.WriteColumnAsync(new DataColumn((DataField)ParquetFields[7], userAgents));

            var ips = events.Select(e => e.Ip ?? string.Empty).ToArray();
            await groupWriter.WriteColumnAsync(new DataColumn((DataField)ParquetFields[8], ips));

            var urls = events.Select(e => e.Url ?? string.Empty).ToArray();
            await groupWriter.WriteColumnAsync(new DataColumn((DataField)ParquetFields[9], urls));

            var reasons = events.Select(e => e.Reason ?? string.Empty).ToArray();
            await groupWriter.WriteColumnAsync(new DataColumn((DataField)ParquetFields[10], reasons));

            var statuses = events.Select(e => e.Status ?? string.Empty).ToArray();
            await groupWriter.WriteColumnAsync(new DataColumn((DataField)ParquetFields[11], statuses));

            var responses = events.Select(e => e.Response ?? string.Empty).ToArray();
            await groupWriter.WriteColumnAsync(new DataColumn((DataField)ParquetFields[12], responses));

            var tls = events.Select(e => e.Tls).ToArray();
            await groupWriter.WriteColumnAsync(new DataColumn((DataField)ParquetFields[13], tls));

            var attempts = events.Select(e => e.Attempt ?? string.Empty).ToArray();
            await groupWriter.WriteColumnAsync(new DataColumn((DataField)ParquetFields[14], attempts));

            var types = events.Select(e => e.Type ?? string.Empty).ToArray();
            await groupWriter.WriteColumnAsync(new DataColumn((DataField)ParquetFields[15], types));

            var bounceClassifications = events.Select(e => e.BounceClassification ?? string.Empty).ToArray();
            await groupWriter.WriteColumnAsync(new DataColumn((DataField)ParquetFields[16], bounceClassifications));

            var asmGroupIds = events.Select(e => e.AsmGroupId).ToArray();
            await groupWriter.WriteColumnAsync(new DataColumn((DataField)ParquetFields[17], asmGroupIds));

            var uniqueArgs = events.Select(e => e.UniqueArgs != null ? JsonSerializer.Serialize(e.UniqueArgs) : string.Empty).ToArray();
            await groupWriter.WriteColumnAsync(new DataColumn((DataField)ParquetFields[18], uniqueArgs));

            var marketingCampaignIds = events.Select(e => e.MarketingCampaignId).ToArray();
            await groupWriter.WriteColumnAsync(new DataColumn((DataField)ParquetFields[19], marketingCampaignIds));

            var marketingCampaignNames = events.Select(e => e.MarketingCampaignName ?? string.Empty).ToArray();
            await groupWriter.WriteColumnAsync(new DataColumn((DataField)ParquetFields[20], marketingCampaignNames));

            var poolNames = events.Select(e => e.Pool?.Name ?? string.Empty).ToArray();
            await groupWriter.WriteColumnAsync(new DataColumn((DataField)ParquetFields[21], poolNames));

            var poolIds = events.Select(e => e.Pool?.Id).ToArray();
            await groupWriter.WriteColumnAsync(new DataColumn((DataField)ParquetFields[22], poolIds));

            var sendAts = events.Select(e => e.SendAt.HasValue ? DateTimeOffset.FromUnixTimeSeconds(e.SendAt.Value).DateTime : (DateTime?)null).ToArray();
            await groupWriter.WriteColumnAsync(new DataColumn((DataField)ParquetFields[23], sendAts));
        }

        return stream.ToArray();
    }
}
