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
    /// <summary>
    /// 実測だと 10000 行で約 1.2 MiB 程度になるため AWS Lambda のペイロード制限 6 MiB を考慮して余裕を持たせた値にする
    /// </summary>
    private const int DefaultRowGroupSize = 10_000;

    // Paired field definition and processing function
    private record FieldProcessor(
        DataField Field,
        Func<IEnumerable<SendGridEvent>, DataColumn> ProcessorFunc,
        Func<int, IColumnBuffer> BufferFactory);

    private interface IColumnBuffer
    {
        int Count { get; }

        void Append(SendGridEvent item);

        DataColumn BuildDataColumn();

        void Clear();
    }

    private sealed class ColumnBuffer<T> : IColumnBuffer
    {
        private readonly DataField _field;
        private readonly Func<SendGridEvent, T> _selector;
        private readonly List<T> _values;

        internal ColumnBuffer(DataField field, int capacity, Func<SendGridEvent, T> selector)
        {
            _field = field;
            _selector = selector;
            _values = new List<T>(capacity);
        }

        public int Count => _values.Count;

        public void Append(SendGridEvent item) => _values.Add(_selector(item));

        public DataColumn BuildDataColumn() => new(_field, _values.ToArray());

        public void Clear() => _values.Clear();
    }

    private static readonly FieldProcessor[] FieldProcessors = CreateFieldProcessors();

    private static FieldProcessor CreateFieldProcessor<T>(DataField field, Func<SendGridEvent, T> selector)
        => new(field,
            events => new DataColumn(field, events.Select(selector).ToArray()),
            capacity => new ColumnBuffer<T>(field, capacity, selector));

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
            CreateFieldProcessor(emailField, e => e.Email ?? string.Empty),
            CreateFieldProcessor(timestampField, e => e.Timestamp),
            CreateFieldProcessor(eventField, e => e.Event ?? string.Empty),
            CreateFieldProcessor(categoryField, e => e.Category ?? string.Empty),
            CreateFieldProcessor(sgEventIdField, e => e.SgEventId ?? string.Empty),
            CreateFieldProcessor(sgMessageIdField, e => e.SgMessageId ?? string.Empty),
            CreateFieldProcessor(sgTemplateIdField, e => e.SgTemplateId ?? string.Empty),
            CreateFieldProcessor(smtpIdField, e => e.SmtpId ?? string.Empty),
            CreateFieldProcessor(userAgentField, e => e.UserAgent ?? string.Empty),
            CreateFieldProcessor(ipField, e => e.Ip ?? string.Empty),
            CreateFieldProcessor(urlField, e => e.Url ?? string.Empty),
            CreateFieldProcessor(reasonField, e => e.Reason ?? string.Empty),
            CreateFieldProcessor(statusField, e => e.Status ?? string.Empty),
            CreateFieldProcessor(responseField, e => e.Response ?? string.Empty),
            CreateFieldProcessor(tlsField, e => e.Tls),
            CreateFieldProcessor(attemptField, e => e.Attempt ?? string.Empty),
            CreateFieldProcessor(typeField, e => e.Type ?? string.Empty),
            CreateFieldProcessor(bounceClassificationField, e => e.BounceClassification ?? string.Empty),
            CreateFieldProcessor(asmGroupIdField, e => e.AsmGroupId),
            //CreateFieldProcessor(uniqueArgsField,
            //    e => e.UniqueArgs.HasValue ? e.UniqueArgs.Value.GetRawText() : string.Empty),
            CreateFieldProcessor(marketingCampaignIdField, e => e.MarketingCampaignId),
            CreateFieldProcessor(marketingCampaignNameField, e => e.MarketingCampaignName ?? string.Empty),
            CreateFieldProcessor(poolNameField, e => e.Pool?.Name ?? string.Empty),
            CreateFieldProcessor(poolIdField, e => e.Pool?.Id),
            CreateFieldProcessor(sendAtField, e => e.SendAt)
        ];
    }

    public async Task<bool> ConvertToParquetStreamingAsync(
        IAsyncEnumerable<SendGridEvent> events,
        Stream stream,
        int rowGroupSize = DefaultRowGroupSize,
        CancellationToken token = default)
    {
        if (rowGroupSize <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(rowGroupSize));
        }

        Field[] fields = FieldProcessors.Select(fp => fp.Field).ToArray<Field>();
        await using ParquetWriter writer = await ParquetWriter.CreateAsync(new ParquetSchema(fields), stream, cancellationToken: token);
        IColumnBuffer[] buffers = FieldProcessors
            .Select(fp => fp.BufferFactory(rowGroupSize))
            .ToArray();

        bool hasData = false;
        await foreach (SendGridEvent sendGridEvent in events.WithCancellation(token))
        {
            hasData = true;
            foreach (IColumnBuffer buffer in buffers)
            {
                buffer.Append(sendGridEvent);
            }

            if (buffers[0].Count >= rowGroupSize)
            {
                await WriteRowGroupAsync(writer, buffers);
            }
        }

        if (!hasData)
        {
            return false;
        }

        if (buffers[0].Count > 0)
        {
            await WriteRowGroupAsync(writer, buffers);
        }

        return true;
    }

    public async Task<bool> ConvertToParquetAsync(IReadOnlyCollection<SendGridEvent> events, Stream stream)
    {
        if (!events.Any())
        {
            return false;
        }
        // Extract fields from FieldProcessors
        Field[] fields = FieldProcessors.Select(fp => fp.Field).ToArray<Field>();
        await using var writer = await ParquetWriter.CreateAsync(new ParquetSchema(fields), stream);
        using var groupWriter = writer.CreateRowGroup();
        foreach (var processor in FieldProcessors)
        {
            var dataColumn = processor.ProcessorFunc(events);
            await groupWriter.WriteColumnAsync(dataColumn);
        }
        return true;
    }

    private static async Task WriteRowGroupAsync(ParquetWriter writer, IColumnBuffer[] buffers)
    {
        if (buffers.Any(columnBuffer => columnBuffer.Count > 0))
        {
            // CreateRowGroup() メソッドに行数を指定する引数はありません。
            // 行グループの行数 (rowCount) は、WriteColumn() で書き込む配列の要素数で決まります
            // 複数の行グループを作成したい場合は、CreateRowGroup() の呼び出しとデータ書き込みの処理をループで繰り返します。
            using ParquetRowGroupWriter groupWriter = writer.CreateRowGroup();
            foreach (IColumnBuffer buffer in buffers)
            {
                DataColumn column = buffer.BuildDataColumn();
                await groupWriter.WriteColumnAsync(column);
                buffer.Clear();
            }
        }
    }

    public async IAsyncEnumerable<SendGridEvent> ReadRowGroupEventsAsync(
        ParquetRowGroupReader rowGroupReader,
        ParquetReader parquetReader,
        [System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken token = default)
    {
        ParquetSchema schema = parquetReader.Schema;
        // Read required columns safely (if missing or read fails, yield no rows)
        var emailColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.Email, token);
        if (emailColumn is null) yield break;
        var timestampColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.Timestamp, token);
        if (timestampColumn is null) yield break;
        var eventColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.Event, token);
        if (eventColumn is null) yield break;

        // Get optional columns
        var categoryColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.Category, token);
        var sgEventIdColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.SgEventId, token);
        var sgMessageIdColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.SgMessageId, token);
        var sgTemplateIdColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.SgTemplateId, token);
        var smtpIdColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.SmtpIdParquetColumn, token);
        var userAgentColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.UserAgent, token);
        var ipColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.Ip, token);
        var urlColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.Url, token);
        var reasonColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.Reason, token);
        var statusColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.Status, token);
        var responseColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.Response, token);
        var tlsColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.Tls, token);
        var attemptColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.Attempt, token);
        var typeColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.Type, token);
        var bounceClassificationColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.BounceClassification, token);
        var asmGroupIdColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.AsmGroupId, token);
        //var uniqueArgsColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.UniqueArgs, token);
        var marketingCampaignIdColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.MarketingCampaignId, token);
        var marketingCampaignNameColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.MarketingCampaignName, token);
        var poolNameColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.PoolNameParquetColumn, token);
        var poolIdColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.PoolIdParquetColumn, token);
        var sendAtColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.SendAt, token);

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

    private async Task<DataColumn?> TryReadColumnAsync(ParquetRowGroupReader rowGroupReader, ParquetSchema schema, string fieldName, CancellationToken token)
    {
        try
        {
            DataField? field = schema.GetDataFields().FirstOrDefault(f => f.Name == fieldName);
            return field == null ? null : await rowGroupReader.ReadColumnAsync(field, token);
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
