using Microsoft.AspNetCore.Mvc;

using SendgridParquetLogger.Services;

using ZLogger;

namespace SendgridParquetLogger.Controllers;

[ApiController]
[Route("[controller]")]
public class CompactionController(
    ILogger<CompactionController> logger,
    TimeProvider timeProvider,
    CompactionService compactionService
) : ControllerBase
{
    [HttpPost("start")]
    public async Task<IActionResult> StartCompaction(CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow();
        try
        {
            logger.ZLogInformation($"Compaction start request received");

            var result = await compactionService.StartCompactionAsync(now, cancellationToken);

            if (!result.CanStart)
            {
                logger.ZLogWarning($"Compaction cannot start: {result.Reason}");
                return Conflict(new { message = result.Reason });
            }

            logger.ZLogInformation($"Compaction process initiated successfully");
            return Ok(new { message = "Compaction process initiated", startTime = result.StartTime });
        }
        catch (Exception ex)
        {
            logger.ZLogError(ex, $"Error starting compaction process");
            return StatusCode(500, new { message = "Internal server error occurred while starting compaction" });
        }
    }

    [HttpGet("status")]
    public async Task<IActionResult> GetCompactionStatus(CancellationToken cancellationToken)
    {
        try
        {
            var status = await compactionService.GetRunStatusAsync(cancellationToken);

            if (status == null)
            {
                return NotFound(new { message = "No compaction status found" });
            }

            return Ok(status);
        }
        catch (Exception ex)
        {
            logger.ZLogError(ex, $"Error retrieving compaction status");
            return StatusCode(500, new { message = "Internal server error occurred while retrieving status" });
        }
    }
}
