using System.Runtime.ExceptionServices;
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
    private volatile CompactionStartResult? _compactionStartResult;
    private readonly SemaphoreSlim _startupTaskSemaphore = new(1);
    private readonly CompactionOptions _compactionOptions = compactionOptions.Value;
    private readonly IS3LockService _s3LockService = s3LockService;
    // 新規開始時 (StartCompactionAsyncInLock) に、既存 run を「無活動でストール済み」とみなす閾値。
    // ハートビート側のストール判定は別ロジック (前回ロック延長からの進捗有無 + LockDuration) で行うため、
    // この値はハートビートには使わない。変換フェーズも LastActivity を更新する (onRowGroupFlushed) ので、
    // 正常な巨大バッチを誤ってストール扱いにすることはない。
    private static readonly TimeSpan MaxInactivityDuration = TimeSpan.FromDays(1);
    private TimeSpan LockHeartbeatInterval => _s3LockService.LockDuration / 6;

    // 読み取り不能ファイルに付与するユーザーメタデータのキー (x-amz-meta- は S3StorageService 側で付与)。
    private const string ReadFailureFirstUtcMetadataKey = "read-failure-first-utc";
    private const string ReadFailureCountMetadataKey = "read-failure-count";

    internal R3.Subject<RunStatus> RunStatusSubject { get; } = new();

    public bool IsCompactionRunningLocally =>
        _compactionStartResult?.StartTask is { IsCompleted: false };

    public Task<LockInfo?> GetLockInfoAsync(CancellationToken ct = default) =>
        s3LockService.GetLockInfoAsync(ct);

    public async Task<RunStatus?> GetRunStatusAsync(CancellationToken ct = default)
    {
        var (runJsonPath, _) = SendGridPathUtility.GetS3CompactionRunFile();
        try
        {
            var jsonContent = await s3StorageService.GetObjectAsByteArrayAsync(runJsonPath, ct);
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

                // 完了済み (EndTime 設定済み) の場合はロック延長をスキップする
                // ReleaseLockAsync 後に ExtendLockExpirationAsync を呼ぶとロックが再有効化されるため
                if (status.EndTime == null)
                {
                    // バッチ単位の延長 (ハートビートとは独立)。連続失敗の判定はハートビート側が行うが、
                    // ここでも延長失敗を検知できるよう戻り値を確認し警告ログを残す。
                    bool extended = await s3LockService.ExtendLockExpirationAsync(status.LockId, cancellationToken);
                    if (!extended)
                    {
                        logger.ZLogWarning($"Per-batch lock extension did not succeed. LockId={status.LockId}");
                    }
                }

                RunStatusSubject.OnNext(status);
            });

    public async Task<CompactionStartResult> StartCompactionAsync(CancellationToken ct = default)
    {
        await _startupTaskSemaphore.WaitAsync(ct);
        try
        {
            if (_compactionStartResult != null)
            {
                var isTaskRunning = _compactionStartResult.StartTask != null && !_compactionStartResult.StartTask.IsCompleted;
                if (isTaskRunning)
                {
                    return _compactionStartResult;
                }
            }
            // 開始の指示に対しては Faulted, Cancelled でも再開する
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
                // 無活動期間が閾値以内でも、ロックが期限切れまたは存在しない場合はストール済みとみなす
                var lockInfo = await s3LockService.GetLockInfoAsync(ct);
                if (lockInfo == null || lockInfo.ExpiresAt <= nowUTC)
                {
                    currentStatus = await FinalizeStalledRunAsync(currentStatus, nowUTC);
                    logger.ZLogInformation($"FinalizeStalledRunAsync (expired lock) LastUpdated:{currentStatus.LastUpdated}");
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
            var targetCutoff = nowUTC.ToJst().Add(_compactionOptions.TargetBefore);
            var olderThanOrEqual = new DateOnly(targetCutoff.Year, targetCutoff.Month, targetCutoff.Day);
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
                _compactionStartResult = null; // 前回開始時間を UI でフィードバックする場合は Start 時点の返り値を受け取った側が管理する
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
            LockInfo? currentLock = await s3LockService.GetLockInfoAsync(CancellationToken.None);
            if (currentLock != null
                && string.Equals(currentLock.LockId, stalledStatus.LockId, StringComparison.Ordinal))
            {
                // ロックのハートビートがまだ機能している（ExpiresAt が十分先）場合は
                // run.json の LastUpdated が古いだけで実際には稼働中とみなし stall 判定をスキップする
                if (currentLock.ExpiresAt > nowUtc.Add(LockHeartbeatInterval))
                {
                    logger.ZLogInformation(
                        $"Lock is still actively maintained by heartbeat (ExpiresAt={currentLock.ExpiresAt:o}, Now={nowUtc:o}). Skipping stall finalization.");
                    return stalledStatus;
                }

                if (currentLock.ExpiresAt > nowUtc)
                {
                    logger.ZLogWarning(
                        $"Invalidating compaction lock for stalled run even though lock has not yet expired. " +
                        $"LockId={currentLock.LockId}, ExpiresAt={currentLock.ExpiresAt:o}, Now={nowUtc:o}");
                }
                bool invalidated = await s3LockService.TryForceInvalidateLockAsync(currentLock, CancellationToken.None);
                if (!invalidated)
                {
                    logger.ZLogInformation($"Skip force invalidating stale compaction lock due to concurrent lock state change. LockId={currentLock.LockId}");
                }
            }
        }
        catch (Exception ex)
        {
            logger.ZLogError(ex, $"Failed to invalidate stale compaction lock");
        }

        stalledStatus.EndTime = nowUtc;
        stalledStatus.LastUpdated = nowUtc;
        stalledStatus.AbnormalTermination = true;

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

        // ハートビートが Abandoned (ロック維持不能) を検知したときに、この CTS を通じて
        // コンパクション本体ごと停止できるようにする (dual execution 防止)。
        // 親 token へのリンク子なので、外部からの停止 (StopCompactionAsync) も引き続き伝播する。
        // 本体は token ではなくこの compactionToken を監視する。
        using var compactionCts = CancellationTokenSource.CreateLinkedTokenSource(token);
        CancellationToken compactionToken = compactionCts.Token;
        Task lockHeartbeatTask = RunLockHeartbeatAsync(runStatusContext, compactionCts);

        try
        {
            foreach ((DateOnly dateOnly, string pathPrefix) in runStatus.TargetDays.Zip(runStatus.TargetPathPrefixes))
            {
                compactionToken.ThrowIfCancellationRequested();
                logger.ZLogInformation($"Starting compaction for date {dateOnly} at path {pathPrefix}");
                try
                {
                    await ExecuteCompactionOneDayAsync(runStatusContext, dateOnly, pathPrefix, compactionToken);
                    logger.ZLogInformation($"Completed compaction for date {dateOnly} at path {pathPrefix}");
                    runStatusContext.CompletedADay(timeProvider.GetUtcNow());
                    await runStatusContext.SaveRunStatusAsync(compactionToken);
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
            await compactionCts.CancelAsync();
            await lockHeartbeatTask;
            await s3LockService.ReleaseLockAsync(runStatus.LockId, CancellationToken.None);
            runStatusContext.CompletedAllDays(timeProvider.GetUtcNow());
            await runStatusContext.SaveRunStatusAsync(CancellationToken.None); // キャンセルされた場合でも保存するように CancellationToken.None
            logger.ZLogInformation($"Compaction process completed at {runStatus.EndTime}");
        }
    }

    /// <summary>
    /// 各 tick はまず進捗ウォッチドッグを見る: 前回のロック延長 (初回ロック取得を含む) から
    /// in-memory の LastActivity が一度も前進していなければロックを延長しない。前進が続く間だけ
    /// 以下のロック延長を行う。無延長のまま LockDuration が経過し (=ロックが期限切れになり)
    /// たら、二重実行を防ぐため compaction をキャンセルする (ロックは期限切れ→次回 run が回復可能)。
    ///
    ///   ┌───────────────────────┐              ┌───────────────┐               ┌────┐
    ///   │ RunLockHeartbeatAsync │              │ S3LockService │               │ S3 │
    ///   └───────────┬───────────┘              └───────┬───────┘               └──┬─┘
    ///               │                                  │                          │
    ///               │   ExtendLockForHeartbeatAsync    │                          │
    ///               │──────────────────────────────────▶                          │
    ///               │                                  │                          │
    ///               │                                  │      Get + CAS Put       │
    ///               │                                  │──────────────────────────▶
    ///               │                                  │                          │
    ///           ┌alt [成功]─────────────────────────────────────────────────────────────┐
    ///           │   │                                  │                          │   │
    ///           │   │                                  │      updated=true        │   │
    ///           │   │                                  ◀╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌│   │
    ///           │   │                                  │                          │   │
    ///           │   │      Extended (counter=0)        │                          │   │
    ///           │   ◀╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌│                          │   │
    ///           │   │                                  │                          │   │
    ///           ├[HttpClientタイムアウト]╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┤
    ///           │   │                                  │                          │   │
    ///           │   │                                  │  TaskCanceledException   │   │
    ///           │   │                                  ◀╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌│   │
    ///           │   │                                  │                          │   │
    ///           │   │  TransientFailure (counter++)    │                          │   │
    ///           │   ◀╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌│                          │   │
    ///           │   │                                  │                          │   │
    ///           ├[CAS競合/ロック消失]╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┤
    ///           │   │                                  │                          │   │
    ///           │   │                                  │      updated=false       │   │
    ///           │   │                                  ◀╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌│   │
    ///           │   │                                  │                          │   │
    ///           │   │  TransientFailure or Abandoned   │                          │   │
    ///           │   ◀╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌│                          │   │
    ///           │   │                                  │                          │   │
    ///           └─────────────────────────────────────────────────────────────────────┘
    ///               │                                  │                          │
    ///               ├───┐                              │                          │
    ///               │   │ Abandoned → CancelAsync + break                         │
    ///               ◀───┘                              │                          │
    ///               │                                  │                          │
    ///   ┌───────────┴───────────┐              ┌───────┴───────┐               ┌──┴─┐
    ///   │ RunLockHeartbeatAsync │              │ S3LockService │               │ S3 │
    ///   └───────────────────────┘              └───────────────┘               └────┘
    /// </summary>
    private async Task RunLockHeartbeatAsync(RunStatusContext runStatusContext, CancellationTokenSource cts)
    {
        string lockId = runStatusContext.RunStatus.LockId;
        // 直近でロックを延長した時点の「進捗」と「時刻」。初回ロック取得時点を初期値とする。
        DateTimeOffset activityAtLastExtension = runStatusContext.GetLastActivityTimestamp();
        DateTimeOffset lastExtensionAt = timeProvider.GetUtcNow();
        while (!cts.Token.IsCancellationRequested)
        {
            try
            {
                await Task.Delay(LockHeartbeatInterval, cts.Token);

                // 進捗ウォッチドッグ: 「ロックの延長 (プロセスの生存)」と「本体の前進 (作業の進捗)」は別物。
                // 本体が (ハング等で) 前進しなくなってもハートビートによるロック延長は成功し続けるため、
                // それだけを根拠にロックを維持すると、ハングしたプロセスがロックを恒久的に握り続け、
                // 次回 run が FinalizeStalledRunAsync でロックを奪えず回復不能になる。
                var now = timeProvider.GetUtcNow();
                var lastActivity = runStatusContext.GetLastActivityTimestamp();

                // 前回のロック延長 (初回ロック取得を含む) から LastActivity が一度も前進していない場合は
                // 本体がストールしているとみなし、ロックを延長しない。前進が続く間だけ延長することで、
                // ハングしたプロセスがハートビートでロックを恒久保持するのを防ぐ。
                // (読み取り/変換/検証/削除の各フェーズは LastActivity を更新するため、
                //  正常なバッチではこのガードに掛からない。)
                if (lastActivity <= activityAtLastExtension)
                {
                    // 延長を止めるとロックは lastExtensionAt + LockDuration で自然に期限切れになる。
                    // 期限切れになると別インスタンスが FinalizeStalledRunAsync でロックを奪い得るため、
                    // 二重実行を防ぐべく、その時点までに本体をキャンセルして停止させる。
                    if (now - lastExtensionAt >= _s3LockService.LockDuration)
                    {
                        logger.ZLogError($"No progress since last lock extension for {now - lastExtensionAt} (>= LockDuration {_s3LockService.LockDuration}). The lock is expiring; stopping compaction so the next run can recover. LockId={lockId}, LastActivity={lastActivity:o}");
                        await cts.CancelAsync();
                        break;
                    }

                    logger.ZLogWarning($"No progress since last lock extension (LastActivity={lastActivity:o}). Skipping heartbeat extension so the lock can expire if the stall persists. LockId={lockId}");
                    continue;
                }

                // 連続失敗回数の管理としきい値判定は S3LockService 側が担う。
                // ここではロックを維持できなくなった (Abandoned) 場合に compaction を止めるだけ。
                LockHeartbeatOutcome outcome = await s3LockService.ExtendLockForHeartbeatAsync(lockId, cts.Token);
                if (outcome == LockHeartbeatOutcome.Abandoned)
                {
                    logger.ZLogError($"Lock heartbeat abandoned after repeated failures. Cancelling compaction to prevent dual execution. LockId={lockId}");
                    await cts.CancelAsync();
                    break;
                }

                // 実際に延長できた (Extended) 場合のみ基準を更新する。
                // TransientFailure では実ロックの expiresAt は進んでいないため、lastExtensionAt を
                // 更新するとロックの実期限とキャンセル判定 (now - lastExtensionAt >= LockDuration) がずれる。
                // また activityAtLastExtension を進めないことで、次 tick も (前進があれば) 延長を再試行できる。
                if (outcome == LockHeartbeatOutcome.Extended)
                {
                    activityAtLastExtension = lastActivity;
                    lastExtensionAt = now;
                }
            }
            // 実際に自分がキャンセルされた場合のみ終了する。
            // HttpClient のタイムアウト等 (TaskCanceledException) は S3LockService 側で
            // 一時的失敗として扱われ、ここには伝播しない。
            catch (OperationCanceledException) when (cts.Token.IsCancellationRequested)
            {
                break;
            }
        }
    }

    private async Task ExecuteCompactionOneDayAsync(RunStatusContext runStatusContext, DateOnly targetDate, string pathPrefix, CancellationToken token)
    {
        logger.ZLogInformation($"List files for {targetDate} at path {pathPrefix}");

        var targetParquetFiles = await s3StorageService.ListParquetFilesAsync(pathPrefix, token);

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
    /// 読み込みファイル量が MaxBatchSizeBytes に達しない範囲でまとめてコンパクションを実行する
    /// </summary>
    /// <returns>対処したファイル</returns>
    private async Task<CompactionBatchResult> CompactionBatchAsync(CompactionBatchContext ctx, CancellationToken token)
    {
        var targetDate = ctx.TargetDate;
        FetchReadParquetFilesResult sendGridEvents = await FetchParquetFilesAsync(ctx, token);
        logger.ZLogInformation($"Total events loaded: {sendGridEvents.Count}");
        var outputFiles = await CreateCompactedParquetAsync(sendGridEvents, ctx, token);
        if (await VerifyOutputFilesAsync(outputFiles, ctx, token))
        {
            // Delete original files after successful verification.
            // 各削除は異なるキーを対象とし独立・冪等 (404 は成功扱い) なので並列実行して安全。
            // 状態更新もスレッドセーフ (_deletedOriginalFiles は ConcurrentQueue、
            // RunStatusContext.IncrementDeletedOriginalFile は OnNext まで含め _lock で直列化済み)。
            var parallelOptions = new ParallelOptions
            {
                MaxDegreeOfParallelism = _compactionOptions.DeleteParallelism,
                CancellationToken = token,
            };
            await Parallel.ForEachAsync(ctx.GetProcessedFiles(), parallelOptions, async (originalFile, ct) =>
            {
                bool deleted = await s3StorageService.DeleteObjectAsync(originalFile, ct);
                if (!deleted)
                {
                    logger.ZLogWarning($"Failed to delete original file (will retry on next run via re-list): {originalFile}");
                }

                // 前進セマンティクス維持: 試行済みは consumed 扱いにして remainFiles を進める。
                // 削除失敗分は翌 run の S3 再 list で再処理される。
                ctx.AddDeletedOriginalFile(originalFile, timeProvider.GetUtcNow());
            });
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

    /// <summary>
    /// Create compacted parquet file for each hour that has data
    /// </summary>
    private async Task<IReadOnlyCollection<string>> CreateCompactedParquetAsync(FetchReadParquetFilesResult fetchReadParquetFilesResult, CompactionBatchContext ctx, CancellationToken token)
    {
        var outputFiles = new List<string>(fetchReadParquetFilesResult.PackedByHours.Count);
        foreach (HourlyFolder hourlyFolder in fetchReadParquetFilesResult.PackedByHours
                     .OrderBy(grp => grp.Key)
                     .Select(kv => kv.Value))
        {
            DateTimeOffset dt = JstExtension.FromUnixTimeSecondsJst(hourlyFolder.KeyUnixTimeSeconds);
            var dateOnly = new DateOnly(dt.Year, dt.Month, dt.Day);
            string outputFileName = string.Empty;
            try
            {
                int hourEventCount = hourlyFolder.Count;
                if (hourEventCount == 0)
                {
                    logger.ZLogWarning($"No events found for this hour group (hour {dt.Hour})");
                    continue;
                }

                logger.ZLogInformation($"Creating compacted file for hour {dt.Hour} with {hourEventCount} events");

                FileStream outputStream = DisposableTempFile.Open(nameof(CreateCompactedParquetAsync));
                try
                {
                    bool convertToParquetResult = await parquetService.ConvertToParquetStreamingAsync(
                        EnumeratePackedEventsAsync(hourlyFolder, token),
                        outputStream,
                        rowGroupSize: _compactionOptions.RowGroupSize,
                        rowGroupMaxEstimatedBytes: _compactionOptions.RowGroupMaxEstimatedBytes,
                        onRowGroupFlushed: metrics =>
                        {
                            LogRowGroupFlushMetrics(metrics);
                            // 変換フェーズはカウンタを更新しないため、flush ごとに liveness を送って
                            // ハートビートのウォッチドッグがストールと誤検知しないようにする。
                            ctx.TouchLastActivity(timeProvider.GetUtcNow());
                        },
                        token: token);
                    if (!convertToParquetResult)
                    {
                        logger.ZLogWarning($"Failed to create parquet data for hour {dt.Hour}");
                        continue;
                    }

                    outputFileName = SendGridPathUtility.GetParquetCompactionFileName(dateOnly, dt.Hour, outputStream);
                    outputStream.Seek(0, SeekOrigin.Begin);
                    // アップロードはカウンタも row group flush も更新しないため、開始前に liveness を送り
                    // この 1 回のアップロードに LockDuration 分の猶予を与える (完了後にも送る)。
                    ctx.TouchLastActivity(timeProvider.GetUtcNow());
                    await s3StorageService.PutObjectAsync(outputStream, outputFileName, token);
                    ctx.TouchLastActivity(timeProvider.GetUtcNow());
                    outputFiles.Add(outputFileName);
                }
                finally
                {
                    // ensure s3StorageService.PutObjectAsync is completed before disposing the stream
                    await outputStream.DisposeAsync();
                }

                logger.ZLogInformation($"Created compacted file: {outputFileName} for hour {dt.Hour}");
            }
            catch (Exception ex)
            {
                logger.ZLogError(ex, $"Failed to create compacted file: {outputFileName} for hour {dt.Hour}");
                throw;
            }
        }
        return outputFiles;
    }

    private static async IAsyncEnumerable<SendGridEvent> EnumeratePackedEventsAsync(
        HourlyFolder hourlyFolder,
        [System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken token)
    {
        foreach (FileInfo packedFile in hourlyFolder.DirectoryInfo.GetFiles().OrderBy(x => x.Name))
        {
            token.ThrowIfCancellationRequested();
            string fullName = packedFile.FullName;
            await using var fs = new FileStream(fullName, FileMode.Open, FileAccess.Read, FileShare.Read, DisposableTempFile.BufferSize, useAsync: true);
            SendGridEvent[] events = await MemoryPackSerializer.DeserializeAsync<SendGridEvent[]>(fs, cancellationToken: token) ?? [];
            foreach (SendGridEvent sendGridEvent in events)
            {
                token.ThrowIfCancellationRequested();
                yield return sendGridEvent;
            }
        }
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
            // ダウンロード+検証は完了時 (AddVerifiedOutputFile) までカウンタを更新しないため、
            // ファイルごとに開始前へ liveness を送り、1 ファイルの検証に LockDuration 分の猶予を与える。
            ctx.TouchLastActivity(timeProvider.GetUtcNow());
            try
            {
                using HttpResponseMessage response = await s3StorageService.GetObjectAsync(outputFile, token);
                if (!response.IsSuccessStatusCode)
                {
                    logger.ZLogError($"Failed to verify compacted file: {outputFile} HttpStatus:{response.StatusCode}");
                    ctx.AddFailedOutputFile(outputFile, timeProvider.GetUtcNow());
                    continue;
                }

                await using Stream responseStream = await response.Content.ReadAsStreamAsync(token);
                // ParquetReader はシーク可能なストリームを要求する
                await using FileStream tempFileStream = DisposableTempFile.Open(nameof(VerifyOutputFilesAsync));
                await responseStream.CopyToAsync(tempFileStream, DisposableTempFile.BufferSize, token);
                tempFileStream.Seek(0, SeekOrigin.Begin);

                using ParquetReader verifyReader = await ParquetReader.CreateAsync(tempFileStream, cancellationToken: token);
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
        internal string ParquetFile { get; init; } = string.Empty;

        /// <summary>
        /// Pipeの受け取り側が Close(Dispose) すること
        /// FileOptions.DeleteOnClose で作成されており Close とともに削除される
        /// </summary>
        public FileStream ParquetTempStream { get; init; } = null!;
    }

    class HourlyFolder
    {
        internal long KeyUnixTimeSeconds { get; private set; }
        internal DirectoryInfo DirectoryInfo { get; init; }
        internal int Count => _count;
        private int _count;

        internal HourlyFolder(DateTimeOffset hourGroupKey, DirectoryInfo directoryInfo)
        {
            KeyUnixTimeSeconds = hourGroupKey.ToUnixTimeSeconds();
            DirectoryInfo = directoryInfo;
            _count = 0;
        }

        internal void AddCount(int cnt) => Interlocked.Add(ref _count, cnt);
    }

    class FetchReadParquetFilesResult
    {
        /// <summary>
        /// 1時間ごとの SendGridEvent 配列を格納した一時ファイルの一覧
        /// </summary>
        internal IReadOnlyDictionary<long, HourlyFolder> PackedByHours { get; init; } = new Dictionary<long, HourlyFolder>();

        internal int Count => PackedByHours.Any() ? PackedByHours.Sum(x => x.Value.Count) : 0;
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
        // consumer が例外で倒れると 満杯チャネルへの producer の WriteAsync が永久ブロックし、
        // compaction が Running のままハングする。producer/consumer のどちらが倒れても
        // linkedCts で相手の待機を解除し、デッドロックを防ぐ。
        using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(token);

        Task producer = RunProducerAsync();
        Task<FetchReadParquetFilesResult> consumer = RunConsumerAsync();

        Exception? producerError = await CaptureAsync(producer);
        (FetchReadParquetFilesResult? result, Exception? consumerError) = await CaptureAsync(consumer);

        // 相手を巻き添えで cancel した OperationCanceledException よりも
        // 本来の失敗原因を優先して投げる
        if (producerError is not null and not OperationCanceledException
            && consumerError is OperationCanceledException)
        {
            ExceptionDispatchInfo.Throw(producerError);
        }
        if (consumerError is not null)
        {
            ExceptionDispatchInfo.Throw(consumerError);
        }
        if (producerError is not null)
        {
            ExceptionDispatchInfo.Throw(producerError);
        }
        return result!;

        async Task RunProducerAsync()
        {
            try
            {
                await FetchParquetFilesProducerAsync(ctx, channel.Writer, linkedCts.Token);
            }
            catch
            {
                // producer が倒れたら consumer 側の読み取り待ちを解除する
                linkedCts.Cancel();
                throw;
            }
            finally
            {
                channel.Writer.TryComplete();
            }
        }

        async Task<FetchReadParquetFilesResult> RunConsumerAsync()
        {
            try
            {
                return await FetchParquetFilesConsumerAsync(ctx, channel.Reader, linkedCts.Token);
            }
            catch
            {
                // consumer が倒れたら producer の WriteAsync を解除する
                linkedCts.Cancel();
                throw;
            }
        }
    }

    /// <summary>
    /// Task の完了を待ち、結果か例外のいずれかを捕捉して返す（例外は再スローしない）。
    /// producer/consumer の双方を待って本来の失敗原因を選別するために使う。
    /// </summary>
    private static async Task<(T? Result, Exception? Error)> CaptureAsync<T>(Task<T> task)
    {
        try
        {
            return (await task, null);
        }
        catch (Exception ex)
        {
            return (default, ex);
        }
    }

    private static async Task<Exception?> CaptureAsync(Task task)
    {
        try
        {
            await task;
            return null;
        }
        catch (Exception ex)
        {
            return ex;
        }
    }


    private async Task<FetchReadParquetFilesResult> FetchParquetFilesConsumerAsync(CompactionBatchContext ctx,
        ChannelReader<SendGridEventsOneFile> reader,
        CancellationToken token)
    {
        DirectoryInfo dailyTargetFolder = ctx.CreateTempFolderForRawFiles(logger);
        var createdHourlyFolders = new Dictionary<long, HourlyFolder>();

        await foreach (SendGridEventsOneFile sendgridEventOneFile in reader.ReadAllAsync(token))
        {
            await using FileStream parquetTempStream = sendgridEventOneFile.ParquetTempStream;
            parquetTempStream.Seek(0, SeekOrigin.Begin);
            using ParquetReader parquetReader = await ParquetReader.CreateAsync(parquetTempStream, cancellationToken: token);
            for (int rowGroupIndex = 0; rowGroupIndex < parquetReader.RowGroupCount; rowGroupIndex++)
            {
                var sendGridEvents = new List<SendGridEvent>();
                using ParquetRowGroupReader rowGroupReader = parquetReader.OpenRowGroupReader(rowGroupIndex);
                await foreach (SendGridEvent sendGridEvent in parquetService.ReadRowGroupEventsAsync(
                                   rowGroupReader, parquetReader, token))
                {
                    sendGridEvents.Add(sendGridEvent);
                }

                foreach (var hourGroup in sendGridEvents.GroupBy(e => e.Timestamp / 3600 /* 1時間単位に分割 */))
                {
                    SendGridEvent[] eventsByHour = hourGroup.ToArray(); // シリアライズする前に 配列にする

                    DateTimeOffset hourGroupKey = JstExtension.FromUnixTimeSecondsJst(hourGroup.Key * 3600);
                    if (!createdHourlyFolders.TryGetValue(hourGroup.Key, out HourlyFolder? hourlyfolder))
                    {
                        string targetFolder = Path.Combine(dailyTargetFolder.FullName, $"{hourGroupKey:yyyyMMddHH}");
                        Directory.CreateDirectory(targetFolder);
                        hourlyfolder = new HourlyFolder(hourGroupKey, new DirectoryInfo(targetFolder));

                        createdHourlyFolders.Add(hourGroup.Key, hourlyfolder);
                    }
                    string originalFileName = Path.GetFileName(sendgridEventOneFile.ParquetFile);
                    // 中断した場合は上書きしたいため 元のファイル名を使う
                    string targetFilePath = Path.Combine(hourlyfolder.DirectoryInfo.FullName, originalFileName);
                    await using var fs = new FileStream(targetFilePath, FileMode.Create, FileAccess.Write, FileShare.None, DisposableTempFile.BufferSize, useAsync: true);
                    await MemoryPackSerializer.SerializeAsync(fs, eventsByHour, cancellationToken: token);

                    hourlyfolder.AddCount(eventsByHour.Length);
                }

                // consumer 側の展開はカウンタを更新しないため、row group ごとに liveness を送る。
                // producer のダウンロード完了 (AddProcessedFile) は先読み分だけ先行し得るので、
                // 巨大ファイルの展開中や producer 完了後の末尾処理でハートビートがストール誤検知しないようにする。
                ctx.TouchLastActivity(timeProvider.GetUtcNow());
            }
        }

        return new FetchReadParquetFilesResult { PackedByHours = createdHourlyFolders, };
    }

    /// <summary>
    /// 読み取り不能だった Parquet ファイルを処理する。
    ///  - S3 オブジェクトメタデータに初回失敗時刻と失敗カウンタを記録する (カウンタは失敗ごとに +1。
    ///    同時実行制御はしない = HEAD→自己 COPY の単純更新)。
    ///  - Warning ログを出力する。
    ///  - 初回失敗から <see cref="CompactionOptions.FailedReadRetentionDays"/> 日以上経過し、かつ
    ///    失敗カウンタが <see cref="CompactionOptions.FailedReadDeleteThreshold"/> 以上に達した場合は
    ///    オブジェクトを削除し Error ログを出力する。
    ///  - 最後に <see cref="CompactionBatchContext.AddFailedReadingParquetFiles"/> で失敗を記録する
    ///    (この時点で後段の削除対象 GetProcessedFiles には含まれず、通常削除からは除外される)。
    /// メタデータ操作の S3 呼び出しはキャンセル以外の例外を握りつぶし、コンパクションのループを止めない。
    /// </summary>
    private async Task HandleUnreadableParquetFileAsync(CompactionBatchContext ctx, string parquetFile, CancellationToken token)
    {
        var now = timeProvider.GetUtcNow();
        // HEAD/COPY はカウンタを更新しないため、ハートビートのストール誤検知を防ぐ liveness を送る。
        ctx.TouchLastActivity(now);

        try
        {
            IReadOnlyDictionary<string, string>? metadata = await s3StorageService.GetObjectMetadataAsync(parquetFile, token);

            DateTimeOffset firstUtc = now;
            int count = 0;
            if (metadata != null)
            {
                if (metadata.TryGetValue(ReadFailureFirstUtcMetadataKey, out string? firstUtcRaw)
                    && DateTimeOffset.TryParse(firstUtcRaw, System.Globalization.CultureInfo.InvariantCulture,
                        System.Globalization.DateTimeStyles.RoundtripKind, out DateTimeOffset parsedFirstUtc))
                {
                    firstUtc = parsedFirstUtc;
                }
                if (metadata.TryGetValue(ReadFailureCountMetadataKey, out string? countRaw)
                    && int.TryParse(countRaw, System.Globalization.NumberStyles.Integer,
                        System.Globalization.CultureInfo.InvariantCulture, out int parsedCount)
                    && parsedCount > 0)
                {
                    count = parsedCount;
                }
            }

            int newCount = count + 1;
            bool retentionElapsed = now - firstUtc >= TimeSpan.FromDays(_compactionOptions.FailedReadRetentionDays);
            bool countReached = newCount >= _compactionOptions.FailedReadDeleteThreshold;

            if (retentionElapsed && countReached)
            {
                bool deleted = await s3StorageService.DeleteObjectAsync(parquetFile, token);
                logger.ZLogError($"Deleting unreadable parquet file {parquetFile} after {newCount} read failures since {firstUtc:o} (retention {_compactionOptions.FailedReadRetentionDays}d, threshold {_compactionOptions.FailedReadDeleteThreshold}). DeleteSucceeded={deleted}");
            }
            else
            {
                var updated = new Dictionary<string, string>(StringComparer.Ordinal)
                {
                    [ReadFailureFirstUtcMetadataKey] = firstUtc.ToString("o", System.Globalization.CultureInfo.InvariantCulture),
                    [ReadFailureCountMetadataKey] = newCount.ToString(System.Globalization.CultureInfo.InvariantCulture),
                };
                await s3StorageService.CopyObjectWithMetadataAsync(parquetFile, updated, token);
                logger.ZLogWarning($"Unreadable parquet file {parquetFile}: read-failure-count={newCount} since {firstUtc:o}. Will delete after {_compactionOptions.FailedReadRetentionDays}d and {_compactionOptions.FailedReadDeleteThreshold} failures.");
            }
        }
        catch (OperationCanceledException) when (token.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception ex)
        {
            // メタデータ更新/削除の失敗はコンパクションを止めない。次回 run で再試行される。
            logger.ZLogWarning(ex, $"Failed to record read-failure metadata for {parquetFile}");
        }

        ctx.TouchLastActivity(timeProvider.GetUtcNow());
        ctx.AddFailedReadingParquetFiles(parquetFile, timeProvider.GetUtcNow());
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
                logger.ZLogInformation($"Reading Parquet file: {parquetFile}");
                using HttpResponseMessage response = await s3StorageService.GetObjectAsync(parquetFile, token);
                if (!response.IsSuccessStatusCode)
                {
                    logger.ZLogWarning($"Failed to download parquet file: {parquetFile} HttpStatus:{response.StatusCode}");
                    await HandleUnreadableParquetFileAsync(ctx, parquetFile, token);
                    continue;
                }

                long? responseLength = response.Content.Headers.ContentLength;
                if (responseLength is null or <= 0)
                {
                    logger.ZLogWarning($"Empty parquet file: {parquetFile}");
                    await HandleUnreadableParquetFileAsync(ctx, parquetFile, token);
                    continue;
                }
                if (ctx.ProcessedBytes > 0
                    && ctx.ProcessedBytes + responseLength.Value > _compactionOptions.MaxBatchSizeBytes)
                {
                    logger.ZLogInformation(
                        $"Reached read limit {_compactionOptions.MaxBatchSizeBytes}, stopping further reads in this batch");
                    break;
                }

                FileStream parquetTempStream = DisposableTempFile.Open(nameof(FetchParquetFilesProducerAsync));
                await using Stream responseStream = await response.Content.ReadAsStreamAsync(token);
                await responseStream.CopyToAsync(parquetTempStream, DisposableTempFile.BufferSize, token);

                await writer.WriteAsync(
                    new SendGridEventsOneFile
                    {
                        ParquetFile = parquetFile,
                        ParquetTempStream = parquetTempStream,
                    }, token);
                ctx.AddProcessedFile(parquetFile, responseLength.Value, timeProvider.GetUtcNow());
                logger.ZLogInformation($"Successfully read from {parquetFile}");
            }
            catch (OperationCanceledException)
            {
                throw;
            }
            catch (Exception ex)
            {
                logger.ZLogError(ex, $"Failed to read parquet file: {parquetFile}");
                await HandleUnreadableParquetFileAsync(ctx, parquetFile, token);
                // 読めなくても処理を続け 無効なファイルとして後で削除する
            }
        }
    }

    private void LogRowGroupFlushMetrics(ParquetService.ParquetRowGroupFlushMetrics metrics) =>
        logger.ZLogDebug(
            $"RowGroup flushed: rows={metrics.RowCount}, estimatedBytes={metrics.EstimatedBytes}, gcTotalMemory={metrics.GcTotalMemoryBytes}, workingSet={metrics.WorkingSetBytes}");
}
