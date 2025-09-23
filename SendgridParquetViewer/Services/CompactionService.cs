using System.Collections.Concurrent;
using System.Text.Json;
using System.Threading.Channels;

using MemoryPack;

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
    IS3LockService s3LockService,
    IOptions<CompactionOptions> compactionOptions,
    ParquetService parquetService
)
{
    private CancellationTokenSource? _startupCancellation;
    private CompactionStartResult? _compactionStartResult;
    private readonly SemaphoreSlim _startupTaskSemaphore = new(1);
    private readonly CompactionOptions _compactionOptions = compactionOptions.Value;
    private static readonly TimeSpan MaxInactivityDuration = TimeSpan.FromDays(1);

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

            return JsonSerializer.Deserialize<RunStatus>(jsonContent, AppJsonSerializerContext.Default.RunStatus);
        }
        catch (Exception ex)
        {
            logger.ZLogWarning(ex, $"Unable to read run status from {runJsonPath}");
            return null;
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
                await JsonSerializer.SerializeAsync(ms, status, AppJsonSerializerContext.Default.RunStatus, cancellationToken);
                await s3StorageService.PutObjectAsync(ms, runJsonPath, cancellationToken);

                await s3LockService.ExtendLockExpirationAsync(status.LockId, cancellationToken);

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
            var lastActivity = currentStatus.GetLastActivityTimestamp();
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

        var lockAcquired = await s3LockService.TryAcquireLockAsync(lockId, ct);
        if (!lockAcquired)
        {
            return new CompactionStartResult
            {
                Reason = "Unable to acquire distributed lock for compaction process"
            };
        }

        try
        {
            var yesterday = nowUTC.ToJst().Add(_compactionOptions.TargetBefore);
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
            await s3LockService.ReleaseLockAsync(lockId, ct);
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

    private async Task<RunStatus> FinalizeStalledRunAsync(RunStatus stalledStatus, DateTimeOffset nowUtc)
    {
        logger.ZLogWarning($"Detected stalled compaction run (started {stalledStatus.StartTime:s}, last update {stalledStatus.GetLastActivityTimestamp():s}). Forcing completion and releasing lock.");

        try
        {
            await s3LockService.ReleaseLockAsync(stalledStatus.LockId, CancellationToken.None);
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
            await JsonSerializer.SerializeAsync(ms, stalledStatus, AppJsonSerializerContext.Default.RunStatus, CancellationToken.None);
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

    private async Task ExecuteCompactionAsync(RunStatusContext runStatusContext, CancellationToken token)
    {
        var runStatus = runStatusContext.RunStatus;
        logger.ZLogInformation($"Compaction process started at {runStatus.StartTime} with {runStatus.TargetDays.Count} target dates");

        try
        {
            foreach ((DateOnly dateOnly, string pathPrefix) in runStatus.TargetDays.Zip(runStatus.TargetPathPrefixes))
            {
                token.ThrowIfCancellationRequested();
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
            await s3LockService.ReleaseLockAsync(runStatus.LockId, CancellationToken.None);
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

        int batchCount = 0;
        var remainFiles = new LinkedList<string>(targetParquetFiles); // CompactionBatchAsync は先頭から順番に処理するので LinkedList で良い
        while (remainFiles.Any())
        {
            Interlocked.Increment(ref batchCount);
            token.ThrowIfCancellationRequested();
            int previousCount = remainFiles.Count;
            using CompactionBatchContext compactionBatchContext = new(runStatusContext, targetDate, batchCount, remainFiles);
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
    /// 読み込みファイル量が 512MB 達しない範囲でまとめてコンパクションを実行する
    /// </summary>
    /// <returns>対処したファイル</returns>
    private async Task<CompactionBatchResult> CompactionBatchAsync(CompactionBatchContext ctx, CancellationToken token)
    {
        var targetDate = ctx.TargetDate;
        FetchReadParquetFilesResult sendGridEvents = await FetchParquetFilesAsync(ctx, token);
        logger.ZLogInformation($"Total events loaded: {sendGridEvents.Count}");
        var outputFiles = await CreateCompactedParquetAsync(sendGridEvents, token);
        if (await VerifyOutputFilesAsync(outputFiles, ctx, token))
        {
            // Delete original files after successful verification
            foreach (string originalFile in ctx.GetProcessedFiles())
            {
                await s3StorageService.DeleteObjectAsync(originalFile, token);
                ctx.AddDeletedOriginalFile(originalFile, timeProvider.GetUtcNow());
            }
        }
        //else
        //{
        //    OutputFile が不正な場合はオリジナルを削除せず Outputfile 側を削除する処理は VerifyOutputFilesAsync 内で行われる
        //}

        logger.ZLogInformation($"Completed compaction for {targetDate}: failed {ctx.FailedReadingParquetFilesCount} files, created {outputFiles.Count} files, processed {sendGridEvents.Count} events");
        return new CompactionBatchResult
        {
            ProcessedFiles = ctx.GetDeletedOriginalFiles(),
        };
    }

    private const int TmpFileBufferSize = 65536;

    /// <summary>
    /// Create compacted parquet file for each hour that has data
    /// </summary>
    private async Task<IReadOnlyCollection<string>> CreateCompactedParquetAsync(FetchReadParquetFilesResult fetchReadParquetFilesResult, CancellationToken token)
    {
        var outputFiles = new List<string>(fetchReadParquetFilesResult.PackedByHours.Count);
        foreach (var hourGroup in fetchReadParquetFilesResult.PackedByHours
                     .GroupBy(item => item.KeyUnixTimeSeconds)
                     .OrderBy(grp => grp.Key))
        {
            var firstItem = hourGroup.First();
            DateTimeOffset dt = DateTimeOffset.FromUnixTimeSeconds(firstItem.KeyUnixTimeSeconds);
            var dateOnly = new DateOnly(dt.Year, dt.Month, dt.Day);
            string outputFileName = string.Empty;
            var tempFile = Path.GetTempFileName();
            try
            {
                logger.ZLogInformation($"Creating compacted file for hour {dt.Hour} with {hourGroup.Sum(x => x.Count)} events");

                List<SendGridEvent> hourEvents = new();
                foreach (var packedFile in hourGroup)
                {
                    string fullName = packedFile.FileInfo.FullName;
                    await using var fs = new FileStream(fullName, FileMode.Open, FileAccess.Read, FileShare.Read, TmpFileBufferSize, useAsync: true);
                    SendGridEvent[] events = await MemoryPackSerializer.DeserializeAsync<SendGridEvent[]>(fs, cancellationToken: token) ?? [];
                    hourEvents.AddRange(events);
                }

                if (!hourEvents.Any())
                {
                    logger.ZLogWarning($"Failed to MemoryPackSerializer.DeserializeAsync for hour");
                    continue;
                }
                logger.ZLogInformation($"Creating compacted file for hour {dt.Hour} with {hourEvents.Count()} events");

                await using (var outputStream = new FileStream(tempFile, FileMode.Create, FileAccess.ReadWrite, FileShare.None, TmpFileBufferSize, useAsync: true))
                {
                    bool convertToParquetResult = await parquetService.ConvertToParquetAsync(hourEvents, outputStream);
                    if (!convertToParquetResult)
                    {
                        logger.ZLogWarning($"Failed to create parquet data for hour {dt.Hour}");
                        continue;
                    }

                    outputFileName = SendGridPathUtility.GetParquetCompactionFileName(dateOnly, dt.Hour, outputStream);
                    outputStream.Seek(0, SeekOrigin.Begin);
                    await s3StorageService.PutObjectAsync(outputStream, outputFileName, token);
                    outputFiles.Add(outputFileName);
                }

                logger.ZLogInformation($"Created compacted file: {outputFileName} for hour {dt.Hour}");
            }
            catch (Exception ex)
            {
                logger.ZLogError(ex, $"Failed to create compacted file: {outputFileName} for hour {dt.Hour}");
                throw;
            }
            finally
            {
                try
                {
                    File.Delete(tempFile);
                }
                catch (Exception ex)
                {
                    logger.ZLogWarning(ex, $"Failed to delete temporary file: {tempFile}");
                }
            }
        }
        return outputFiles;
    }

    /// <summary>
    /// Verify all output files are readable as parquet
    /// Verify に失敗した場合 OutputFile は削除される
    /// </summary>
    private async Task<bool> VerifyOutputFilesAsync(IEnumerable<string> outputFiles,
        CompactionBatchContext ctx,
        CancellationToken token)
    {
        foreach (string outputFile in outputFiles)
        {
            try
            {
                byte[] verifyData = await s3StorageService.GetObjectAsByteArrayAsync(outputFile, token);
                using var verifyMs = new MemoryStream(verifyData);
                using ParquetReader verifyReader = await ParquetReader.CreateAsync(verifyMs, cancellationToken: token);
                logger.ZLogInformation($"Verified compacted file: {outputFile} (RowGroups: {verifyReader.RowGroupCount})");
                ctx.AddVerifiedOutputFile(outputFile, timeProvider.GetUtcNow());
            }
            catch (Exception ex)
            {
                logger.ZLogError(ex, $"Failed to verify compacted file: {outputFile}");
                await s3StorageService.DeleteObjectAsync(outputFile, token);
                ctx.AddFailedOutputFile(outputFile, timeProvider.GetUtcNow());
            }
        }

        return ctx.FailedOutputFileCount == 0;
    }

    /// <summary>
    /// 1ファイルを読み取った結果
    /// </summary>
    class SendGridEventsOneFile
    {
        internal IReadOnlyCollection<SendGridEvent> SendGridEvents { get; init; } = [];
        internal string ParquetFile { get; init; } = string.Empty;
    }

    class FetchReadParquetFilesResult
    {
        internal record struct PackedItem(long KeyUnixTimeSeconds, int Count, FileInfo FileInfo);

        /// <summary>
        /// 1時間ごとの SendGridEvent 配列を格納した一時ファイルの一覧
        /// </summary>
        internal IReadOnlyCollection<PackedItem> PackedByHours { get; init; } = [];

        internal int Count => PackedByHours.DefaultIfEmpty().Sum(x => x.Count);
    }

    /// <summary>
    /// S3 storage からファイルを読み 一時ファイルとして書き込む
    ///  - 1日ごとの処理開始前に 一時ファイル置き場 Path.Combine(Path.GetTempPath(), $"compaction{ctx.TargetDate:yyyyMMdd}") はクリアする
    ///  - この時点で 3600秒(=1時間) ごとの GroupBy を実施
    ///  - 元の Parquet ファイルが日をまたいでいる可能性がある。0時をまたぐ可能性は日常的に発生する。その他の理由でまたいだ時間帯が増えたとしても処理を試みられるようにしておく
    ///  - 一時ファイルの形式は https://github.com/Cysharp/MemoryPack MemoryPack でシリアライズ
    ///  - 書き込み先は Path.Combine(一時ファイル置き場, ${ targetDayAndHour: yyyyMMddHH}, 元の Parquet ファイル) 名
    ///  - 対象となった3600秒(=1時間) ごとの(日時 と 日時に対応したフォルダ) のValueTupleリストを返り値とする
    /// </summary>
    private async Task<FetchReadParquetFilesResult> FetchParquetFilesAsync(CompactionBatchContext ctx, CancellationToken token)
    {
        // 最大2ファイルを先読みする
        var channel = Channel.CreateBounded<SendGridEventsOneFile>(new BoundedChannelOptions(2)
        {
            SingleReader = true,
            SingleWriter = true,
            FullMode = BoundedChannelFullMode.Wait,
        });
        Task<FetchReadParquetFilesResult> consumer = FetchParquetFilesConsumerAsync(ctx, channel.Reader, token);
        try
        {
            await FetchParquetFilesProducerAsync(ctx, channel.Writer, token);
        }
        finally
        {
            channel.Writer.TryComplete();
        }
        return await consumer;
    }

    private async Task<FetchReadParquetFilesResult> FetchParquetFilesConsumerAsync(CompactionBatchContext ctx,
        ChannelReader<SendGridEventsOneFile> reader,
        CancellationToken token)
    {
        DirectoryInfo dailyTargetFolder = ctx.CreateTempFolderForRawFiles(logger);
        var createdHourlyFolders = new ConcurrentDictionary<string, DateTimeOffset>();
        var results = new List<FetchReadParquetFilesResult.PackedItem>(25);
        await foreach (SendGridEventsOneFile sendgridEventOneFile in reader.ReadAllAsync(token))
        {
            var sendGridEvents = sendgridEventOneFile.SendGridEvents;
            foreach (var hourGroup in sendGridEvents.GroupBy(e => e.Timestamp / 3600 /* 1時間単位に分割 */))
            {
                SendGridEvent[] eventsByHour = hourGroup.ToArray(); // シリアライズする前に 配列にする

                DateTimeOffset hourGroupKey = JstExtension.JstUnixTimeSeconds(hourGroup.Key * 3600);
                string targetFolder = Path.Combine(dailyTargetFolder.FullName, $"{hourGroupKey:yyyyMMddHH}");
                if (createdHourlyFolders.TryAdd(targetFolder, hourGroupKey))
                {
                    Directory.CreateDirectory(targetFolder);
                }
                string originalFileName = Path.GetFileName(sendgridEventOneFile.ParquetFile);
                string targetFilePath = Path.Combine(targetFolder, originalFileName);
                await using var fs = new FileStream(targetFilePath, FileMode.Create, FileAccess.Write, FileShare.None, TmpFileBufferSize, useAsync: true);
                await MemoryPackSerializer.SerializeAsync(fs, eventsByHour, cancellationToken: token);

                results.Add(new FetchReadParquetFilesResult.PackedItem(hourGroupKey.ToUnixTimeSeconds(), eventsByHour.Length, new FileInfo(targetFilePath)));
            }
        }

        return new FetchReadParquetFilesResult { PackedByHours = results, };
    }

    private async Task FetchParquetFilesProducerAsync(CompactionBatchContext ctx,
        ChannelWriter<SendGridEventsOneFile> writer,
        CancellationToken token)
    {
        foreach (string parquetFile in ctx.CandidateParquetFiles)
        {
            token.ThrowIfCancellationRequested();
            try
            {
                var sendGridEvents = new ConcurrentQueue<SendGridEvent>();
                logger.ZLogInformation($"Reading Parquet file: {parquetFile}");
                byte[] parquetData = await s3StorageService.GetObjectAsByteArrayAsync(parquetFile, token);
                if (ctx.ProcessedBytes + parquetData.Length > _compactionOptions.MaxBatchSizeBytes)
                {
                    logger.ZLogInformation(
                        $"Reached read limit {_compactionOptions.MaxBatchSizeBytes}, stopping further reads in this batch");
                    break;
                }

                if (parquetData.Any())
                {
                    await using var ms = new MemoryStream(parquetData);
                    using ParquetReader parquetReader = await ParquetReader.CreateAsync(ms, cancellationToken: token);
                    for (int rowGroupIndex = 0; rowGroupIndex < parquetReader.RowGroupCount; rowGroupIndex++)
                    {
                        using ParquetRowGroupReader rowGroupReader = parquetReader.OpenRowGroupReader(rowGroupIndex);
                        await foreach (SendGridEvent sendGridEvent in parquetService.ReadRowGroupEventsAsync(
                                           rowGroupReader, parquetReader, token))
                        {
                            sendGridEvents.Enqueue(sendGridEvent);
                        }
                    }

                    await writer.WriteAsync(
                        new SendGridEventsOneFile
                        {
                            ParquetFile = parquetFile, SendGridEvents = sendGridEvents.ToArray(),
                        }, token);
                    ctx.AddProcessedFile(parquetFile, parquetData.Length, timeProvider.GetUtcNow());
                    logger.ZLogInformation($"Successfully read {sendGridEvents.Count} events from {parquetFile}");
                }
                else
                {
                    logger.ZLogWarning($"Empty parquet file: {parquetFile}");
                }
            }
            catch (OperationCanceledException)
            {
                throw;
            }
            catch (Exception ex)
            {
                logger.ZLogError(ex, $"Failed to read parquet file: {parquetFile}");
                ctx.AddFailedReadingParquetFiles(parquetFile, timeProvider.GetUtcNow());
                // 読めなくても処理を続け 無効なファイルとして後で削除する
            }
        }
    }
}
