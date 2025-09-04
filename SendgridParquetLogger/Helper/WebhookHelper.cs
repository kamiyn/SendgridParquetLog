using System.Buffers;
using System.IO;
using System.IO.Pipelines;
using System.Net;
using System.Text;
using System.Text.Json;

using Microsoft.AspNetCore.Http;

using SendgridParquet.Shared;

using ZLogger;

namespace SendgridParquetLogger.Helper;

public class WebhookHelper(
    ILogger<WebhookHelper> logger,
    TimeProvider timeProvider,
    ParquetService parquetService,
    RequestValidator requestValidator,
    S3StorageService s3StorageService
)
{
    private const int MaxBodyBytes = 1 * 1024 * 1024; // 1MB

    public async Task<(HttpStatusCode, ICollection<SendGridEvent>)> ReadSendGridEvents(
        PipeReader reader,
        IHeaderDictionary requestHeaders,
        CancellationToken ct)
    {
        using var ms = new MemoryStream();
        long total = 0;
        while (true)
        {
            ReadResult result = await reader.ReadAsync(ct);
            ReadOnlySequence<byte> buffer = result.Buffer;
            foreach (var segment in buffer)
            {
                total += segment.Length;
                if (total > MaxBodyBytes)
                {
                    reader.AdvanceTo(buffer.End);
                    return (HttpStatusCode.BadRequest, Array.Empty<SendGridEvent>());
                }
                ms.Write(segment.Span);
            }
            reader.AdvanceTo(buffer.End);
            if (result.IsCompleted)
            {
                break;
            }
        }

        if (ms.Length == 0)
        {
            return (HttpStatusCode.BadRequest, Array.Empty<SendGridEvent>());
        }

        string payload = Encoding.UTF8.GetString(ms.GetBuffer(), 0, (int)ms.Length);

        switch (requestValidator.VerifySignature(payload, requestHeaders))
        {
            case RequestValidator.RequestValidatorResult.Verified:
#if DEBUG
            // DEBUG ビルド時は NotConfigured も許可
            case RequestValidator.RequestValidatorResult.NotConfigured:
#endif
                try
                {
                    var events = JsonSerializer.Deserialize<SendGridEvent[]>(payload) ?? [];
                    return (HttpStatusCode.OK, events);
                }
                catch (JsonException)
                {
                    // return BadRequest
                }
                break;
        }
        return (HttpStatusCode.BadRequest, Array.Empty<SendGridEvent>());
    }

    public async Task<List<HttpStatusCode>> WriteParquetGroupByYmd(
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

    public async ValueTask<HttpStatusCode> WriteParquet(
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
            logger.ZLogWarning($"Failed to read request body: {httpStatusCode}");
            return (httpStatusCode, "Failed to read request body");
        }

        try
        {
            if (!events.Any())
            {
                logger.ZLogWarning($"Received empty or null events");
                return (HttpStatusCode.BadRequest, "No events received");
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
