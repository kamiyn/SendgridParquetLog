using System.Buffers;
using System.IO.Pipelines;
using System.Net;
using System.Text;
using System.Text.Json;

using Microsoft.AspNetCore.Mvc;

using SendgridParquet.Shared;

using SendgridParquetLogger.Helper;

using ZLogger;

namespace SendgridParquetLogger.Controllers;

[ApiController]
[Route("webhook")]
public class WebhookController(
    ILogger<WebhookController> logger,
    TimeProvider timeProvider,
    ParquetService parquetService,
    RequestValidator requestValidator,
    S3StorageService s3StorageService
) : ControllerBase
{
    private const int MaxBodyBytes = 1 * 1024 * 1024; // 1MB

    [HttpPost("sendgrid")]
    public async Task<IActionResult> ReceiveSendGridEvents(CancellationToken ct)
    {
        var (httpStatusCode, events) = await ReadSendGridEvents(Request.BodyReader, Request.Headers, ct);
        if (httpStatusCode != HttpStatusCode.OK)
        {
            logger.ZLogWarning($"Failed to read request body: {httpStatusCode}");
            return StatusCode((int)httpStatusCode, "Failed to read request body");
        }

        try
        {
            if (!events.Any())
            {
                logger.ZLogWarning($"Received empty or null events");
                return BadRequest("No events received");
            }

            logger.ZLogInformation($"Received {events.Count} events from SendGrid");

            ICollection<HttpStatusCode> results = await WriteParquetGroupByYmd(events, ct);

            var nonOkResults = results.Where(x => x != HttpStatusCode.OK).ToArray();
            return nonOkResults.Any()
                ? new StatusCodeResult((int)nonOkResults.First())
                : Ok(new
                {
#if DEBUG
                    message = "Events processed successfully",
#endif
                    count = events.Count
                });
        }
        catch (Exception ex)
        {
            logger.ZLogError(ex, $"Error processing SendGrid webhook");
            return StatusCode(500, "Internal server error");
        }
    }

    private  async Task<(HttpStatusCode, ICollection<SendGridEvent>)> ReadSendGridEvents(PipeReader reader,
        IHeaderDictionary requestHeaders, CancellationToken ct)
    {
        ReadResult result = await reader.ReadAtLeastAsync(MaxBodyBytes, ct);
        ReadOnlySequence<byte> buffer = result.Buffer;
        if (result.IsCanceled || result.IsCompleted && buffer.Length == 0)
        {
            return (HttpStatusCode.BadRequest , Array.Empty<SendGridEvent>());
        }
        // PipeReader の一般的使い方としては ループさせて AdvanceTo を呼び出すのが想定されているが、ここでは一度で必要分をすべて読み取る

        string payload = Encoding.UTF8.GetString(buffer);

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

    private async Task<List<HttpStatusCode>> WriteParquetGroupByYmd(IEnumerable<SendGridEvent> events, CancellationToken ct)
    {
        DateTimeOffset now = timeProvider.GetUtcNow();
        var results = new List<HttpStatusCode>(2); // 日をまたいだ場合に2つに分割される それ以上あった場合でも自動的に拡張されるので問題ない
        foreach (var grp in events
                     .Select(sendgridEvent => (sendgridEvent, timestamp: JstExtension.JstUnixTimeSeconds(sendgridEvent.Timestamp)))
                     .GroupBy(pair => new DateOnly(pair.timestamp.Year, pair.timestamp.Month, pair.timestamp.Day) /* 日単位で分割 */, pair => pair.sendgridEvent))
        {
            DateOnly targetDay = grp.Key;
            HttpStatusCode result = await WriteParquet(grp, targetDay, now, ct);
            results.Add(result);
        }
        return results;
    }

    private async ValueTask<HttpStatusCode> WriteParquet(IEnumerable<SendGridEvent> eventsEnumerable,
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
}
