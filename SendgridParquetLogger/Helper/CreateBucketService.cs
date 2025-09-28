using Microsoft.Extensions.Logging;

using SendgridParquet.Shared;

namespace SendgridParquetLogger.Helper;

internal class CreateBucketService : BackgroundService
{
    private readonly S3StorageService _s3StorageService;
    private readonly ILogger<CreateBucketService> _logger;

    public CreateBucketService(S3StorageService s3StorageService, ILogger<CreateBucketService> logger)
    {
        _s3StorageService = s3StorageService;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            await _s3StorageService.CreateBucketIfNotExistsAsync(stoppingToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create S3 bucket in background service.");
        }
    }
}
