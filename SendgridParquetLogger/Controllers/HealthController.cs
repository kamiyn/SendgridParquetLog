#if UseSwagger
using Microsoft.AspNetCore.Mvc;

namespace SendgridParquetLogger.Controllers;

[ApiController]
public class HealthController(TimeProvider timeProvider) : ControllerBase
{
    [HttpGet("/health6QQl")]
    public IActionResult Health()
    {
        // 起動時 await s3Service.CreateBucketIfNotExistsAsync(); により
        // 構成上の問題は検出される
        var ts = timeProvider.GetUtcNow();
        string json = $"{{\"status\":\"healthy\",\"timestamp\":\"{ts:O}\"}}";
        return Content(json, "application/json");
    }
}
#endif
