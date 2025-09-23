using System.Buffers;
using System.IO.Pipelines;
using System.Net;
using System.Text.Json;

using Microsoft.Extensions.Options;

using SendgridParquet.Shared;

using ZLogger;

namespace SendgridParquetLogger.Helper;

public class WebhookHelper(
    ILogger<WebhookHelper> logger,
    ParquetService parquetService,
    RequestValidator requestValidator,
    S3StorageService s3StorageService,
    IOptions<SendGridOptions> sendGridOptions
)
{
    private readonly int _maxBodyBytes = Math.Max(1, sendGridOptions.Value.MaxBodyBytes);

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
                    var events = JsonSerializer.Deserialize(payloadBytes, Models.AppJsonSerializerContext.Default.SendGridEventArray) ?? [];
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
                     .Select(sendgridEvent => (sendgridEvent, timestamp: JstExtension.JstUnixTimeSeconds(sendgridEvent.Timestamp)))
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
        await using var parquetData = await parquetService.ConvertToParquetAsync(events);
        if (parquetData == null)
        {
            logger.ZLogError($"Failed to convert events to Parquet format");
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
