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
    private readonly SemaphoreSlim _lockSemaphore = new(1, 1);

    public CompactionService(
        ILogger<CompactionService> logger,
        S3StorageService s3StorageService,
        TimeProvider timeProvider)
    {
        _logger = logger;
        _s3StorageService = s3StorageService;
        _timeProvider = timeProvider;
    }

    public async Task<CompactionStartResult> StartCompactionAsync(CancellationToken cancellationToken)
    {
        var now = _timeProvider.GetUtcNow();

        if (!await _lockSemaphore.WaitAsync(TimeSpan.FromSeconds(30), cancellationToken))
        {
            return new CompactionStartResult
            {
                CanStart = false,
                Reason = "Unable to acquire lock for compaction process"
            };
        }

        try
        {
            var runJsonPath = $"{SendGridWebHookFields.FolderPrefixCompaction}/run.json";
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

            _ = Task.Run(async () => await ExecuteCompactionAsync(newStatus, runJsonPath, cancellationToken), cancellationToken);

            return new CompactionStartResult
            {
                CanStart = true,
                StartTime = now,
                Reason = "Compaction started successfully"
            };
        }
        finally
        {
            _lockSemaphore.Release();
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
            _logger.ZLogError(ex, "Error retrieving target dates for compaction");
        }

        return targetDates;
    }

    private async Task ExecuteCompactionAsync(RunStatus status, string runJsonPath, CancellationToken cancellationToken)
    {
        try
        {
            _logger.ZLogInformation("Starting compaction execution (placeholder implementation)");

            await Task.Delay(1000, cancellationToken);

            var endTime = _timeProvider.GetUtcNow();
            status.EndTime = endTime;

            await SaveRunStatusAsync(runJsonPath, status, cancellationToken);

            _logger.ZLogInformation($"Compaction process completed at {endTime:yyyy-MM-dd HH:mm:ss} UTC");
        }
        catch (Exception ex)
        {
            _logger.ZLogError(ex, "Error during compaction execution");
        }
    }
}

public class CompactionStartResult
{
    public bool CanStart { get; set; }
    public string Reason { get; set; } = string.Empty;
    public DateTimeOffset? StartTime { get; set; }
}
