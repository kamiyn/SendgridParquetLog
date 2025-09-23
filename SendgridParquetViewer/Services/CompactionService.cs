using System.Collections.Concurrent;
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
    private CancellationTokenSource? _startupCancellation;
    private CompactionStartResult? _compactionStartResult;
    private readonly SemaphoreSlim _startupTaskSemaphore = new(1);
    private readonly CompactionOptions _compactionOptions = compactionOptions.Value;
    private static readonly JsonSerializerOptions JsonOptions = new() { WriteIndented = true };
    private static readonly TimeSpan LockDuration = TimeSpan.FromMinutes(30);
    private static readonly TimeSpan MaxInactivityDuration = TimeSpan.FromDays(1);
    private static readonly string InstanceId = $"{Environment.MachineName}_{Guid.NewGuid():N}";

    internal R3.Subject<RunStatus> RunStatusSubject { get; } = new();

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

    /// <summary>
    /// RunStatus に対する操作をまとめたもの
    /// </summary>
    /// <param name="RunStatus"></param>
    /// <param name="NotifyRunStatus">値が変更されるたびに呼び出す軽量なメソッド</param>
    /// <param name="SaveRunStatusAsyncFunc">永続的に保存する重たいメソッド</param>
    record RunStatusContext(RunStatus RunStatus, Action<RunStatus> NotifyRunStatus, Func<RunStatus, CancellationToken, Task> SaveRunStatusAsyncFunc)
    {
        private readonly Lock _lock = new();
        internal async Task SaveRunStatusAsync(CancellationToken ct) => await SaveRunStatusAsyncFunc.Invoke(RunStatus, ct);

        /// <summary>
        /// 1日分のコンパクションを開始したことを記録する
        /// </summary>
        public void StartADay(DateOnly targetDate, int totalFiles, DateTimeOffset now)
        {
            RunStatus.CurrentDay = targetDate;
            RunStatus.CurrentDayTotalFiles = totalFiles;
            RunStatus.CurrentDayProcessedFiles = 0;
            RunStatus.CurrentDayProcessedBytes = 0;
            RunStatus.LastUpdated = now;

            NotifyRunStatus(RunStatus);
        }

        /// <summary>
        /// 1日分のコンパクションが完了したことを記録する
        /// </summary>
        internal void CompletedADay(DateTimeOffset now)
        {
            RunStatus.CompletedDays += 1;
            RunStatus.CurrentDay = null;
            RunStatus.CurrentDayTotalFiles = null;
            RunStatus.CurrentDayProcessedFiles = null;
            RunStatus.CurrentDayProcessedBytes = null;
            RunStatus.LastUpdated = now;

            NotifyRunStatus(RunStatus);
        }

        internal void IncrementCurrentDayProcessedFiles(string parquetFile, long byteLength, DateTimeOffset now)
        {
            lock (_lock)
            {
                RunStatus.LastProcessedFile = parquetFile;

                int prevFiles = RunStatus.CurrentDayProcessedFiles ?? 0;
                RunStatus.CurrentDayProcessedFiles = prevFiles + 1; // Increment

                long prevBytes = RunStatus.CurrentDayProcessedBytes ?? 0;
                RunStatus.CurrentDayProcessedBytes = prevBytes + byteLength;
                RunStatus.LastUpdated = now;
            }

            NotifyRunStatus(RunStatus);
        }

        public void IncrementCurrentDayFailedFiles(string parquetFile, DateTimeOffset now)
        {
            lock (_lock)
            {
                RunStatus.FailedOriginalFiles.Add(parquetFile);
                RunStatus.LastUpdated = now;
            }

            NotifyRunStatus(RunStatus);
        }

        public void IncrementDeletedOriginalFile(DateTimeOffset now)
        {
            lock (_lock)
            {
                int prevFiles = RunStatus.DeletedOriginalFile;
                RunStatus.DeletedOriginalFile = prevFiles + 1; // Increment
                RunStatus.LastUpdated = now;
            }

            NotifyRunStatus(RunStatus);
        }

        public void CompletedAllDays(DateTimeOffset now)
        {
            RunStatus.EndTime = now;

            NotifyRunStatus(RunStatus);
        }
    }

    private RunStatusContext CreateRunStatusContext(RunStatus runStatus) =>
        new(runStatus,
            NotifyRunStatus: status => RunStatusSubject.OnNext(status),
            SaveRunStatusAsyncFunc: async Task (status, _) =>
            {
                // 呼び出し元のキャンセル操作にかかわらず ログを記録したい
                var cancellationToken = CancellationToken.None;
                var (runJsonPath, _) = SendGridPathUtility.GetS3CompactionRunFile();
                await using var ms = new MemoryStream();
                await JsonSerializer.SerializeAsync(ms, status, JsonOptions, cancellationToken);
                await s3StorageService.PutObjectAsync(ms, runJsonPath, cancellationToken);

                await ExtendLockExpirationAsync(status.LockId, cancellationToken);

                RunStatusSubject.OnNext(status);
            });

    public async Task<CompactionStartResult> StartCompactionAsync(CancellationToken ct = default)
    {
        await _startupTaskSemaphore.WaitAsync(ct);
        try
        {
            return await StartCompactionAsyncInLock(ct);
        }
        finally
        {
            _startupTaskSemaphore.Release();
        }
    }

    async Task<CompactionStartResult> StartCompactionAsyncInLock(CancellationToken ct = default)
    {
        var nowUTC = timeProvider.GetUtcNow();
        RunStatus? currentStatus = await GetRunStatusAsync(ct);
        if (currentStatus is { EndTime: null })
        {
            var lastActivity = GetLastActivityTimestamp(currentStatus);
            if (nowUTC - lastActivity > MaxInactivityDuration)
            {
                currentStatus = await FinalizeStalledRunAsync(currentStatus, nowUTC);
                logger.ZLogInformation($"FinalizeStalledRunAsync LastUpdated:{currentStatus.LastUpdated}");
            }
            else
            {
                RunStatusSubject.OnNext(currentStatus);
                return new CompactionStartResult
                {
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
                Reason = "Unable to acquire distributed lock for compaction process"
            };
        }

        try
        {
            var yesterday = nowUTC.AddDays(-1); // UTC基準で昨日以前のものが対象になる = 日本時間で午前9時以降に昨日分が対象になる
            var olderThanOrEqual = new DateOnly(yesterday.Year, yesterday.Month, yesterday.Day);
            var targetDays = await GetCompactionTargetAsync(olderThanOrEqual, ct);

            RunStatus runStatus = new RunStatus
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
            };
            RunStatusContext runStatusContext = CreateRunStatusContext(runStatus);

            // Save initial status
            await runStatusContext.SaveRunStatusAsync(ct);

            _startupCancellation = new CancellationTokenSource(); // StopCompactionAsync でキャンセルできるようにする
            Task startTask = Task.Run(async () => await ExecuteCompactionAsync(runStatusContext, _startupCancellation.Token), CancellationToken.None /* 新しい 非同期実行 Task */);
            _compactionStartResult = new CompactionStartResult
            {
                StartTask = startTask,
                StartTime = nowUTC,
                Reason = "Compaction started successfully"
            };

            return _compactionStartResult;
        }
        catch (Exception ex)
        {
            logger.ZLogError(ex, $"Error during compaction start");
            await ReleaseLockAsync(lockId, ct);
            throw;
        }
    }

    public async Task StopCompactionAsync(CancellationToken ct)
    {
        await _startupTaskSemaphore.WaitAsync(ct);
        try
        {
            if (_startupCancellation != null)
            {
                await _startupCancellation.CancelAsync();
                Task? task = _compactionStartResult?.StartTask;
                if (task != null)
                {
                    await task;
                }
            }
            _startupCancellation?.Dispose();
            _startupCancellation = null;
        }
        catch (OperationCanceledException ex)
        {
            logger.ZLogInformation(ex, $"{nameof(StopCompactionAsync)}");
        }
        catch (Exception ex)
        {
            logger.ZLogError(ex, $"{nameof(StopCompactionAsync)}");
        }
        finally
        {
            _startupTaskSemaphore.Release();
        }
    }

    private static DateTimeOffset GetLastActivityTimestamp(RunStatus status)
    {
        return status.LastUpdated == default ? status.StartTime : status.LastUpdated;
    }

    private async Task<RunStatus> FinalizeStalledRunAsync(RunStatus stalledStatus, DateTimeOffset nowUtc)
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

        RunStatusSubject.OnNext(stalledStatus);
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

    private async Task ExtendLockExpirationAsync(string lockId, CancellationToken cancellationToken)
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
                    runStatusContext.CompletedADay(timeProvider.GetUtcNow());
                    await runStatusContext.SaveRunStatusAsync(token);
                }
                catch (OperationCanceledException)
                {
                    logger.ZLogInformation($"Compaction process was canceled");
                    break; // foreach を抜けて finally へ
                }
                catch (Exception ex)
                {
                    runStatus.Errors.Add(ex);
                    logger.ZLogError(ex, $"Error during compaction for date {dateOnly} at path {pathPrefix}");
                    // Continue with other dates
                }
            }
        }
        catch (OperationCanceledException)
        {
            logger.ZLogInformation($"Compaction process was canceled");
        }
        finally
        {
            await ReleaseLockAsync(runStatus.LockId, CancellationToken.None);
            runStatusContext.CompletedAllDays(timeProvider.GetUtcNow());
            await runStatusContext.SaveRunStatusAsync(CancellationToken.None); // キャンセルされた場合でも保存するように CancellationToken.None
            logger.ZLogInformation($"Compaction process completed at {runStatus.EndTime}");
        }
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
        runStatusContext.StartADay(targetDate, totalFiles, timeProvider.GetUtcNow());
        await runStatusContext.SaveRunStatusAsync(token);

        var remainFiles = new LinkedList<string>(targetParquetFiles); // CompactionBatchAsync は先頭から順番に処理するので LinkedList で良い
        while (remainFiles.Any())
        {
            int previousCount = remainFiles.Count;
            CompactionBatchContext compactionBatchContext = new(runStatusContext, targetDate, remainFiles);
            CompactionBatchResult batchResult = await CompactionBatchAsync(compactionBatchContext, token);
            remainFiles = RemoveRange(remainFiles, batchResult.ProcessedFiles);
            await runStatusContext.SaveRunStatusAsync(token); // ストレージへの保存はバッチごと
            if (previousCount == remainFiles.Count)
            {
                // 何も処理できなかった場合は無限ループ防止のため while を終了する
                break;
            }
            logger.ZLogInformation($"Compaction progress: {totalFiles - remainFiles.Count}/{totalFiles} files");
        }
    }

    private static LinkedList<T> RemoveRange<T>(LinkedList<T> linkedList, IEnumerable<T> removing)
    {
        foreach (T file in removing)
        {
            LinkedListNode<T>? node = linkedList.Find(file);
            if (node != null)
            {
                linkedList.Remove(node);
            }
        }

        return linkedList;
    }

    /// <summary>
    /// RunStatusContext に対する通知
    /// </summary>
    class CompactionBatchContext(RunStatusContext runStatusContext, DateOnly targetDate, IReadOnlyCollection<string> candidateParquetFiles)
    {
        public DateOnly TargetDate { get; } = targetDate;
        public IReadOnlyCollection<string> CandidateParquetFiles { get; } = candidateParquetFiles;

        /// <summary>
        /// 読み込み済みのファイル (バッチ単位)
        /// </summary>
        private readonly ConcurrentQueue<string> _processingFiles = new();

        private long _processedBytes;

        internal IReadOnlyCollection<string> GetProcessedFiles() => _processingFiles.ToArray();

        /// <summary>
        /// 読み込み済みのバイト数 (バッチ単位)
        /// </summary>
        internal long ProcessedBytes => _processedBytes;

        public void AddProcessedFile(string parquetFile, int parquetDataLength, DateTimeOffset now)
        {
            _processingFiles.Enqueue(parquetFile);
            Interlocked.Add(ref _processedBytes, parquetDataLength);
            runStatusContext.IncrementCurrentDayProcessedFiles(parquetFile, parquetDataLength, now);
        }

        /// <summary>
        /// 読み込み失敗したファイル
        /// </summary>
        private readonly ConcurrentQueue<string> _failedReadingParquetFiles = new();

        internal int FailedReadingParquetFilesCount => _failedReadingParquetFiles.Count;
        //internal IReadOnlyCollection<string> FailedReadingParquetFiles() => _failedReadingParquetFiles.ToArray();

        public void AddFailedReadingParquetFiles(string parquetFile, DateTimeOffset now)
        {
            _failedReadingParquetFiles.Enqueue(parquetFile);
            runStatusContext.IncrementCurrentDayFailedFiles(parquetFile, now);
        }

        /// <summary>
        /// オリジナルのストレージから削除済みのファイル
        /// </summary>
        private readonly List<string> _deletedOriginalFiles = new();

        public void AddDeletedOriginalFile(string originalFile, DateTimeOffset now)
        {
            _deletedOriginalFiles.Add(originalFile);
            runStatusContext.IncrementDeletedOriginalFile(now);
        }

        public IReadOnlyCollection<string> GetDeletedOriginalFiles() => _deletedOriginalFiles.AsReadOnly();
    }

    /// <summary>
    /// 読み込みファイル量が 512MB 達しない範囲でまとめてコンパクションを実行する
    /// </summary>
    /// <returns>対処したファイル</returns>
    private async Task<CompactionBatchResult> CompactionBatchAsync(CompactionBatchContext ctx, CancellationToken token)
    {
        var targetDate = ctx.TargetDate;
        var sendGridEvents = await ReadParquetFilesAsync(ctx, token);
        logger.ZLogInformation($"Total events loaded: {sendGridEvents.Count}");
        var outputFiles = await CreateCompactedParquetAsync(sendGridEvents, token);
        if (await VerifyOutputFilesAsync(outputFiles, token))
        {
            // Delete original files after successful verification
            foreach (string originalFile in ctx.GetProcessedFiles())
            {
                await s3StorageService.DeleteObjectAsync(originalFile, token);
                ctx.AddDeletedOriginalFile(originalFile, timeProvider.GetUtcNow());
            }
        }

        logger.ZLogInformation($"Completed compaction for {targetDate}: failed {ctx.FailedReadingParquetFilesCount} files, created {outputFiles.Count} files, processed {sendGridEvents.Count} events");
        return new CompactionBatchResult
        {
            ProcessedFiles = ctx.GetDeletedOriginalFiles(),
        };
    }

    private sealed class CompactionBatchResult
    {
        internal IReadOnlyCollection<string> ProcessedFiles { get; init; } = [];
    }

    /// <summary>
    /// Create compacted parquet file for each hour that has data
    /// </summary>
    private async Task<IReadOnlyCollection<string>> CreateCompactedParquetAsync(IReadOnlyCollection<SendGridEvent> sendGridEvents, CancellationToken token)
    {
        List<string> outputFiles = new(24 /* 24時間 */);

        foreach (var hourGroup in sendGridEvents.GroupBy(e => e.Timestamp / 3600 /* 1時間単位に分割 */))
        {
            DateTimeOffset timestampFirst = JstExtension.JstUnixTimeSeconds(hourGroup.Select(x => x.Timestamp).First());
            var date = new DateOnly(timestampFirst.Year, timestampFirst.Month, timestampFirst.Day);
            int hour = timestampFirst.Hour;
            var hourEvents = hourGroup.ToArray(); // GroupBy の結果なので必ず1件以上ある
            string outputFileName = string.Empty;
            try
            {
                logger.ZLogInformation($"Creating compacted file for hour {hour} with {hourEvents.Count()} events");

                await using Stream? outputStream = await parquetService.ConvertToParquetAsync(hourEvents);
                if (outputStream == null)
                {
                    logger.ZLogWarning($"Failed to create parquet data for hour {hour}");
                    continue;
                }

                outputFileName = SendGridPathUtility.GetParquetCompactionFileName(date, hour, outputStream);
                outputStream.Seek(0, SeekOrigin.Begin);
                await s3StorageService.PutObjectAsync(outputStream, outputFileName, token);
                outputFiles.Add(outputFileName);

                logger.ZLogInformation($"Created compacted file: {outputFileName} for hour {hour}");
            }
            catch (Exception ex)
            {
                logger.ZLogError(ex, $"Failed to create compacted file: {outputFileName} for hour {hour}");
                throw;
            }
        }
        return outputFiles;
    }

    /// <summary>
    /// Verify all output files are readable as parquet
    /// </summary>
    private async Task<bool> VerifyOutputFilesAsync(IEnumerable<string> outputFiles, CancellationToken token)
    {
        var failedFiles = new List<string>();
        foreach (string outputFile in outputFiles)
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

    private async Task<IReadOnlyCollection<SendGridEvent>> ReadParquetFilesAsync(CompactionBatchContext ctx, CancellationToken token)
    {
        var queue = new ConcurrentQueue<SendGridEvent>();
        foreach (string parquetFile in ctx.CandidateParquetFiles)
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
                        await foreach (SendGridEvent e in parquetService.ReadRowGroupEventsAsync(rowGroupReader, parquetReader, token))
                        {
                            queue.Enqueue(e);
                        }
                    }
                    ctx.AddProcessedFile(parquetFile, parquetData.Length, timeProvider.GetUtcNow());
                    logger.ZLogInformation($"Successfully read {queue.Count} events from {parquetFile}");
                }
                else
                {
                    logger.ZLogWarning($"Empty parquet file: {parquetFile}");
                }
            }
            catch (Exception ex)
            {
                logger.ZLogError(ex, $"Failed to read parquet file: {parquetFile}");
                ctx.AddFailedReadingParquetFiles(parquetFile, timeProvider.GetUtcNow());
                // 読めなくても処理を続け 無効なファイルとして後で削除する
            }
        }

        return queue.ToArray();
    }
}
