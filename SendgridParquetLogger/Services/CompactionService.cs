using System.Text.Json;

using SendgridParquet.Shared;

using SendgridParquetLogger.Models;

using ZLogger;

namespace SendgridParquetLogger.Services;

public class CompactionService(
    ILogger<CompactionService> logger,
    TimeProvider timeProvider,
    S3StorageService s3StorageService
)
{
    private static readonly string s_instanceId = $"{Environment.MachineName}_{Guid.NewGuid():N}";
    private static readonly TimeSpan s_lockFileDuration = TimeSpan.FromMinutes(30);
    /// <summary>
    /// この日数を超えて実行されている場合は強制的に新しいジョブを開始する
    /// </summary>
    private static readonly TimeSpan s_maxRunningDuration = TimeSpan.FromDays(3);

    public async Task<CompactionStartResult> StartCompactionAsync(DateTimeOffset startTime, CancellationToken cancellationToken)
    {
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
                var daysSinceStart = (startTime - currentStatus.StartTime);
                if (daysSinceStart <= s_maxRunningDuration)
                {
                    return new CompactionStartResult
                    {
                        CanStart = false,
                        Reason = $"Compaction is already running (started {currentStatus.StartTime:s})"
                    };
                }
            }

            var targetDays = await GetTargetDaysAsync(cancellationToken);
            var runStatus = new RunStatus
            {
                LockId = lockId,
                StartTime = startTime,
                EndTime = null,
                TargetDays = targetDays.Select(x => x.dateOnly).ToArray(),
                TargetPathPrefixes = targetDays.Select(x => x.pathPrefix).ToArray(),
            };

            // 実行開始するだけで、完了は待たない
            _ = Task.Run(() => StartExecuteCompactionAsync(runStatus), CancellationToken.None /* 要求元の CancellationRequested に影響されない */);

            return new CompactionStartResult
            {
                CanStart = true,
                StartTime = startTime,
                Reason = "Compaction started successfully"
            };
        }
        catch (Exception ex)
        {
            logger.ZLogError(ex, $"Error during compaction start");
            await ReleaseLockAsync(lockId, cancellationToken);
            throw;
        }
    }

    private async Task StartExecuteCompactionAsync(RunStatus runStatus)
    {
        await SaveRunStatusAsync(runStatus, CancellationToken.None);
        logger.ZLogInformation($"Compaction process started at {runStatus.StartTime:s} with {runStatus.TargetDays.Count} target dates");

        // Periodically extend lock while processing
        var cts = new CancellationTokenSource();
        _ = Task.Run(async () =>
        {
            while (!cts.Token.IsCancellationRequested)
            {
                await ExtendLockAsync(runStatus.LockId, cts.Token);
                // Extend halfway before expiry
                await Task.Delay(TimeSpan.FromMilliseconds(s_lockFileDuration.TotalMilliseconds / 2), cts.Token);
            }
        }, cts.Token);

        try
        {
            foreach ((DateOnly dateOnly, string pathPrefix) in runStatus.TargetDays.Zip(runStatus.TargetPathPrefixes))
            {
                await ExecuteCompactionAsync(dateOnly, pathPrefix, cts);
            }
        }
        finally
        {
            // ExtendLockAsync のループを停止してロックを解放
            await cts.CancelAsync();
            await ReleaseLockAsync(runStatus.LockId, CancellationToken.None /* 要求元の CancellationRequested に影響されない */);
        }

        runStatus.EndTime = timeProvider.GetUtcNow();
        await SaveRunStatusAsync(runStatus, CancellationToken.None /* 要求元の CancellationRequested に影響されない */);
        logger.ZLogInformation($"Compaction process completed at {runStatus.EndTime:s}");
    }

    public async Task<RunStatus?> GetRunStatusAsync(CancellationToken cancellationToken)
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
            logger.ZLogWarning(ex, $"Unable to read run status from {runJsonPath}");
            return null;
        }
    }

    private static readonly JsonSerializerOptions s_jsonSerializerOptions =
        new JsonSerializerOptions { WriteIndented = true };

    private async Task SaveRunStatusAsync(RunStatus status, CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow();
        var (runJsonPath, _) = SendGridPathUtility.GetS3CompactionRunFile();
        await using var ms = new MemoryStream();
        await JsonSerializer.SerializeAsync(ms, status, s_jsonSerializerOptions, cancellationToken);
        await s3StorageService.PutObjectAsync(ms, runJsonPath, now, cancellationToken);
    }

    private async Task<IList<(DateOnly dateOnly, string pathPrefix)>> GetTargetDaysAsync(CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow();
        var targetDays = new List<(DateOnly dateOnly, string pathPrefix)>();
        try
        {
            var yearDir = await s3StorageService.ListDirectoriesAsync(SendGridPathUtility.GetS3NonCompactionPrefix(null, null, null), now, cancellationToken);
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
            logger.ZLogError(ex, $"Error retrieving target dates for compaction");
        }

        return targetDays;
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
                logger.ZLogInformation($"Lock is held by {existingLock.OwnerId} until {existingLock.ExpiresAt:s}");
                return false;
            }
        }

        // Create new lock
        var lockInfo = new LockInfo
        {
            LockId = lockId,
            OwnerId = s_instanceId,
            AcquiredAt = now,
            ExpiresAt = now.Add(s_lockFileDuration),
            HostName = Environment.MachineName
        };

        var lockJson = JsonSerializer.SerializeToUtf8Bytes(lockInfo, s_jsonSerializerOptions);

        // Use conditional put with ETag to ensure atomic operation
        var success = await s3StorageService.PutObjectWithConditionAsync(lockPath, lockJson, existingLockJson, now, cancellationToken);

        if (success)
        {
            logger.ZLogInformation($"Lock acquired successfully. Lock ID: {lockId}, Expires at: {lockInfo.ExpiresAt:s}");
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
                logger.ZLogInformation($"Lock released successfully. Lock ID: {lockId}");
            }
        }
    }

    private async Task ExtendLockAsync(string lockId, CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow();
        var (_, lockPath) = SendGridPathUtility.GetS3CompactionRunFile();
        var existingLockJson = await s3StorageService.GetObjectAsByteArrayAsync(lockPath, now, cancellationToken);

        if (existingLockJson.Any())
        {
            var existingLock = JsonSerializer.Deserialize<LockInfo>(existingLockJson);
            if (existingLock != null && existingLock.LockId == lockId)
            {
                existingLock.ExpiresAt = now.Add(s_lockFileDuration);
                await using var ms = new MemoryStream();
                await JsonSerializer.SerializeAsync(ms, existingLock, s_jsonSerializerOptions, cancellationToken);
                await s3StorageService.PutObjectAsync(ms, lockPath, now, cancellationToken);
                logger.ZLogInformation($"Lock extended successfully. Lock ID: {lockId}, New expiry: {existingLock.ExpiresAt:s}");
            }
        }
    }

    private async Task ExecuteCompactionAsync(DateOnly targetDay, string pathPrefix, CancellationTokenSource cts)
    {
        logger.ZLogInformation($"Starting compaction for date {targetDay} at path {pathPrefix}");
        try
        {
            await Task.Delay(1000, cts.Token);
            logger.ZLogInformation($"Completed compaction for date {targetDay} at path {pathPrefix}");
        }
        catch (Exception ex)
        {
            logger.ZLogError(ex, $"Error during compaction for date {targetDay} at path {pathPrefix}");
            // 他の日を実行したいので throw しない
        }
    }
}

public class CompactionStartResult
{
    public bool CanStart { get; set; }
    public string Reason { get; set; } = string.Empty;
    public DateTimeOffset? StartTime { get; set; }
}
