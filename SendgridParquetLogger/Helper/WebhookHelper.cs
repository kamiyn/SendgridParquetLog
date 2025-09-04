using System.Buffers;
using System.IO.Pipelines;
using System.Net;
using System.Text.Json;

using SendgridParquet.Shared;

using ZLogger;

namespace SendgridParquetLogger.Helper;

public class WebhookHelper(
    ILogger<WebhookHelper> logger,
    TimeProvider timeProvider,
    ParquetService parquetService,
    RequestValidator requestValidator,
    S3StorageService s3StorageService,
    Microsoft.Extensions.Options.IOptions<SendgridParquet.Shared.SendGridOptions> sendGridOptions
)
{
    private readonly int _maxBodyBytes = Math.Max(1, sendGridOptions.Value.MaxBodyBytes);

    private async Task<(HttpStatusCode, ICollection<SendGridEvent>)> ReadSendGridEvents(
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
#if DEBUG
            // DEBUG ビルド時は NotConfigured も許可
            case RequestValidator.RequestValidatorResult.NotConfigured:
#endif
                try
                {
                    var events = JsonSerializer.Deserialize<SendGridEvent[]>(payloadBytes) ?? [];
                    return (HttpStatusCode.OK, events);
                }
                catch (JsonException ex)
                {
                    logger.ZLogInformation(ex, $"Invalid JSON payload. length={payloadBytes.Length}");
                    // return BadRequest
                }
                break;
            default:
                logger.ZLogInformation($"VerigySignature: {requestValidatorResult}");
                break;
        }
        return (HttpStatusCode.BadRequest, Array.Empty<SendGridEvent>());
    }

    private async Task<byte[]> GetPayload(PipeReader reader, IHeaderDictionary headers, CancellationToken ct)
    {
        int initialCapacity = 0;
        if (headers.ContentLength is long contentLength && contentLength > 0)
        {
            long capped = Math.Min(contentLength, _maxBodyBytes);
            if (capped <= int.MaxValue)
            {
                initialCapacity = (int)capped;
            }
        }

        using var ms = initialCapacity > 0 ? new MemoryStream(initialCapacity) : new MemoryStream();
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
            reader.Complete();
        }
    }

    private async Task<List<HttpStatusCode>> WriteParquetGroupByYmd(
        IEnumerable<SendGridEvent> events,
        CancellationToken ct)
    {
        DateTimeOffset now = timeProvider.GetUtcNow();
        var results = new List<HttpStatusCode>(2);
        foreach (var grp in events
                     .Select(sendgridEvent => (sendgridEvent, timestamp: JstExtension.JstUnixTimeSeconds(sendgridEvent.Timestamp)))
                     .GroupBy(pair => new DateOnly(pair.timestamp.Year, pair.timestamp.Month, pair.timestamp.Day), pair => pair.sendgridEvent))
        {
            DateOnly targetDay = grp.Key;
            HttpStatusCode result = await WriteParquet(grp, targetDay, now, ct);
            results.Add(result);
        }
        return results;
    }

    private async ValueTask<HttpStatusCode> WriteParquet(
        IEnumerable<SendGridEvent> eventsEnumerable,
        DateOnly targetDay,
        DateTimeOffset now,
        CancellationToken ct)
    {
        var events = eventsEnumerable.ToArray();
        await using var parquetData = await parquetService.ConvertToParquetAsync(events);
        if (parquetData == null)
        {
            logger.ZLogError($"Failed to convert events to Parquet format");
            return HttpStatusCode.InternalServerError;
        }

        string fileName = SendGridPathUtility.GetParquetNonCompactionFileName(targetDay, parquetData);
        bool uploadSuccess = await s3StorageService.PutObjectAsync(parquetData, fileName, now, ct);
        if (!uploadSuccess)
        {
            logger.ZLogError($"Failed to upload Parquet file to S3");
            return HttpStatusCode.InternalServerError;
        }

        logger.ZLogInformation($"Successfully processed and stored {targetDay:yyyy/MM/dd} events in {fileName}");
        return HttpStatusCode.OK;
    }

    // 共通化された ReceiveSendGridEvents() の処理本体
    public async Task<(HttpStatusCode Status, object? Body)> ProcessReceiveSendGridEventsAsync(
        PipeReader reader,
        IHeaderDictionary headers,
        CancellationToken ct)
    {
        var (httpStatusCode, events) = await ReadSendGridEvents(reader, headers, ct);
        if (httpStatusCode != HttpStatusCode.OK)
        {
            logger.ZLogWarning($"Failed to validate request: {httpStatusCode}");
            var errorBody = new { error = "invalid_signature_or_payload", code = "bad_request" };
            return (HttpStatusCode.BadRequest, errorBody);
        }

        try
        {
            if (!events.Any())
            {
                logger.ZLogWarning($"Received empty or null events");
                var errorBody = new { error = "no_events", code = "bad_request" };
                return (HttpStatusCode.BadRequest, errorBody);
            }

            logger.ZLogInformation($"Received {events.Count} events from SendGrid");

            ICollection<HttpStatusCode> results = await WriteParquetGroupByYmd(events, ct);

            var nonOkResults = results.Where(x => x != HttpStatusCode.OK).ToArray();
            if (nonOkResults.Any())
            {
                return (nonOkResults.First(), null);
            }

            object okBody = new
            {
#if DEBUG
                message = "Events processed successfully",
#endif
                count = events.Count
            };
            return (HttpStatusCode.OK, okBody);
        }
        catch (Exception ex)
        {
            logger.ZLogError(ex, $"Error processing SendGrid webhook");
            return (HttpStatusCode.InternalServerError, "Internal server error");
        }
    }
}
