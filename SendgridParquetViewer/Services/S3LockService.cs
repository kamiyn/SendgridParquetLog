using System.Text.Json;

using SendgridParquet.Shared;

using SendgridParquetViewer.Models;

using ZLogger;

namespace SendgridParquetViewer.Services;

public class S3LockService(
    ILogger<S3LockService> logger,
    TimeProvider timeProvider,
    S3StorageService s3StorageService)
{
    private static readonly TimeSpan LockDuration = TimeSpan.FromMinutes(30);
    private static readonly string InstanceId = $"{Environment.MachineName}_{Guid.NewGuid():N}";
    private static readonly JsonSerializerOptions JsonOptions = new() { WriteIndented = true };

    public async Task<bool> TryAcquireLockAsync(string lockId, CancellationToken cancellationToken)
    {
        var (_, lockPath) = SendGridPathUtility.GetS3CompactionRunFile();
        var now = timeProvider.GetUtcNow();

        // Try to get existing lock
        var existingLockJson = await s3StorageService.GetObjectAsByteArrayAsync(lockPath, cancellationToken);
        if (existingLockJson.Any())
        {
            var existingLock = JsonSerializer.Deserialize<LockInfo>(existingLockJson);
            if (existingLock != null && existingLock.ExpiresAt > now)
            {
                logger.ZLogInformation($"Lock is held by {existingLock.OwnerId} until {existingLock.ExpiresAt}");
                return false;
            }
        }

        // Create new lock
        var lockInfo = new LockInfo
        {
            LockId = lockId,
            OwnerId = InstanceId,
            AcquiredAt = now,
            ExpiresAt = now.Add(LockDuration),
            HostName = Environment.MachineName
        };

        var lockJson = JsonSerializer.SerializeToUtf8Bytes(lockInfo, JsonOptions);

        // Use conditional put with ETag to ensure atomic operation
        var success = await s3StorageService.PutObjectWithConditionAsync(
            lockPath, lockJson, existingLockJson, cancellationToken);

        if (success)
        {
            logger.ZLogInformation($"Lock acquired successfully. Lock ID: {lockId}, Expires at: {lockInfo.ExpiresAt}");
        }

        return success;
    }

    public async Task ExtendLockExpirationAsync(string lockId, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(lockId))
        {
            return;
        }

        var (_, lockPath) = SendGridPathUtility.GetS3CompactionRunFile();
        byte[] existingLockJson = await s3StorageService.GetObjectAsByteArrayAsync(lockPath, cancellationToken);

        if (!existingLockJson.Any())
        {
            return;
        }

        LockInfo? existingLock;
        try
        {
            existingLock = JsonSerializer.Deserialize<LockInfo>(existingLockJson);
        }
        catch (Exception ex)
        {
            logger.ZLogWarning($"Failed to deserialize existing lock info while extending lock expiration: {ex}");
            return;
        }

        if (existingLock == null)
        {
            return;
        }

        if (!string.Equals(existingLock.LockId, lockId, StringComparison.Ordinal))
        {
            return;
        }

        if (!string.Equals(existingLock.OwnerId, InstanceId, StringComparison.Ordinal))
        {
            return;
        }

        var now = timeProvider.GetUtcNow();
        existingLock.ExpiresAt = now.Add(LockDuration);
        byte[] updatedLockJson = JsonSerializer.SerializeToUtf8Bytes(existingLock, JsonOptions);
        bool updated = await s3StorageService.PutObjectWithConditionAsync(lockPath, updatedLockJson, existingLockJson, cancellationToken);

        if (updated)
        {
            logger.ZLogDebug($"Extended compaction lock {lockId} until {existingLock.ExpiresAt:s}");
        }
        else
        {
            logger.ZLogWarning($"Failed to extend compaction lock {lockId} due to conditional write conflict");
        }
    }

    public async Task ReleaseLockAsync(string lockId, CancellationToken cancellationToken)
    {
        var (_, lockPath) = SendGridPathUtility.GetS3CompactionRunFile();
        var existingLockJson = await s3StorageService.GetObjectAsByteArrayAsync(lockPath, cancellationToken);

        if (existingLockJson.Any())
        {
            var existingLock = JsonSerializer.Deserialize<LockInfo>(existingLockJson);
            if (existingLock?.LockId == lockId)
            {
                await s3StorageService.DeleteObjectAsync(lockPath, cancellationToken);
                logger.ZLogInformation($"Lock released successfully. Lock ID: {lockId}");
            }
        }
    }
}
