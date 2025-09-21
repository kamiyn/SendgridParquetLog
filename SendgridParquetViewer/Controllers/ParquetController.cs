using System;
using System.IO;

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
    private static readonly char[] ValidHashCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".ToCharArray();

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

        return await DownloadParquetAsync(key, ct);
    }

    [HttpGet("compaction/{year:int}/{month:int}/{day:int}/{hour:int}/{hash}.parquet")]
    public async Task<IActionResult> DownloadCompactionAsync(int year, int month, int day, int hour, string hash, CancellationToken ct)
    {
        if (!IsValidDate(year, month, day))
        {
            return BadRequest("Invalid date");
        }

        if (hour is < 0 or > 23)
        {
            return BadRequest("Invalid hour");
        }

        if (!IsValidHash(hash))
        {
            return BadRequest("Invalid hash");
        }

        var prefix = SendGridPathUtility.GetS3CompactionPrefix(year, month, day, hour);
        var key = $"{prefix}/{hash}{SendGridPathUtility.ParquetFileExtension}";
        return await DownloadParquetAsync(key, ct);
    }

    [HttpGet("raw/{year:int}/{month:int}/{day:int}/{hash}.parquet")]
    public async Task<IActionResult> DownloadRawAsync(int year, int month, int day, string hash, CancellationToken ct)
    {
        if (!IsValidDate(year, month, day))
        {
            return BadRequest("Invalid date");
        }

        if (!IsValidHash(hash))
        {
            return BadRequest("Invalid hash");
        }

        var prefix = SendGridPathUtility.GetS3NonCompactionPrefix(year, month, day);
        var key = $"{prefix}/{hash}{SendGridPathUtility.ParquetFileExtension}";
        return await DownloadParquetAsync(key, ct);
    }

    private async Task<IActionResult> DownloadParquetAsync(string key, CancellationToken ct)
    {
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

    private static bool IsValidDate(int year, int month, int day)
    {
        if (year is < 2000 or > 2999)
        {
            return false;
        }

        if (month is < 1 or > 12)
        {
            return false;
        }

        return day >= 1 && day <= DateTime.DaysInMonth(year, month);
    }

    private static bool IsValidHash(string hash)
    {
        if (string.IsNullOrEmpty(hash) || hash.Length > 128)
        {
            return false;
        }

        foreach (char c in hash)
        {
            if (Array.IndexOf(ValidHashCharacters, c) < 0)
            {
                return false;
            }
        }

        return true;
    }
}
