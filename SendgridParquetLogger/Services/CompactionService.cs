using System.Text.Json;

using Microsoft.Extensions.Logging;

using SendgridParquet.Shared;

using SendgridParquetLogger.Models;

using ZLogger;

namespace SendgridParquetLogger.Services;

public class CompactionService
{
    private readonly ILogger<CompactionService> _logger;
    private readonly S3StorageService _s3StorageService;
    private readonly TimeProvider _timeProvider;
    private readonly string _instanceId;
    private readonly TimeSpan _lockDuration = TimeSpan.FromMinutes(30);
    private readonly TimeSpan _lockRetryInterval = TimeSpan.FromSeconds(5);
    private readonly int _maxLockRetries = 6;

    public CompactionService(
        ILogger<CompactionService> logger,
        S3StorageService s3StorageService,
        TimeProvider timeProvider)
    {
        _logger = logger;
        _s3StorageService = s3StorageService;
        _timeProvider = timeProvider;
        _instanceId = $"{Environment.MachineName}_{Guid.NewGuid():N}";
    }

    public async Task<CompactionStartResult> StartCompactionAsync(CancellationToken cancellationToken)
    {
        var now = _timeProvider.GetUtcNow();
        var runJsonPath = $"{SendGridWebHookFields.FolderPrefixCompaction}/run.json";
        var lockPath = $"{SendGridWebHookFields.FolderPrefixCompaction}/run.lock";

        // Try to acquire distributed lock
        var lockId = Guid.NewGuid().ToString();
        var lockAcquired = false;

        for (int i = 0; i < _maxLockRetries; i++)
        {
            lockAcquired = await TryAcquireLockAsync(lockPath, lockId, cancellationToken);
            if (lockAcquired)
            {
                break;
            }

            _logger.ZLogInformation($"Failed to acquire lock, retry {i + 1}/{_maxLockRetries}");
            await Task.Delay(_lockRetryInterval, cancellationToken);
        }

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
            var currentStatus = await GetRunStatusAsync(runJsonPath, cancellationToken);

            if (currentStatus != null && !currentStatus.EndTime.HasValue)
            {
                var daysSinceStart = (now - currentStatus.StartTime).TotalDays;
                if (daysSinceStart <= 3)
                {
                    return new CompactionStartResult
                    {
                        CanStart = false,
                        Reason = $"Compaction is already running (started {currentStatus.StartTime:yyyy-MM-dd HH:mm:ss} UTC)"
                    };
                }
            }

            var targetDates = await GetTargetDatesAsync(cancellationToken);

            var newStatus = new RunStatus
            {
                StartTime = now,
                EndTime = null,
                ProcessedDates = targetDates
            };

            await SaveRunStatusAsync(runJsonPath, newStatus, cancellationToken);

            _logger.ZLogInformation($"Compaction process started at {now:yyyy-MM-dd HH:mm:ss} UTC with {targetDates.Count} target dates");

            _ = Task.Run(async () => await ExecuteCompactionAsync(newStatus, runJsonPath, lockPath, lockId, cancellationToken), cancellationToken);

            return new CompactionStartResult
            {
                CanStart = true,
                StartTime = now,
                Reason = "Compaction started successfully"
            };
        }
        catch (Exception ex)
        {
            _logger.ZLogError(ex, $"Error during compaction start");
            await ReleaseLockAsync(lockPath, lockId, cancellationToken);
            throw;
        }
    }

    public async Task<RunStatus?> GetCompactionStatusAsync(CancellationToken cancellationToken)
    {
        var runJsonPath = $"{SendGridWebHookFields.FolderPrefixCompaction}/run.json";
        return await GetRunStatusAsync(runJsonPath, cancellationToken);
    }

    private async Task<RunStatus?> GetRunStatusAsync(string path, CancellationToken cancellationToken)
    {
        try
        {
            var jsonContent = await _s3StorageService.GetObjectAsStringAsync(path, cancellationToken);
            if (string.IsNullOrEmpty(jsonContent))
            {
                return null;
            }

            return JsonSerializer.Deserialize<RunStatus>(jsonContent);
        }
        catch (Exception ex)
        {
            _logger.ZLogWarning(ex, $"Unable to read run status from {path}");
            return null;
        }
    }

    private async Task SaveRunStatusAsync(string path, RunStatus status, CancellationToken cancellationToken)
    {
        var json = JsonSerializer.Serialize(status, new JsonSerializerOptions { WriteIndented = true });
        await _s3StorageService.PutObjectAsync(path, json, cancellationToken);
    }

    private async Task<List<string>> GetTargetDatesAsync(CancellationToken cancellationToken)
    {
        var targetDates = new List<string>();

        try
        {
            var directories = await _s3StorageService.ListDirectoriesAsync(SendGridWebHookFields.FolderPrefixNonCompaction, cancellationToken);

            foreach (var yearDir in directories.Where(d => d.Length == 4 && int.TryParse(d, out _)))
            {
                var yearPath = $"{SendGridWebHookFields.FolderPrefixNonCompaction}/{yearDir}";
                var monthDirs = await _s3StorageService.ListDirectoriesAsync(yearPath, cancellationToken);

                foreach (var monthDir in monthDirs.Where(d => d.Length == 2 && int.TryParse(d, out _)))
                {
                    var monthPath = $"{yearPath}/{monthDir}";
                    var dayDirs = await _s3StorageService.ListDirectoriesAsync(monthPath, cancellationToken);

                    foreach (var dayDir in dayDirs.Where(d => d.Length == 2 && int.TryParse(d, out _)))
                    {
                        targetDates.Add($"{yearPath}/{dayDir}");
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.ZLogError(ex, $"Error retrieving target dates for compaction");
        }

        return targetDates;
    }

    private async Task<bool> TryAcquireLockAsync(string lockPath, string lockId, CancellationToken cancellationToken)
    {
        try
        {
            var now = _timeProvider.GetUtcNow();

            // Try to get existing lock
            var existingLockJson = await _s3StorageService.GetObjectAsStringAsync(lockPath, cancellationToken);

            if (!string.IsNullOrEmpty(existingLockJson))
            {
                var existingLock = JsonSerializer.Deserialize<LockInfo>(existingLockJson);
                if (existingLock != null && existingLock.ExpiresAt > now)
                {
                    _logger.ZLogInformation($"Lock is held by {existingLock.OwnerId} until {existingLock.ExpiresAt:yyyy-MM-dd HH:mm:ss} UTC");
                    return false;
                }
            }

            // Create new lock
            var lockInfo = new LockInfo
            {
                LockId = lockId,
                OwnerId = _instanceId,
                AcquiredAt = now,
                ExpiresAt = now.Add(_lockDuration),
                HostName = Environment.MachineName
            };

            var lockJson = JsonSerializer.Serialize(lockInfo, new JsonSerializerOptions { WriteIndented = true });

            // Use conditional put with ETag to ensure atomic operation
            var success = await _s3StorageService.PutObjectWithConditionAsync(lockPath, lockJson, existingLockJson, cancellationToken);

            if (success)
            {
                _logger.ZLogInformation($"Lock acquired successfully. Lock ID: {lockId}, Expires at: {lockInfo.ExpiresAt:yyyy-MM-dd HH:mm:ss} UTC");
            }

            return success;
        }
        catch (Exception ex)
        {
            _logger.ZLogError(ex, $"Error acquiring lock");
            return false;
        }
    }

    private async Task<bool> ReleaseLockAsync(string lockPath, string lockId, CancellationToken cancellationToken)
    {
        try
        {
            var existingLockJson = await _s3StorageService.GetObjectAsStringAsync(lockPath, cancellationToken);

            if (!string.IsNullOrEmpty(existingLockJson))
            {
                var existingLock = JsonSerializer.Deserialize<LockInfo>(existingLockJson);
                if (existingLock != null && existingLock.LockId == lockId)
                {
                    // Delete the lock file
                    await _s3StorageService.DeleteObjectAsync(lockPath, cancellationToken);
                    _logger.ZLogInformation($"Lock released successfully. Lock ID: {lockId}");
                    return true;
                }
            }

            return false;
        }
        catch (Exception ex)
        {
            _logger.ZLogError(ex, $"Error releasing lock");
            return false;
        }
    }

    private async Task<bool> ExtendLockAsync(string lockPath, string lockId, CancellationToken cancellationToken)
    {
        try
        {
            var existingLockJson = await _s3StorageService.GetObjectAsStringAsync(lockPath, cancellationToken);

            if (!string.IsNullOrEmpty(existingLockJson))
            {
                var existingLock = JsonSerializer.Deserialize<LockInfo>(existingLockJson);
                if (existingLock != null && existingLock.LockId == lockId)
                {
                    existingLock.ExpiresAt = _timeProvider.GetUtcNow().Add(_lockDuration);
                    var lockJson = JsonSerializer.Serialize(existingLock, new JsonSerializerOptions { WriteIndented = true });
                    await _s3StorageService.PutObjectAsync(lockPath, lockJson, cancellationToken);
                    _logger.ZLogInformation($"Lock extended successfully. Lock ID: {lockId}, New expiry: {existingLock.ExpiresAt:yyyy-MM-dd HH:mm:ss} UTC");
                    return true;
                }
            }

            return false;
        }
        catch (Exception ex)
        {
            _logger.ZLogError(ex, $"Error extending lock");
            return false;
        }
    }

    private async Task ExecuteCompactionAsync(RunStatus status, string runJsonPath, string lockPath, string lockId, CancellationToken cancellationToken)
    {
        try
        {
            _logger.ZLogInformation($"Starting compaction execution (placeholder implementation)");

            // Periodically extend lock while processing
            using var lockExtensionTimer = new PeriodicTimer(TimeSpan.FromMinutes(10));
            var lockExtensionTask = Task.Run(async () =>
            {
                while (await lockExtensionTimer.WaitForNextTickAsync(cancellationToken))
                {
                    await ExtendLockAsync(lockPath, lockId, cancellationToken);
                }
            }, cancellationToken);

            // Simulate work
            await Task.Delay(1000, cancellationToken);

            var endTime = _timeProvider.GetUtcNow();
            status.EndTime = endTime;

            await SaveRunStatusAsync(runJsonPath, status, cancellationToken);

            _logger.ZLogInformation($"Compaction process completed at {endTime:yyyy-MM-dd HH:mm:ss} UTC");
        }
        catch (Exception ex)
        {
            _logger.ZLogError(ex, $"Error during compaction execution");
        }
        finally
        {
            // Always release lock when done
            await ReleaseLockAsync(lockPath, lockId, cancellationToken);
        }
    }
}

public class CompactionStartResult
{
    public bool CanStart { get; set; }
    public string Reason { get; set; } = string.Empty;
    public DateTimeOffset? StartTime { get; set; }
}
