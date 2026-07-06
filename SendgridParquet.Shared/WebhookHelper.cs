using System;
using System.Buffers;
using System.Collections.Generic;
using System.IO;
using System.IO.Pipelines;
using System.Linq;
using System.Net;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

using ZLogger;

namespace SendgridParquet.Shared;

public class WebhookHelper(
    ILogger<WebhookHelper> logger,
    ParquetService parquetService,
    RequestValidator requestValidator,
    S3StorageService s3StorageService,
    IOptions<SendGridOptions> sendGridOptions
)
{
    private readonly int _maxBodyBytes = Math.Max(1, sendGridOptions.Value.MaxBodyBytes);
    private readonly int _maxEventBytes = Math.Max(1, sendGridOptions.Value.MaxEventBytes);

    private async Task<(HttpStatusCode, IReadOnlyCollection<SendGridEvent>)> ReadSendGridEvents(
        PipeReader source,
        IHeaderDictionary requestHeaders,
        CancellationToken ct)
    {
        byte[] payloadBytes;
        try
        {
            payloadBytes = await GetPayload(source, requestHeaders, ct);
        }
        catch (ArgumentException ex)
        {
            logger.ZLogInformation(ex, $"GetPayload");
            return (HttpStatusCode.BadRequest, Array.Empty<SendGridEvent>());
        }

        var requestValidatorResult = requestValidator.VerifySignature(payloadBytes, requestHeaders);
        switch (requestValidatorResult)
        {
            case RequestValidator.RequestValidatorResult.Verified:
                // case RequestValidator.RequestValidatorResult.NotConfigured: // 許容しない
                try
                {
                    var events = JsonSerializer.Deserialize(payloadBytes, SendGridEventJsonContext.Default.SendGridEventArray) ?? [];
                    foreach (SendGridEvent sendGridEvent in events)
                    {
                        long estimatedBytes = SendGridEventValidator.EstimateEventBytes(sendGridEvent);
                        if (estimatedBytes > _maxEventBytes)
                        {
                            logger.ZLogInformation(
                                $"Rejected oversized SendGrid event. estimatedBytes={estimatedBytes}, limit={_maxEventBytes}");
                            return (HttpStatusCode.BadRequest, Array.Empty<SendGridEvent>());
                        }
                    }

                    return (HttpStatusCode.OK, events);
                }
                catch (JsonException ex)
                {
                    logger.ZLogInformation(ex, $"Invalid JSON payload. length={payloadBytes.Length}");
                    // return BadRequest
                }
                break;
            default:
                logger.ZLogInformation($"ValidatorResult: {requestValidatorResult}");
                break;
        }
        return (HttpStatusCode.BadRequest, Array.Empty<SendGridEvent>());
    }

    private async Task<byte[]> GetPayload(PipeReader reader, IHeaderDictionary headers, CancellationToken ct)
    {
        MemoryStream GetMemoryStream() =>
            headers.ContentLength switch
            {
                > 0 => new MemoryStream((int)Math.Min(headers.ContentLength.Value, _maxBodyBytes)),
                _ => new MemoryStream()
            };

        using MemoryStream ms = GetMemoryStream();
        long total = 0;
        try
        {
            while (true)
            {
                ReadResult result = await reader.ReadAsync(ct);
                ReadOnlySequence<byte> buffer = result.Buffer;
                foreach (var segment in buffer)
                {
                    total += segment.Length;
                    if (total > _maxBodyBytes)
                    {
                        reader.AdvanceTo(buffer.End);
                        throw new ArgumentException("Payload Too Large");
                    }
                    ms.Write(segment.Span);
                }
                reader.AdvanceTo(buffer.End);
                if (result.IsCompleted)
                {
                    break;
                }
                if (result.IsCanceled)
                {
                    throw new ArgumentException("PipeReader Canceled");
                }
            }

            if (ms.Length == 0)
            {
                throw new ArgumentException("PipeReader Empty");
            }

            return ms.ToArray();
        }
        finally
        {
            await reader.CompleteAsync();
        }
    }

    private async Task<List<HttpStatusCode>> WriteParquetGroupByYmd(
        IEnumerable<SendGridEvent> events,
        CancellationToken ct)
    {
        var results = new List<HttpStatusCode>(2);
        foreach (var grp in events
                     .Select(sendgridEvent => (sendgridEvent, timestamp: JstExtension.FromUnixTimeSecondsJst(sendgridEvent.Timestamp)))
                     .GroupBy(pair => new DateOnly(pair.timestamp.Year, pair.timestamp.Month, pair.timestamp.Day), pair => pair.sendgridEvent))
        {
            DateOnly targetDay = grp.Key;
            HttpStatusCode result = await WriteParquet(grp, targetDay, ct);
            results.Add(result);
        }
        return results;
    }

    private async ValueTask<HttpStatusCode> WriteParquet(
        IEnumerable<SendGridEvent> eventsEnumerable,
        DateOnly targetDay,
        CancellationToken ct)
    {
        var events = eventsEnumerable.ToArray();
        await using var parquetData = new MemoryStream(); // WebHook ペイロードは SendGrid 側で 1 メッセージ最大 768 KB (Event Webhook overview 参照)
        bool convertResult = await parquetService.ConvertToParquetAsync(events, parquetData);
        if (!convertResult)
        {
            logger.ZLogError($"Failed to convert events to Parquet format");
            return HttpStatusCode.InternalServerError;
        }

        // 書き込み直後のリードバック検証: 生成した Parquet を PUT する前に実際に読み返し、全 row group の
        // 全イベントをデコードできること、かつ読み取れた件数が書き込んだ件数と一致することを確認する。
        // これにより、書き込み時点で壊れた (compaction 時に IndexOutOfRangeException 等でデコード不能になる)
        // Parquet が S3 に保存されて 2xx を返し、SendGrid が再送しないまま欠損する事態を防ぐ。
        // 検証に失敗した場合は 500 を返し、SendGrid の再送に委ねる (書き込みは content-addressed で冪等)。
        try
        {
            int readableCount = await parquetService.CountReadableEventsAsync(parquetData, ct);
            if (readableCount != events.Length)
            {
                logger.ZLogError(
                    $"Parquet read-back verification count mismatch for {targetDay:yyyy/MM/dd}: wrote {events.Length}, read {readableCount}. Not storing; returning 500 for SendGrid retry.");
                return HttpStatusCode.InternalServerError;
            }
        }
        catch (OperationCanceledException) when (ct.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception ex)
        {
            logger.ZLogError(ex,
                $"Parquet read-back verification failed to decode for {targetDay:yyyy/MM/dd} ({events.Length} events). Not storing; returning 500 for SendGrid retry.");
            return HttpStatusCode.InternalServerError;
        }

        string fileName = SendGridPathUtility.GetParquetNonCompactionFileName(targetDay, parquetData);
        bool uploadSuccess = await s3StorageService.PutObjectAsync(parquetData, fileName, ct);
        if (!uploadSuccess)
        {
            logger.ZLogError($"Failed to upload Parquet file to S3");
            return HttpStatusCode.InternalServerError;
        }

        logger.ZLogInformation($"Successfully processed and stored {targetDay:yyyy/MM/dd} events in {fileName}");
        return HttpStatusCode.OK;
    }

    // 共通化された ReceiveSendGridEvents() の処理本体
    public async Task<(HttpStatusCode Status, string? Body)> ProcessReceiveSendGridEventsAsync(
        PipeReader reader,
        IHeaderDictionary headers,
        CancellationToken ct)
    {
        var (httpStatusCode, events) = await ReadSendGridEvents(reader, headers, ct);
        if (httpStatusCode != HttpStatusCode.OK)
        {
            logger.ZLogWarning($"Failed to validate request: {httpStatusCode}");
            string errorBody = "{\"error\":\"invalid_signature_or_payload\",\"code\":\"bad_request\"}";
            return (HttpStatusCode.BadRequest, errorBody);
        }

        try
        {
            if (!events.Any())
            {
                logger.ZLogWarning($"Received empty or null events");
                string errorBody = "{\"error\":\"no_events\",\"code\":\"bad_request\"}";
                return (HttpStatusCode.BadRequest, errorBody);
            }

            logger.ZLogInformation($"Received {events.Count} events from SendGrid");

            IReadOnlyCollection<HttpStatusCode> results = await WriteParquetGroupByYmd(events, ct);

            var nonOkResults = results.Where(x => x != HttpStatusCode.OK).ToArray();
            if (nonOkResults.Any())
            {
                return (nonOkResults.First(), null);
            }

            string okBody = $"{{\"count\":{events.Count}}}";
            return (HttpStatusCode.OK, okBody);
        }
        catch (Exception ex)
        {
            logger.ZLogError(ex, $"Error processing SendGrid webhook");
            return (HttpStatusCode.InternalServerError, null);
        }
    }
}
