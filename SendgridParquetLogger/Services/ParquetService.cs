using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Text.Json;
using Parquet;
using Parquet.Data;
using SendgridParquetLogger.Models;

namespace SendgridParquetLogger.Services
{
    public class ParquetService
    {
        public async Task<byte[]> ConvertToParquetAsync(List<SendGridEvent> events)
        {
            if (events == null || !events.Any())
                return null;

            var fields = new List<DataField>
            {
                new DataField<string>("email"),
                new DataField<DateTime>("timestamp"),
                new DataField<string>("event"),
                new DataField<string>("category"),
                new DataField<string>("sg_event_id"),
                new DataField<string>("sg_message_id"),
                new DataField<string>("smtp_id"),
                new DataField<string>("useragent"),
                new DataField<string>("ip"),
                new DataField<string>("url"),
                new DataField<string>("reason"),
                new DataField<string>("status"),
                new DataField<string>("response"),
                new DataField<int?>("tls"),
                new DataField<string>("attempt"),
                new DataField<string>("type"),
                new DataField<string>("bounce_classification"),
                new DataField<int?>("asm_group_id"),
                new DataField<string>("unique_args"),
                new DataField<int?>("marketing_campaign_id"),
                new DataField<string>("marketing_campaign_name"),
                new DataField<string>("pool_name"),
                new DataField<int?>("pool_id"),
                new DataField<DateTime?>("send_at")
            };

            var schema = new ParquetSchema(fields);

            using var stream = new MemoryStream();
            using (var writer = await ParquetWriter.CreateAsync(schema, stream))
            {
                using var groupWriter = writer.CreateRowGroup();

                var emails = events.Select(e => e.Email ?? string.Empty).ToArray();
                await groupWriter.WriteColumnAsync(new DataColumn(fields[0], emails));

                var timestamps = events.Select(e => e.GetDateTime()).ToArray();
                await groupWriter.WriteColumnAsync(new DataColumn(fields[1], timestamps));

                var eventNames = events.Select(e => e.Event ?? string.Empty).ToArray();
                await groupWriter.WriteColumnAsync(new DataColumn(fields[2], eventNames));

                var categories = events.Select(e => e.Category != null ? JsonSerializer.Serialize(e.Category) : string.Empty).ToArray();
                await groupWriter.WriteColumnAsync(new DataColumn(fields[3], categories));

                var sgEventIds = events.Select(e => e.SgEventId ?? string.Empty).ToArray();
                await groupWriter.WriteColumnAsync(new DataColumn(fields[4], sgEventIds));

                var sgMessageIds = events.Select(e => e.SgMessageId ?? string.Empty).ToArray();
                await groupWriter.WriteColumnAsync(new DataColumn(fields[5], sgMessageIds));

                var smtpIds = events.Select(e => e.SmtpId ?? string.Empty).ToArray();
                await groupWriter.WriteColumnAsync(new DataColumn(fields[6], smtpIds));

                var userAgents = events.Select(e => e.UserAgent ?? string.Empty).ToArray();
                await groupWriter.WriteColumnAsync(new DataColumn(fields[7], userAgents));

                var ips = events.Select(e => e.Ip ?? string.Empty).ToArray();
                await groupWriter.WriteColumnAsync(new DataColumn(fields[8], ips));

                var urls = events.Select(e => e.Url ?? string.Empty).ToArray();
                await groupWriter.WriteColumnAsync(new DataColumn(fields[9], urls));

                var reasons = events.Select(e => e.Reason ?? string.Empty).ToArray();
                await groupWriter.WriteColumnAsync(new DataColumn(fields[10], reasons));

                var statuses = events.Select(e => e.Status ?? string.Empty).ToArray();
                await groupWriter.WriteColumnAsync(new DataColumn(fields[11], statuses));

                var responses = events.Select(e => e.Response ?? string.Empty).ToArray();
                await groupWriter.WriteColumnAsync(new DataColumn(fields[12], responses));

                var tls = events.Select(e => e.Tls).ToArray();
                await groupWriter.WriteColumnAsync(new DataColumn(fields[13], tls));

                var attempts = events.Select(e => e.Attempt ?? string.Empty).ToArray();
                await groupWriter.WriteColumnAsync(new DataColumn(fields[14], attempts));

                var types = events.Select(e => e.Type ?? string.Empty).ToArray();
                await groupWriter.WriteColumnAsync(new DataColumn(fields[15], types));

                var bounceClassifications = events.Select(e => e.BounceClassification ?? string.Empty).ToArray();
                await groupWriter.WriteColumnAsync(new DataColumn(fields[16], bounceClassifications));

                var asmGroupIds = events.Select(e => e.AsmGroupId).ToArray();
                await groupWriter.WriteColumnAsync(new DataColumn(fields[17], asmGroupIds));

                var uniqueArgs = events.Select(e => e.UniqueArgs != null ? JsonSerializer.Serialize(e.UniqueArgs) : string.Empty).ToArray();
                await groupWriter.WriteColumnAsync(new DataColumn(fields[18], uniqueArgs));

                var marketingCampaignIds = events.Select(e => e.MarketingCampaignId).ToArray();
                await groupWriter.WriteColumnAsync(new DataColumn(fields[19], marketingCampaignIds));

                var marketingCampaignNames = events.Select(e => e.MarketingCampaignName ?? string.Empty).ToArray();
                await groupWriter.WriteColumnAsync(new DataColumn(fields[20], marketingCampaignNames));

                var poolNames = events.Select(e => e.Pool?.Name ?? string.Empty).ToArray();
                await groupWriter.WriteColumnAsync(new DataColumn(fields[21], poolNames));

                var poolIds = events.Select(e => e.Pool?.Id).ToArray();
                await groupWriter.WriteColumnAsync(new DataColumn(fields[22], poolIds));

                var sendAts = events.Select(e => e.SendAt.HasValue ? DateTimeOffset.FromUnixTimeSeconds(e.SendAt.Value).DateTime : (DateTime?)null).ToArray();
                await groupWriter.WriteColumnAsync(new DataColumn(fields[23], sendAts));
            }

            return stream.ToArray();
        }
    }
}