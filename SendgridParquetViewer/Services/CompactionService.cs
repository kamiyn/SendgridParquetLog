using System.Text.Json;

using Microsoft.Extensions.Options;

using Parquet;

using SendgridParquet.Shared;

using SendgridParquetViewer.Models;

using ZLogger;

namespace SendgridParquetViewer.Services;

public class CompactionService(
    ILogger<CompactionService> logger,
    TimeProvider timeProvider,
    S3StorageService s3StorageService,
    IOptions<CompactionOptions> compactionOptions,
    ParquetService parquetService
)
{
    private readonly CompactionOptions _compactionOptions = compactionOptions.Value;
    private readonly ParquetService _parquetService = parquetService;
    private static readonly JsonSerializerOptions JsonOptions = new() { WriteIndented = true };
    private static readonly TimeSpan LockDuration = TimeSpan.FromMinutes(30);
    private static readonly TimeSpan MaxRunningDuration = TimeSpan.FromDays(3);
    private static readonly TimeSpan MaxInactivityDuration = TimeSpan.FromDays(1);
    private static readonly string InstanceId = $"{Environment.MachineName}_{Guid.NewGuid():N}";

    public async Task<RunStatus?> GetRunStatusAsync(CancellationToken cancellationToken = default)
    {
        var (runJsonPath, _) = SendGridPathUtility.GetS3CompactionRunFile();
        try
        {
            var jsonContent = await s3StorageService.GetObjectAsByteArrayAsync(runJsonPath, cancellationToken);
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

    record RunStatusContext(RunStatus RunStatus, Func<RunStatus, CancellationToken, Task> SaveRunStatusAsyncFunc)
    {
        internal async Task SaveRunStatusAsync(CancellationToken ct) => await SaveRunStatusAsyncFunc.Invoke(RunStatus, ct);
    }

    public async Task<CompactionStartResult> StartCompactionAsync(Func<RunStatus?, Task> setRunStatus, CancellationToken ct = default)
    {
        var nowUTC = timeProvider.GetUtcNow();
        RunStatus? currentStatus = await GetRunStatusAsync(ct);
        if (currentStatus is { EndTime: null })
        {
            var lastActivity = GetLastActivityTimestamp(currentStatus);
            if (nowUTC - lastActivity > MaxInactivityDuration)
            {
                currentStatus = await FinalizeStalledRunAsync(currentStatus, nowUTC, setRunStatus);
            }
            else
            {
                await setRunStatus(currentStatus);
                return new CompactionStartResult
                {
                    CanStart = false,
                    Reason = $"Compaction is already running (started {currentStatus.StartTime:s}, last update {lastActivity:s})"
                };
            }
        }

        var lockId = Guid.NewGuid().ToString();

        var lockAcquired = await TryAcquireLockAsync(lockId, ct);
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
            var yesterday = nowUTC.AddDays(-1); // UTC基準で昨日以前のものが対象になる = 日本時間で午前9時以降に昨日分が対象になる
            var olderThanOrEqual = new DateOnly(yesterday.Year, yesterday.Month, yesterday.Day);
            var targetDays = await GetCompactionTargetAsync(olderThanOrEqual, ct);

            var runStatusContext = new RunStatusContext(new RunStatus
            {
                LockId = lockId,
                StartTime = nowUTC,
                EndTime = null,
                TargetDays = targetDays.Select(x => x.dateOnly).ToArray(),
                TargetPathPrefixes = targetDays.Select(x => x.pathPrefix).ToArray(),
                CompletedDays = 0,
                CurrentDay = null,
                CurrentDayTotalFiles = null,
                CurrentDayProcessedFiles = null,
                OutputFilesCreated = 0,
                LastUpdated = nowUTC,
            }, async Task (status, _) =>
            {
                // 呼び出し元のキャンセル操作にかかわらず ログを記録したい
                var cancellationToken = CancellationToken.None;
                var (runJsonPath, _) = SendGridPathUtility.GetS3CompactionRunFile();
                await using var ms = new MemoryStream();
                await JsonSerializer.SerializeAsync(ms, status, JsonOptions, cancellationToken);
                await s3StorageService.PutObjectAsync(ms, runJsonPath, cancellationToken);

                await setRunStatus(status); // 呼び出し元の RunStatus を変更する
            });

            // Save initial status
            await runStatusContext.SaveRunStatusAsync(ct);

            // Start background processing
            var ctsForExecuteCompactionAsync = new CancellationTokenSource();
            _ = Task.Run(() => ExecuteCompactionAsync(runStatusContext, ctsForExecuteCompactionAsync.Token), ctsForExecuteCompactionAsync.Token);

            return new CompactionStartResult
            {
                CanStart = true,
                StartTime = nowUTC,
                Reason = "Compaction started successfully"
            };
        }
        catch (Exception ex)
        {
            logger.ZLogError(ex, $"Error during compaction start");
            await ReleaseLockAsync(lockId, ct);
            throw;
        }
    }

    private static DateTimeOffset GetLastActivityTimestamp(RunStatus status)
    {
        return status.LastUpdated == default ? status.StartTime : status.LastUpdated;
    }

    private async Task<RunStatus> FinalizeStalledRunAsync(RunStatus stalledStatus, DateTimeOffset nowUtc, Func<RunStatus?, Task> setRunStatus)
    {
        logger.ZLogWarning($"Detected stalled compaction run (started {stalledStatus.StartTime:s}, last update {GetLastActivityTimestamp(stalledStatus):s}). Forcing completion and releasing lock.");

        try
        {
            await ReleaseLockAsync(stalledStatus.LockId, CancellationToken.None);
        }
        catch (Exception ex)
        {
            logger.ZLogError(ex, $"Failed to release stale compaction lock");
        }

        stalledStatus.EndTime = nowUtc;
        stalledStatus.LastUpdated = nowUtc;

        try
        {
            var (runJsonPath, _) = SendGridPathUtility.GetS3CompactionRunFile();
            await using var ms = new MemoryStream();
            await JsonSerializer.SerializeAsync(ms, stalledStatus, JsonOptions, CancellationToken.None);
            ms.Seek(0, SeekOrigin.Begin);
            await s3StorageService.PutObjectAsync(ms, runJsonPath, CancellationToken.None);
        }
        catch (Exception ex)
        {
            logger.ZLogError(ex, $"Failed to persist forced completion status for stalled compaction run");
        }

        await setRunStatus(stalledStatus);
        return stalledStatus;
    }

    /// <summary>
    /// Compaction対象の日付とパスの一覧を取得する
    /// </summary>
    /// <param name="olderThanOrEqual">この日付以前を対象とする</param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    private async Task<IList<(DateOnly dateOnly, string pathPrefix)>> GetCompactionTargetAsync(DateOnly olderThanOrEqual,
        CancellationToken cancellationToken)
    {
        var targetDays = new List<(DateOnly dateOnly, string pathPrefix)>();
        try
        {
            var yearDir = await s3StorageService.ListDirectoriesAsync(
                SendGridPathUtility.GetS3NonCompactionPrefix(null, null, null), cancellationToken);

            foreach (int year in yearDir.Select(d => int.TryParse(d, out int v) ? v : 0).Where(year => year > 0))
            {
                var yearPath = SendGridPathUtility.GetS3NonCompactionPrefix(year, null, null);
                var monthDirs = await s3StorageService.ListDirectoriesAsync(yearPath, cancellationToken);

                foreach (var month in monthDirs.Select(d => int.TryParse(d, out int v) ? v : 0).Where(month => month > 0))
                {
                    var monthPath = SendGridPathUtility.GetS3NonCompactionPrefix(year, month, null);
                    var dayDirs = await s3StorageService.ListDirectoriesAsync(monthPath, cancellationToken);

                    foreach (var day in dayDirs.Select(d => int.TryParse(d, out int v) ? v : 0).Where(day => day > 0))
                    {
                        var dayPath = SendGridPathUtility.GetS3NonCompactionPrefix(year, month, day);
                        DateOnly dateOnly = new(year, month, day);
                        if (dateOnly <= olderThanOrEqual)
                        {
                            targetDays.Add((dateOnly, dayPath));
                        }
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

    private async Task ReleaseLockAsync(string lockId, CancellationToken cancellationToken)
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

    private async Task ExecuteCompactionAsync(RunStatusContext runStatusContext, CancellationToken token)
    {
        var runStatus = runStatusContext.RunStatus;
        logger.ZLogInformation($"Compaction process started at {runStatus.StartTime} with {runStatus.TargetDays.Count} target dates");

        try
        {
            foreach ((DateOnly dateOnly, string pathPrefix) in runStatus.TargetDays.Zip(runStatus.TargetPathPrefixes))
            {
                logger.ZLogInformation($"Starting compaction for date {dateOnly} at path {pathPrefix}");
                try
                {
                    await ExecuteCompactionOneDayAsync(runStatusContext, dateOnly, pathPrefix, token);
                    logger.ZLogInformation($"Completed compaction for date {dateOnly} at path {pathPrefix}");
                    // Mark day completion
                    runStatus.CompletedDays += 1;
                    runStatus.CurrentDay = null;
                    runStatus.CurrentDayTotalFiles = null;
                    runStatus.CurrentDayProcessedFiles = null;
                    runStatus.LastUpdated = timeProvider.GetUtcNow();
                    await runStatusContext.SaveRunStatusAsync(token);
                }
                catch (Exception ex)
                {
                    logger.ZLogError(ex, $"Error during compaction for date {dateOnly} at path {pathPrefix}");
                    // Continue with other dates
                }
            }
        }
        finally
        {
            await ReleaseLockAsync(runStatus.LockId, CancellationToken.None);
        }

        runStatus.EndTime = timeProvider.GetUtcNow();
        await runStatusContext.SaveRunStatusAsync(token);
        logger.ZLogInformation($"Compaction process completed at {runStatus.EndTime}");
    }

    private async Task ExecuteCompactionOneDayAsync(RunStatusContext runStatusContext, DateOnly targetDate, string pathPrefix, CancellationToken token)
    {
        logger.ZLogInformation($"List files for {targetDate} at path {pathPrefix}");

        var allObjects = await s3StorageService.ListFilesAsync(pathPrefix, token);
        var targetParquetFiles = allObjects
            .Where(key => key.EndsWith(SendGridPathUtility.ParquetFileExtension, StringComparison.OrdinalIgnoreCase))
            .ToArray();

        if (!targetParquetFiles.Any())
        {
            logger.ZLogInformation($"No parquet files found at {pathPrefix}");
            return;
        }

        var totalFiles = targetParquetFiles.Count();
        logger.ZLogInformation($"Starting compaction {totalFiles} parquet files at {pathPrefix} to compact");

        // Initialize per-day progress
        var runStatus = runStatusContext.RunStatus;
        runStatus.CurrentDay = targetDate;
        runStatus.CurrentDayTotalFiles = totalFiles;
        runStatus.CurrentDayProcessedFiles = 0;
        runStatus.LastUpdated = timeProvider.GetUtcNow();
        await runStatusContext.SaveRunStatusAsync(token);

        var remainFiles = new LinkedList<string>(targetParquetFiles); // CompactionBatchAsync は先頭から順番に処理するので LinkedList で良い
        while (remainFiles.Any())
        {
            int previousCount = remainFiles.Count;
            var batchResult = await CompactionBatchAsync(targetDate, remainFiles, token);
            RemoveProcessedFiles(remainFiles, batchResult.ProcessedFiles);
            // Update per-batch progress
            runStatus.CurrentDayProcessedFiles = (runStatus.CurrentDayProcessedFiles ?? 0) + batchResult.ProcessedFiles.Count;
            runStatus.OutputFilesCreated += batchResult.OutputFiles;
            runStatus.FailedFilesCreated += batchResult.FailedFiles;
            runStatus.LastUpdated = timeProvider.GetUtcNow();
            await runStatusContext.SaveRunStatusAsync(token);
            if (previousCount == remainFiles.Count)
            {
                // 何も処理できなかった場合は無限ループ防止のため while を終了する
                break;
            }
            logger.ZLogInformation($"Compaction progress: {totalFiles - remainFiles.Count}/{totalFiles} files");
        }
    }

    private static void RemoveProcessedFiles(LinkedList<string> remainFiles, IEnumerable<string> processedFiles)
    {
        foreach (string file in processedFiles)
        {
            LinkedListNode<string>? node = remainFiles.Find(file);
            if (node != null)
            {
                remainFiles.Remove(node);
            }
        }
    }

    class CompactionBatchContext
    {
        /// <summary>
        /// 読み込み済みのファイル
        /// </summary>
        internal List<string> ProcessingFiles { get; } = new();

        /// <summary>
        /// 読み込み済みのバイト数
        /// </summary>
        internal long ProcessedBytes { get; set; }
        /// <summary>
        /// 読み込み失敗したファイル
        /// </summary>
        internal List<string> FailedFiles { get; } = new();
        internal List<string> OutputFiles { get; } = new(24 /* 24時間 */);
        internal List<SendGridEvent> SendGridEvents { get; } = new();
    }

    /// <summary>
    /// 読み込みファイル量が 512MB 達しない範囲でまとめてコンパクションを実行する
    /// </summary>
    /// <returns>対処したファイル</returns>
    private async Task<CompactionBatchResult> CompactionBatchAsync(DateOnly targetDate, IReadOnlyCollection<string> candidateParquetFiles, CancellationToken token)
    {
        var ctx = new CompactionBatchContext();
        await ReadParquetFilesAsync(candidateParquetFiles, ctx, token);
        logger.ZLogInformation($"Total events loaded: {ctx.SendGridEvents.Count}");
        await CreateCompactedParquetAsync(ctx, token);
        if (await VerifyOutputFilesAsync(ctx, token))
        {
            // Delete original files after successful verification
            foreach (string originalFile in ctx.ProcessingFiles)
            {
                await s3StorageService.DeleteObjectAsync(originalFile, token);
            }
        }

        logger.ZLogInformation($"Completed compaction for {targetDate}: failed {ctx.FailedFiles.Count} files, created {ctx.OutputFiles.Count} files, processed {ctx.SendGridEvents.Count} events");
        return new CompactionBatchResult
        {
            ProcessedFiles = ctx.ProcessingFiles.ToArray(),
            OutputFiles = ctx.OutputFiles.Count,
            FailedFiles = ctx.FailedFiles.Count
        };
    }

    private sealed class CompactionBatchResult
    {
        internal IReadOnlyCollection<string> ProcessedFiles { get; init; } = Array.Empty<string>();
        internal int OutputFiles { get; init; }
        internal int FailedFiles { get; init; }
    }

    /// <summary>
    /// Create compacted parquet file for each hour that has data
    /// </summary>
    private async Task CreateCompactedParquetAsync(CompactionBatchContext ctx, CancellationToken token)
    {
        foreach (var hourGroup in ctx.SendGridEvents.GroupBy(e => e.Timestamp / 3600 /* 1時間単位に分割 */))
        {
            DateTimeOffset timestampFirst = JstExtension.JstUnixTimeSeconds(hourGroup.Select(x => x.Timestamp).First());
            var date = new DateOnly(timestampFirst.Year, timestampFirst.Month, timestampFirst.Day);
            int hour = timestampFirst.Hour;
            var hourEvents = hourGroup.ToArray(); // GroupBy の結果なので必ず1件以上ある
            string outputFileName = string.Empty;
            try
            {
                logger.ZLogInformation($"Creating compacted file for hour {hour} with {hourEvents.Count()} events");

                await using Stream? outputStream = await _parquetService.ConvertToParquetAsync(hourEvents);
                if (outputStream == null)
                {
                    logger.ZLogWarning($"Failed to create parquet data for hour {hour}");
                    continue;
                }

                outputFileName = SendGridPathUtility.GetParquetCompactionFileName(date, hour, outputStream);
                outputStream.Seek(0, SeekOrigin.Begin);
                await s3StorageService.PutObjectAsync(outputStream, outputFileName, token);
                ctx.OutputFiles.Add(outputFileName);

                logger.ZLogInformation($"Created compacted file: {outputFileName} for hour {hour}");
            }
            catch (Exception ex)
            {
                logger.ZLogError(ex, $"Failed to create compacted file: {outputFileName} for hour {hour}");
                throw;
            }
        }
    }

    /// <summary>
    /// Verify all output files are readable as parquet
    /// </summary>
    private async Task<bool> VerifyOutputFilesAsync(CompactionBatchContext ctx, CancellationToken token)
    {
        var failedFiles = new List<string>();
        foreach (string outputFile in ctx.OutputFiles)
        {
            try
            {
                byte[] verifyData = await s3StorageService.GetObjectAsByteArrayAsync(outputFile, token);
                using var verifyMs = new MemoryStream(verifyData);
                using ParquetReader verifyReader = await ParquetReader.CreateAsync(verifyMs, cancellationToken: token);
                logger.ZLogInformation($"Verified compacted file: {outputFile} (RowGroups: {verifyReader.RowGroupCount})");
            }
            catch (Exception ex)
            {
                failedFiles.Add(outputFile);
                logger.ZLogError(ex, $"Failed to verify compacted file: {outputFile}");
                await s3StorageService.DeleteObjectAsync(outputFile, token);
            }
        }

        return !failedFiles.Any();
    }

    private async Task ReadParquetFilesAsync(IReadOnlyCollection<string> files, CompactionBatchContext ctx, CancellationToken token)
    {
        foreach (string parquetFile in files)
        {
            try
            {
                logger.ZLogInformation($"Reading Parquet file: {parquetFile}");
                byte[] parquetData = await s3StorageService.GetObjectAsByteArrayAsync(parquetFile, token);
                if (ctx.ProcessedBytes + parquetData.Length > _compactionOptions.MaxBatchSizeBytes)
                {
                    logger.ZLogInformation($"Reached read limit {_compactionOptions.MaxBatchSizeBytes}, stopping further reads in this batch");
                    break;
                }
                if (parquetData.Any())
                {
                    await using var ms = new MemoryStream(parquetData);
                    using ParquetReader parquetReader = await ParquetReader.CreateAsync(ms, cancellationToken: token);
                    for (int rowGroupIndex = 0; rowGroupIndex < parquetReader.RowGroupCount; rowGroupIndex++)
                    {
                        using ParquetRowGroupReader rowGroupReader = parquetReader.OpenRowGroupReader(rowGroupIndex);
                        await foreach (SendGridEvent e in _parquetService.ReadRowGroupEventsAsync(rowGroupReader, parquetReader, token))
                        {
                            ctx.SendGridEvents.Add(e);
                        }
                    }
                    ctx.ProcessingFiles.Add(parquetFile);
                    ctx.ProcessedBytes += parquetData.Length;
                    logger.ZLogInformation($"Successfully read {ctx.SendGridEvents.Count} events from {parquetFile}");
                }
                else
                {
                    logger.ZLogWarning($"Empty parquet file: {parquetFile}");
                }
            }
            catch (Exception ex)
            {
                logger.ZLogError(ex, $"Failed to read parquet file: {parquetFile}");
                ctx.FailedFiles.Add(parquetFile);
                // 読めなくても処理を続け 無効なファイルとして後で削除する
            }
        }
    }
}
