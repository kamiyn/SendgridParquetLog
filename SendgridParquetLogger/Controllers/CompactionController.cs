using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

using SendgridParquetLogger.Services;

using ZLogger;

namespace SendgridParquetLogger.Controllers;

[ApiController]
[Route("[controller]")]
public class CompactionController : ControllerBase
{
    private readonly ILogger<CompactionController> _logger;
    private readonly CompactionService _compactionService;

    public CompactionController(ILogger<CompactionController> logger, CompactionService compactionService)
    {
        _logger = logger;
        _compactionService = compactionService;
    }

    [HttpPost("start")]
    public async Task<IActionResult> StartCompaction(CancellationToken cancellationToken)
    {
        try
        {
            _logger.ZLogInformation("Compaction start request received");

            var result = await _compactionService.StartCompactionAsync(cancellationToken);

            if (!result.CanStart)
            {
                _logger.ZLogWarning($"Compaction cannot start: {result.Reason}");
                return Conflict(new { message = result.Reason });
            }

            _logger.ZLogInformation($"Compaction process initiated successfully");
            return Ok(new { message = "Compaction process initiated", startTime = result.StartTime });
        }
        catch (Exception ex)
        {
            _logger.ZLogError(ex, "Error starting compaction process");
            return StatusCode(500, new { message = "Internal server error occurred while starting compaction" });
        }
    }

    [HttpGet("status")]
    public async Task<IActionResult> GetCompactionStatus(CancellationToken cancellationToken)
    {
        try
        {
            var status = await _compactionService.GetCompactionStatusAsync(cancellationToken);

            if (status == null)
            {
                return NotFound(new { message = "No compaction status found" });
            }

            return Ok(status);
        }
        catch (Exception ex)
        {
            _logger.ZLogError(ex, "Error retrieving compaction status");
            return StatusCode(500, new { message = "Internal server error occurred while retrieving status" });
        }
    }
}
