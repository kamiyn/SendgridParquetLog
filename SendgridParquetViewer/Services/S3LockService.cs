using System.Text.Json;

using SendgridParquet.Shared;

using SendgridParquetViewer.Models;

using ZLogger;

namespace SendgridParquetViewer.Services;

public interface IS3LockService
{
    TimeSpan LockDuration { get; }
    Task<bool> TryAcquireLockAsync(string lockId, CancellationToken ct);
    Task ExtendLockExpirationAsync(string lockId, CancellationToken ct);
    Task ReleaseLockAsync(string lockId, CancellationToken ct);
    Task<bool> TryInvalidateExpiredLockAsync(LockInfo expectedLock, CancellationToken ct);
    Task<bool> TryForceInvalidateLockAsync(LockInfo expectedLock, CancellationToken ct);
    Task<LockInfo?> GetLockInfoAsync(CancellationToken ct);
}

public class S3LockService(
    ILogger<S3LockService> logger,
    TimeProvider timeProvider,
    S3StorageService s3StorageService) : IS3LockService
{
    public TimeSpan LockDuration { get; } = TimeSpan.FromMinutes(30);
    private static readonly string InstanceId = $"{Environment.MachineName}_{Guid.NewGuid():N}";

    private static bool IsSameLock(LockInfo a, LockInfo b) =>
        string.Equals(a.LockId, b.LockId, StringComparison.Ordinal)
        && string.Equals(a.OwnerId, b.OwnerId, StringComparison.Ordinal)
        && a.AcquiredAt == b.AcquiredAt;

    public async Task<bool> TryAcquireLockAsync(string lockId, CancellationToken ct)
    {
        var (_, lockPath) = SendGridPathUtility.GetS3CompactionRunFile();
        var now = timeProvider.GetUtcNow();

        // Try to get existing lock
        var result = await s3StorageService.GetObjectWithETagAsync(lockPath, ct);
        if (result.Content.Length > 0)
        {
            LockInfo? existingLock;
            try
            {
                existingLock = JsonSerializer.Deserialize<LockInfo>(result.Content, AppJsonSerializerContext.Default.LockInfo);
            }
            catch (Exception ex)
            {
                logger.ZLogWarning(ex, $"Failed to deserialize existing lock info while acquiring lock. Refusing to acquire lock until lock is manually resolved. lockPath:{lockPath}");
                return false;
            }

            if (existingLock != null && existingLock.ExpiresAt > now)
            {
                logger.ZLogInformation($"Lock is held by {existingLock.OwnerId} until {existingLock.ExpiresAt} lockPath:{lockPath}");
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

        var lockJson = JsonSerializer.SerializeToUtf8Bytes(lockInfo, AppJsonSerializerContext.Default.LockInfo);

        // Use conditional put with ETag to ensure atomic operation
        var success = await s3StorageService.PutObjectWithConditionAsync(
            lockPath, lockJson, result.ETag, ct);

        if (success)
        {
            logger.ZLogInformation($"Lock acquired successfully. Lock ID: {lockId}, Expires at: {lockInfo.ExpiresAt} lockPath:{lockPath}");
        }

        return success;
    }

    public async Task ExtendLockExpirationAsync(string lockId, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(lockId))
        {
            return;
        }

        var (_, lockPath) = SendGridPathUtility.GetS3CompactionRunFile();
        var result = await s3StorageService.GetObjectWithETagAsync(lockPath, ct);

        if (result.Content.Length == 0)
        {
            return;
        }

        LockInfo? existingLock;
        try
        {
            existingLock = JsonSerializer.Deserialize<LockInfo>(result.Content, AppJsonSerializerContext.Default.LockInfo);
        }
        catch (Exception ex)
        {
            logger.ZLogWarning(ex, $"Failed to deserialize existing lock info while extending lock expiration. lockPath:{lockPath}");
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
        byte[] updatedLockJson = JsonSerializer.SerializeToUtf8Bytes(existingLock, AppJsonSerializerContext.Default.LockInfo);
        bool updated = await s3StorageService.PutObjectWithConditionAsync(lockPath, updatedLockJson, result.ETag, ct);

        if (updated)
        {
            logger.ZLogDebug($"Extended compaction lock {lockId} until {existingLock.ExpiresAt:s} lockPath:{lockPath}");
        }
        else
        {
            logger.ZLogWarning($"Failed to extend compaction lock {lockId} due to conditional write conflict lockPath:{lockPath}");
        }
    }

    public async Task ReleaseLockAsync(string lockId, CancellationToken ct)
    {
        var (_, lockPath) = SendGridPathUtility.GetS3CompactionRunFile();
        var result = await s3StorageService.GetObjectWithETagAsync(lockPath, ct);

        if (result.Content.Length == 0)
        {
            return;
        }

        LockInfo? existingLock;
        try
        {
            existingLock = JsonSerializer.Deserialize<LockInfo>(result.Content, AppJsonSerializerContext.Default.LockInfo);
        }
        catch (Exception ex)
        {
            logger.ZLogWarning(ex, $"Failed to deserialize lock info while releasing lock. lockPath:{lockPath}");
            return;
        }

        if (existingLock == null
            || !string.Equals(existingLock.LockId, lockId, StringComparison.Ordinal)
            || !string.Equals(existingLock.OwnerId, InstanceId, StringComparison.Ordinal))
        {
            return;
        }

        existingLock.ExpiresAt = timeProvider.GetUtcNow();
        byte[] updatedLockJson = JsonSerializer.SerializeToUtf8Bytes(existingLock, AppJsonSerializerContext.Default.LockInfo);
        bool updated = await s3StorageService.PutObjectWithConditionAsync(lockPath, updatedLockJson, result.ETag, ct);
        if (updated)
        {
            logger.ZLogInformation($"Lock released successfully (expired via CAS update). Lock ID: {lockId} lockPath:{lockPath}");
        }
        else
        {
            logger.ZLogInformation($"Skip releasing lock due to conditional write conflict. Lock ID: {lockId} lockPath:{lockPath}");
        }
    }

    public async Task<bool> TryInvalidateExpiredLockAsync(LockInfo expectedLock, CancellationToken ct)
    {
        var (_, lockPath) = SendGridPathUtility.GetS3CompactionRunFile();
        var result = await s3StorageService.GetObjectWithETagAsync(lockPath, ct);
        if (result.Content.Length == 0)
        {
            return true;
        }

        LockInfo? currentLock;
        try
        {
            currentLock = JsonSerializer.Deserialize<LockInfo>(result.Content, AppJsonSerializerContext.Default.LockInfo);
        }
        catch (Exception ex)
        {
            logger.ZLogWarning(ex, $"Failed to deserialize lock info while invalidating expired lock. lockPath:{lockPath}");
            return false;
        }

        if (currentLock == null || !IsSameLock(currentLock, expectedLock))
        {
            return false;
        }

        var now = timeProvider.GetUtcNow();
        if (currentLock.ExpiresAt > now)
        {
            return false;
        }

        currentLock.ExpiresAt = now;
        byte[] lockJson = JsonSerializer.SerializeToUtf8Bytes(currentLock, AppJsonSerializerContext.Default.LockInfo);
        bool updated = await s3StorageService.PutObjectWithConditionAsync(lockPath, lockJson, result.ETag, ct);
        if (updated)
        {
            logger.ZLogWarning($"Expired lock invalidated via CAS update. Lock ID: {currentLock.LockId} lockPath:{lockPath}");
        }

        // Note: `false` here means the CAS update failed (e.g., the lock was concurrently changed
        // or deleted after we read it), which the caller treats as "lock state changed concurrently".
        return updated;
    }

    public async Task<bool> TryForceInvalidateLockAsync(LockInfo expectedLock, CancellationToken ct)
    {
        var (_, lockPath) = SendGridPathUtility.GetS3CompactionRunFile();
        var result = await s3StorageService.GetObjectWithETagAsync(lockPath, ct);
        if (result.Content.Length == 0)
        {
            return true;
        }

        LockInfo? currentLock;
        try
        {
            currentLock = JsonSerializer.Deserialize<LockInfo>(result.Content, AppJsonSerializerContext.Default.LockInfo);
        }
        catch (Exception ex)
        {
            logger.ZLogWarning(ex, $"Failed to deserialize lock info while force invalidating lock. lockPath:{lockPath}");
            return false;
        }

        if (currentLock == null || !IsSameLock(currentLock, expectedLock))
        {
            return false;
        }

        currentLock.ExpiresAt = timeProvider.GetUtcNow();
        byte[] lockJson = JsonSerializer.SerializeToUtf8Bytes(currentLock, AppJsonSerializerContext.Default.LockInfo);
        bool updated = await s3StorageService.PutObjectWithConditionAsync(lockPath, lockJson, result.ETag, ct);
        if (updated)
        {
            logger.ZLogWarning($"Lock force invalidated via CAS update. Lock ID: {currentLock.LockId} lockPath:{lockPath}");
        }

        return updated;
    }

    public async Task<LockInfo?> GetLockInfoAsync(CancellationToken ct)
    {
        var (_, lockPath) = SendGridPathUtility.GetS3CompactionRunFile();
        var result = await s3StorageService.GetObjectWithETagAsync(lockPath, ct);
        if (result.Content.Length == 0)
        {
            return null;
        }

        try
        {
            return JsonSerializer.Deserialize<LockInfo>(result.Content, AppJsonSerializerContext.Default.LockInfo);
        }
        catch (Exception ex)
        {
            logger.ZLogWarning(ex, $"Failed to deserialize lock info. lockPath:{lockPath}");
            return null;
        }
    }

}
