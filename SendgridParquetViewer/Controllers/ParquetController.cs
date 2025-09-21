using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using SendgridParquet.Shared;

using SendgridParquetViewer.Models;
using SendgridParquetViewer.Services;

namespace SendgridParquetViewer.Controllers;

[ApiController]
[Authorize]
[Route("api/parquet")]
public class ParquetController(
    ParquetCatalogService catalogService,
    S3StorageService s3StorageService) : ControllerBase
{
    [HttpGet("month/{year:int}/{month:int}")]
    public async Task<ActionResult<ParquetMonthManifest>> GetMonthAsync(int year, int month, CancellationToken ct)
    {
        if (year is < 2000 or > 2999)
        {
            return BadRequest("Unsupported year");
        }

        if (month is < 1 or > 12)
        {
            return BadRequest("Invalid month");
        }

        var manifest = await catalogService.GetCompactionMonthManifestAsync(year, month, ct);
        return Ok(manifest);
    }

    [HttpGet("file")]
    public async Task<IActionResult> DownloadFileAsync([FromQuery] string key, CancellationToken ct)
    {
        if (!ParquetCatalogService.IsValidCompactionObjectKey(key))
        {
            return BadRequest("Invalid object key");
        }

        S3ObjectMetadata? metadata = await s3StorageService.GetObjectMetadataAsync(key, ct);
        if (metadata is null)
        {
            return NotFound();
        }

        byte[] content = await s3StorageService.GetObjectAsByteArrayAsync(key, ct);
        if (content.Length == 0)
        {
            return NotFound();
        }

        if (!string.IsNullOrEmpty(metadata.Sha256Hash))
        {
            Response.Headers.TryAdd("x-parquet-sha256", metadata.Sha256Hash);
        }

        if (!string.IsNullOrEmpty(metadata.ETag))
        {
            Response.Headers.TryAdd("ETag", metadata.ETag);
        }

        return File(content, "application/octet-stream", Path.GetFileName(key));
    }
}
