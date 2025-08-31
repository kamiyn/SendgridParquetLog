using Microsoft.AspNetCore.Mvc;
using ZLogger;

using SendgridParquet.Shared;

using SendgridParquetLogger.Models;
using SendgridParquetLogger.Services;

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

            var parquetData = await parquetService.ConvertToParquetAsync(events);
            if (parquetData == null)
            {
                logger.ZLogError($"Failed to convert events to Parquet format");
                return StatusCode(500, "Failed to convert data to Parquet");
            }

            var timestamp = timeProvider.GetUtcNow();
            var fileName = $"{SendGridWebHookFields.ParquetSchemaVersion}/{timestamp:yyyy/MM/dd}/events_{timestamp:yyyyMMdd_HHmmss}_{Guid.NewGuid():N}.parquet";

            var uploadSuccess = await s3StorageService.UploadFileAsync(parquetData, fileName, now, ct);
            if (!uploadSuccess)
            {
                logger.ZLogError($"Failed to upload Parquet file to S3");
                return StatusCode(500, "Failed to upload data to storage");
            }

            logger.ZLogInformation($"Successfully processed and stored {events.Count} events in {fileName}");
            return Ok(new { message = "Events processed successfully", count = events.Count, file = fileName });
        }
        catch (Exception ex)
        {
            logger.ZLogError(ex, $"Error processing SendGrid webhook");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("health")]
    public IActionResult Health()
    {
        // 起動時に await s3Service.CreateBucketIfNotExistsAsync(); を行っており
        // 構成上の問題は検出される
        return Ok(new { status = "healthy", timestamp = timeProvider.GetUtcNow() });
    }
}
