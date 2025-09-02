using System.Text.Json;

using Microsoft.Extensions.Options;

using SendgridParquet.Shared;

using SendgridParquetViewer.Models;
using SendgridParquetViewer.Options;

namespace SendgridParquetViewer.Services;

public class CompactionService(
    ILogger<CompactionService> logger,
    TimeProvider timeProvider,
    S3StorageService s3StorageService
)
{
    private static readonly JsonSerializerOptions JsonOptions = new() { WriteIndented = true };
    private static readonly TimeSpan LockDuration = TimeSpan.FromMinutes(30);
    private static readonly TimeSpan MaxRunningDuration = TimeSpan.FromDays(3);
    private static readonly string InstanceId = $"{Environment.MachineName}_{Guid.NewGuid():N}";

    public async Task<RunStatus?> GetRunStatusAsync(CancellationToken cancellationToken = default)
    {
        var now = timeProvider.GetUtcNow();
        var (runJsonPath, _) = SendGridPathUtility.GetS3CompactionRunFile();
        try
        {
            var jsonContent = await s3StorageService.GetObjectAsByteArrayAsync(runJsonPath, now, cancellationToken);
            if (!jsonContent.Any())
            {
                return null;
            }

            return JsonSerializer.Deserialize<RunStatus>(jsonContent);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Unable to read run status from {RunJsonPath}", runJsonPath);
            return null;
        }
    }

    public async Task<CompactionStartResult> StartCompactionAsync(CancellationToken cancellationToken = default)
    {
        var now = timeProvider.GetUtcNow();
        var lockId = Guid.NewGuid().ToString();

        var lockAcquired = await TryAcquireLockAsync(lockId, cancellationToken);
        if (!lockAcquired)
        {
            return new CompactionStartResult
            {
                CanStart = false,
                Reason = "Unable to acquire distributed lock for compaction process"
            };
        }

        try
        {
            RunStatus? currentStatus = await GetRunStatusAsync(cancellationToken);
            if (currentStatus is { EndTime: null })
            {
                var daysSinceStart = (now - currentStatus.StartTime);
                if (daysSinceStart <= MaxRunningDuration)
                {
                    return new CompactionStartResult
                    {
                        CanStart = false,
                        Reason = $"Compaction is already running (started {currentStatus.StartTime:s})"
                    };
                }
            }

            var targetDays = await GetTargetDaysAsync(cancellationToken);
            var runStatusNew = new RunStatus
            {
                LockId = lockId,
                StartTime = now,
                EndTime = null,
                TargetDays = targetDays.Select(x => x.dateOnly).ToArray(),
                TargetPathPrefixes = targetDays.Select(x => x.pathPrefix).ToArray(),
            };

            // Save initial status
            await SaveRunStatusAsync(runStatusNew, cancellationToken);

            // Start background processing
            _ = Task.Run(() => ExecuteCompactionAsync(runStatusNew), CancellationToken.None);

            return new CompactionStartResult
            {
                CanStart = true,
                StartTime = now,
                Reason = "Compaction started successfully"
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error during compaction start");
            await ReleaseLockAsync(lockId, cancellationToken);
            throw;
        }
    }

    private async Task<IList<(DateOnly dateOnly, string pathPrefix)>> GetTargetDaysAsync(CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow();
        var targetDays = new List<(DateOnly dateOnly, string pathPrefix)>();
        try
        {
            var yearDir = await s3StorageService.ListDirectoriesAsync(
                SendGridPathUtility.GetS3NonCompactionPrefix(null, null, null), now, cancellationToken);

            foreach (int year in yearDir.Select(d => int.TryParse(d, out int v) ? v : 0).Where(year => year > 0))
            {
                var yearPath = SendGridPathUtility.GetS3NonCompactionPrefix(year, null, null);
                var monthDirs = await s3StorageService.ListDirectoriesAsync(yearPath, now, cancellationToken);

                foreach (var month in monthDirs.Select(d => int.TryParse(d, out int v) ? v : 0).Where(month => month > 0))
                {
                    var monthPath = SendGridPathUtility.GetS3NonCompactionPrefix(year, month, null);
                    var dayDirs = await s3StorageService.ListDirectoriesAsync(monthPath, now, cancellationToken);

                    foreach (var day in dayDirs.Select(d => int.TryParse(d, out int v) ? v : 0).Where(day => day > 0))
                    {
                        var dayPath = SendGridPathUtility.GetS3NonCompactionPrefix(year, month, day);
                        DateOnly dateOnly = new(year, month, day);
                        targetDays.Add((dateOnly, dayPath));
                    }
                }
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving target dates for compaction");
        }

        return targetDays;
    }

    private async Task SaveRunStatusAsync(RunStatus status, CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow();
        var (runJsonPath, _) = SendGridPathUtility.GetS3CompactionRunFile();
        await using var ms = new MemoryStream();
        await JsonSerializer.SerializeAsync(ms, status, JsonOptions, cancellationToken);
        await s3StorageService.PutObjectAsync(ms, runJsonPath, now, cancellationToken);
    }

    private async Task<bool> TryAcquireLockAsync(string lockId, CancellationToken cancellationToken)
    {
        var (_, lockPath) = SendGridPathUtility.GetS3CompactionRunFile();
        var now = timeProvider.GetUtcNow();

        // Try to get existing lock
        var existingLockJson = await s3StorageService.GetObjectAsByteArrayAsync(lockPath, now, cancellationToken);

        if (existingLockJson.Any())
        {
            var existingLock = JsonSerializer.Deserialize<LockInfo>(existingLockJson);
            if (existingLock != null && existingLock.ExpiresAt > now)
            {
                logger.LogInformation("Lock is held by {OwnerId} until {ExpiresAt}",
                    existingLock.OwnerId, existingLock.ExpiresAt);
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
            lockPath, lockJson, existingLockJson, now, cancellationToken);

        if (success)
        {
            logger.LogInformation("Lock acquired successfully. Lock ID: {LockId}, Expires at: {ExpiresAt}",
                lockId, lockInfo.ExpiresAt);
        }

        return success;
    }

    private async Task ReleaseLockAsync(string lockId, CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow();
        var (_, lockPath) = SendGridPathUtility.GetS3CompactionRunFile();
        var existingLockJson = await s3StorageService.GetObjectAsByteArrayAsync(lockPath, now, cancellationToken);

        if (existingLockJson.Any())
        {
            var existingLock = JsonSerializer.Deserialize<LockInfo>(existingLockJson);
            if (existingLock?.LockId == lockId)
            {
                await s3StorageService.DeleteObjectAsync(lockPath, now, cancellationToken);
                logger.LogInformation("Lock released successfully. Lock ID: {LockId}", lockId);
            }
        }
    }

    private async Task ExecuteCompactionAsync(RunStatus runStatus)
    {
        logger.LogInformation("Compaction process started at {StartTime} with {TargetDaysCount} target dates",
            runStatus.StartTime, runStatus.TargetDays.Count);

        try
        {
            foreach ((DateOnly dateOnly, string pathPrefix) in runStatus.TargetDays.Zip(runStatus.TargetPathPrefixes))
            {
                logger.LogInformation("Starting compaction for date {Date} at path {Path}", dateOnly, pathPrefix);
                try
                {
                    // TODO: Implement actual compaction logic
                    await Task.Delay(1000);
                    logger.LogInformation("Completed compaction for date {Date} at path {Path}", dateOnly, pathPrefix);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error during compaction for date {Date} at path {Path}", dateOnly, pathPrefix);
                    // Continue with other dates
                }
            }
        }
        finally
        {
            await ReleaseLockAsync(runStatus.LockId, CancellationToken.None);
        }

        runStatus.EndTime = timeProvider.GetUtcNow();
        await SaveRunStatusAsync(runStatus, CancellationToken.None);
        logger.LogInformation("Compaction process completed at {EndTime}", runStatus.EndTime);
    }
}
