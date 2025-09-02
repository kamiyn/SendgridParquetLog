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
            logger.ZLogWarning(ex, $"Unable to read run status from {runJsonPath}");
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

            var yesterday = now.AddDays(-1);
            var olderThan = new DateOnly(yesterday.Year, yesterday.Month, yesterday.Day);
            var targetDays = await GetCompactionTargetAsync(olderThan, cancellationToken);
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
            var ctsForExecuteCompactionAsync = new CancellationTokenSource();
            _ = Task.Run(() => ExecuteCompactionAsync(runStatusNew, ctsForExecuteCompactionAsync.Token), ctsForExecuteCompactionAsync.Token);

            return new CompactionStartResult
            {
                CanStart = true,
                StartTime = now,
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

    /// <summary>
    /// Compaction対象の日付とパスの一覧を取得する
    /// </summary>
    /// <param name="olderThan">この時刻よりも前の日付のみを対象とする</param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    private async Task<IList<(DateOnly dateOnly, string pathPrefix)>> GetCompactionTargetAsync(DateOnly olderThan,
        CancellationToken cancellationToken)
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
                        if (dateOnly < olderThan)
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
            lockPath, lockJson, existingLockJson, now, cancellationToken);

        if (success)
        {
            logger.ZLogInformation($"Lock acquired successfully. Lock ID: {lockId}, Expires at: {lockInfo.ExpiresAt}");
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

    private async Task ExecuteCompactionAsync(RunStatus runStatus, CancellationToken token)
    {
        logger.ZLogInformation($"Compaction process started at {runStatus.StartTime} with {runStatus.TargetDays.Count} target dates");

        try
        {
            foreach ((DateOnly dateOnly, string pathPrefix) in runStatus.TargetDays.Zip(runStatus.TargetPathPrefixes))
            {
                logger.ZLogInformation($"Starting compaction for date {dateOnly} at path {pathPrefix}");
                try
                {
                    await ExecuteCompactionOneDayAsync(dateOnly, pathPrefix, token);
                    logger.ZLogInformation($"Completed compaction for date {dateOnly} at path {pathPrefix}");
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
        await SaveRunStatusAsync(runStatus, CancellationToken.None);
        logger.ZLogInformation($"Compaction process completed at {runStatus.EndTime}");
    }

    private async Task ExecuteCompactionOneDayAsync(DateOnly targetDate, string pathPrefix, CancellationToken token)
    {
        logger.ZLogInformation($"Starting compaction for {targetDate} at path {pathPrefix}");

        var now = timeProvider.GetUtcNow();
        var allObjects = await s3StorageService.ListFilesAsync(pathPrefix, now, token);
        var targetParquetFiles = allObjects
            .Where(key => key.EndsWith(SendGridPathUtility.ParquetFileExtension, StringComparison.OrdinalIgnoreCase))
            .ToArray();

        if (!targetParquetFiles.Any())
        {
            logger.ZLogInformation($"No parquet files found at {pathPrefix}");
            return;
        }

        var totalFiles = targetParquetFiles.Count();
        logger.ZLogInformation($"Found {totalFiles} parquet files to compact");

        var remainFiles = new LinkedList<string>(targetParquetFiles); // CompactionBatchAsync は先頭から順番に処理するので LinkedList で良い
        while (remainFiles.Any())
        {
            int previousCount = remainFiles.Count;
            var processedFiles = await CompactionBatchAsync(targetDate, targetParquetFiles, token);
            RemoveProcessedFiles(remainFiles, processedFiles);
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
        internal long ProcessedBytes { get; set; } = 0;
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
    private async Task<ICollection<string>> CompactionBatchAsync(DateOnly targetDate, ICollection<string> candidateParquetFiles, CancellationToken token)
    {
        var ctx = new CompactionBatchContext();
        await ReadParquetFilesAsync(candidateParquetFiles, ctx, token);
        logger.ZLogInformation($"Total events loaded: {ctx.SendGridEvents.Count}");
        await CreateCompactedParquetAsync(ctx, token);
        if (await VerifyOutputFilesAsync(ctx, token))
        {
            // Delete original files after successful verification
            var now = timeProvider.GetUtcNow();
            foreach (string originalFile in ctx.ProcessingFiles)
            {
                await s3StorageService.DeleteObjectAsync(originalFile, now, token);
            }
        }

        logger.ZLogInformation($"Completed compaction for {targetDate}: failed {ctx.FailedFiles.Count} files, created {ctx.OutputFiles.Count} files, processed {ctx.SendGridEvents.Count} events");
        return ctx.ProcessingFiles;
    }

    /// <summary>
    /// Create compacted parquet file for each hour that has data
    /// </summary>
    private async Task CreateCompactedParquetAsync(CompactionBatchContext ctx, CancellationToken token)
    {
        foreach (var hourGroup in ctx.SendGridEvents.GroupBy(e => e.Timestamp / 3600 /* 1時間単位に分割 */))
        {
            var now = timeProvider.GetUtcNow();
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
                await s3StorageService.PutObjectAsync(outputStream, outputFileName, now, token);
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
        var now = timeProvider.GetUtcNow();
        var failedFiles = new List<string>();
        foreach (string outputFile in ctx.OutputFiles)
        {
            try
            {
                byte[] verifyData = await s3StorageService.GetObjectAsByteArrayAsync(outputFile, now, token);
                using var verifyMs = new MemoryStream(verifyData);
                using ParquetReader verifyReader = await ParquetReader.CreateAsync(verifyMs, cancellationToken: token);
                logger.ZLogInformation($"Verified compacted file: {outputFile} (RowGroups: {verifyReader.RowGroupCount})");
            }
            catch (Exception ex)
            {
                failedFiles.Add(outputFile);
                logger.ZLogError(ex, $"Failed to verify compacted file: {outputFile}");
                await s3StorageService.DeleteObjectAsync(outputFile, now, token);
            }
        }

        return !failedFiles.Any();
    }

    private async Task ReadParquetFilesAsync(ICollection<string> files, CompactionBatchContext ctx, CancellationToken token)
    {
        var now = timeProvider.GetUtcNow();
        foreach (string parquetFile in files)
        {
            try
            {
                logger.ZLogInformation($"Reading Parquet file: {parquetFile}");
                byte[] parquetData = await s3StorageService.GetObjectAsByteArrayAsync(parquetFile, now, token);
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
