using System.Net;

using Microsoft.AspNetCore.Mvc;

using SendgridParquet.Shared;

using SendgridParquetLogger.Models;
using SendgridParquetLogger.Services;

using ZLogger;

namespace SendgridParquetLogger.Controllers;

[ApiController]
[Route("webhook")]
public class WebhookController(
    ILogger<WebhookController> logger,
    TimeProvider timeProvider,
    ParquetService parquetService,
    S3StorageService s3StorageService
) : ControllerBase
{
    [HttpPost("sendgrid")]
    public async Task<IActionResult> ReceiveSendGridEvents([FromBody] List<SendGridEvent> events, CancellationToken ct)
    {
        var now = timeProvider.GetUtcNow();
        try
        {
            if (!events.Any())
            {
                logger.ZLogWarning($"Received empty or null events");
                return BadRequest("No events received");
            }

            logger.ZLogInformation($"Received {events.Count} events from SendGrid");

            var results = new List<HttpStatusCode>();
            foreach (var grp in events
                .Select(sendgridEvent => (sendgridEvent, timestamp: JstExtension.JstUnixTimeSeconds(sendgridEvent.Timestamp)))
                .GroupBy(pair => new DateOnly(pair.timestamp.Year, pair.timestamp.Month, pair.timestamp.Day) /* 日単位で分割 */, pair => pair.sendgridEvent))
            {
                DateOnly targetDay = grp.Key;
                HttpStatusCode result = await WriteParquet(grp, targetDay, now, ct);
                results.Add(result);
            }

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

        string fileName = GetParquetFileName(targetDay, parquetData);
        bool uploadSuccess = await s3StorageService.PutObjectAsync(parquetData, fileName, now, ct);
        if (!uploadSuccess)
        {
            logger.ZLogError($"Failed to upload Parquet file to S3");
            return HttpStatusCode.InternalServerError;
        }

        logger.ZLogInformation($"Successfully processed and stored {targetDay:yyyy/MM/dd} events in {fileName}");
        return HttpStatusCode.OK;
    }

    /// <summary>
    /// 書き込み途中で失敗し webhook が再送された場合に上書きされることを期待し
    /// 書き込む内容が一致していれば同じファイル名を生成する
    /// </summary>
    private static string GetParquetFileName(DateOnly targetDay, Stream parquetData)
    {
        // DateOnlyをDateTimeに変換してユーティリティクラスに渡す
        var dateTime = targetDay.ToDateTime(TimeOnly.MinValue);
        return SendGridPathUtility.GetParquetNonCompactionFileName(dateTime, parquetData);
    }
}
