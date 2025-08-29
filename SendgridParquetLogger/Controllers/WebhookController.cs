using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

using SendgridParquet.Shared;

using SendgridParquetLogger.Models;
using SendgridParquetLogger.Services;

namespace SendgridParquetLogger.Controllers;

[ApiController]
[Route("webhook")]
public class WebhookController : ControllerBase
{
    private readonly ILogger<WebhookController> _logger;
    private readonly ParquetService _parquetService;
    private readonly S3StorageService _s3StorageService;

    public WebhookController(
        ILogger<WebhookController> logger,
        ParquetService parquetService,
        S3StorageService s3StorageService)
    {
        _logger = logger;
        _parquetService = parquetService;
        _s3StorageService = s3StorageService;
    }

    [HttpPost("sendgrid")]
    public async Task<IActionResult> ReceiveSendGridEvents([FromBody] List<SendGridEvent> events)
    {
        try
        {
            if (events == null || !events.Any())
            {
                _logger.LogWarning("Received empty or null events");
                return BadRequest("No events received");
            }

            _logger.LogInformation($"Received {events.Count} events from SendGrid");

            var parquetData = await _parquetService.ConvertToParquetAsync(events);
            if (parquetData == null || parquetData.Length == 0)
            {
                _logger.LogError("Failed to convert events to Parquet format");
                return StatusCode(500, "Failed to convert data to Parquet");
            }

            var timestamp = DateTimeOffset.UtcNow;
            var fileName = $"{SendGridWebHookFields.ParquetSchemaVersion}/{timestamp:yyyy/MM/dd}/events_{timestamp:yyyyMMdd_HHmmss}_{Guid.NewGuid():N}.parquet";

            var uploadSuccess = await _s3StorageService.UploadFileAsync(parquetData, fileName);
            if (!uploadSuccess)
            {
                _logger.LogError("Failed to upload Parquet file to S3");
                return StatusCode(500, "Failed to upload data to storage");
            }

            _logger.LogInformation($"Successfully processed and stored {events.Count} events in {fileName}");
            return Ok(new { message = "Events processed successfully", count = events.Count, file = fileName });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing SendGrid webhook");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("health")]
    public IActionResult Health()
    {
        // 起動時に await s3Service.CreateBucketIfNotExistsAsync(); を行っており
        // 構成上の問題は検出される
        return Ok(new { status = "healthy", timestamp = DateTimeOffset.UtcNow });
    }
}
