using SendgridParquet.Shared;

namespace SendgridParquetLogger.Helper;

internal class CreateBucketService(S3StorageService s3StorageService) : BackgroundService
{
    protected override Task ExecuteAsync(CancellationToken stoppingToken)
        => s3StorageService.CreateBucketIfNotExistsAsync(stoppingToken);
}
