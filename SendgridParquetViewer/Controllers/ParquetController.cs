using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

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
    private readonly ParquetCatalogService _catalogService = catalogService;
    private readonly S3StorageService _s3StorageService = s3StorageService;

    [HttpGet("month/{year:int}/{month:int}")]
    public async Task<ActionResult<ParquetMonthManifest>> GetMonthAsync(int year, int month, CancellationToken ct)
    {
        if (year is < 2000 or > 2100)
        {
            return BadRequest("Unsupported year");
        }

        if (month is < 1 or > 12)
        {
            return BadRequest("Invalid month");
        }

        var manifest = await _catalogService.GetCompactionMonthManifestAsync(year, month, ct);
        return Ok(manifest);
    }

    [HttpGet("file")]
    public async Task<IActionResult> DownloadFileAsync([FromQuery] string key, CancellationToken ct)
    {
        if (!ParquetCatalogService.IsValidCompactionObjectKey(key))
        {
            return BadRequest("Invalid object key");
        }

        S3ObjectMetadata? metadata = await _s3StorageService.GetObjectMetadataAsync(key, ct);
        if (metadata is null)
        {
            return NotFound();
        }

        byte[] content = await _s3StorageService.GetObjectAsByteArrayAsync(key, ct);
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

        var fileName = Path.GetFileName(key);
        return File(content, "application/octet-stream", fileName);
    }
}
