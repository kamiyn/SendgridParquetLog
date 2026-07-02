using System.Text.Json;

using SendgridParquet.Shared;

using SendgridParquetViewer.Models;

using ZLogger;

namespace SendgridParquetViewer.Services;

/// <summary>
/// ハートビートによるロック延長の結果 (ExtendLockForHeartbeatAsync の戻り値)。
///
/// 状態遷移図
/// (1 tick = ExtendLockForHeartbeatAsync 1回 / n = _consecutiveExtendFailures / 上限 = MaxConsecutiveExtendFailures = 3)
///
///        [TryAcquireLockAsync 成功: n:=0]
///                     │
///                     ▼
///                ┌──────────┐  ── 延長成功 (n:=0) ──▶ (自身へ)
///           ┌───▶│ Extended │
///           │    └────┬─────┘
///  延長成功  │         │ 延長失敗 / n++  (n=1, n<上限)
///  (n:=0)   │         ▼
///           │  ┌──────────────────┐  ── 延長失敗 / n++ (n<上限) ──▶ (自身へ)
///           └──┤ TransientFailure │
///              └────┬─────────────┘
///                   │ 延長失敗 / n++  (n>=上限)
///                   ▼
///              ┌───────────┐
///              │ Abandoned │  ── [終端] ──▶ compaction 停止 (dual execution 防止)
///              └───────────┘
///
/// 凡例:
///   延長成功 = ExtendLockExpirationAsync() が true → n を 0 にリセット
///   延長失敗 = false (ロック消失 / 別オーナー / CAS 競合) または一時例外 (HttpClient タイムアウト等) → n をインクリメント
///   ct が実際にキャンセルされた場合は OperationCanceledException を送出しハートビートを終了する (この図の対象外)
/// </summary>
public enum LockHeartbeatOutcome
{
    /// <summary>ロックの延長に成功した (連続失敗回数 n はリセットされる)</summary>
    Extended,

    /// <summary>一時的に延長できなかった (n をインクリメント / n &lt; 上限)。リトライを継続してよい</summary>
    TransientFailure,

    /// <summary>連続失敗が上限に達した (n &gt;= 上限)。ロック維持を諦めるべき (dual execution 防止のため停止する)</summary>
    Abandoned,
}

public interface IS3LockService
{
    TimeSpan LockDuration { get; }
    Task<bool> TryAcquireLockAsync(string lockId, CancellationToken ct);
    /// <summary>
    /// ロックの有効期限を延長する。実際に延長できたときのみ true を返す
    /// (ロック未存在・別オーナー・CAS 競合などで延長できなかった場合は false)。
    /// </summary>
    Task<bool> ExtendLockExpirationAsync(string lockId, CancellationToken ct);
    /// <summary>
    /// ハートビート用のロック延長。連続延長失敗回数を内部で管理し、上限に達したら
    /// <see cref="LockHeartbeatOutcome.Abandoned"/> を返す。呼び出し側が実際に
    /// キャンセルした場合のみ <see cref="OperationCanceledException"/> を送出する
    /// (HttpClient のタイムアウト等は一時的失敗として扱い送出しない)。
    /// </summary>
    Task<LockHeartbeatOutcome> ExtendLockForHeartbeatAsync(string lockId, CancellationToken ct);
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

    private const int MaxConsecutiveExtendFailures = 3;

    // ハートビートによる連続延長失敗回数。ロック取得成功時にリセットされ、
    // 以降は単一のハートビートタスクからのみ更新されるため追加のロックは不要。
    private int _consecutiveExtendFailures;

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
            // 新しいロックを取得したので、前回の実行で溜まったハートビート失敗回数をリセットする
            _consecutiveExtendFailures = 0;
            logger.ZLogInformation($"Lock acquired successfully. Lock ID: {lockId}, Expires at: {lockInfo.ExpiresAt} lockPath:{lockPath}");
        }

        return success;
    }

    public async Task<bool> ExtendLockExpirationAsync(string lockId, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(lockId))
        {
            return false;
        }

        var (_, lockPath) = SendGridPathUtility.GetS3CompactionRunFile();
        var result = await s3StorageService.GetObjectWithETagAsync(lockPath, ct);

        if (result.Content.Length == 0)
        {
            return false;
        }

        LockInfo? existingLock;
        try
        {
            existingLock = JsonSerializer.Deserialize<LockInfo>(result.Content, AppJsonSerializerContext.Default.LockInfo);
        }
        catch (Exception ex)
        {
            logger.ZLogWarning(ex, $"Failed to deserialize existing lock info while extending lock expiration. lockPath:{lockPath}");
            return false;
        }

        if (existingLock == null)
        {
            return false;
        }

        if (!string.Equals(existingLock.LockId, lockId, StringComparison.Ordinal))
        {
            return false;
        }

        if (!string.Equals(existingLock.OwnerId, InstanceId, StringComparison.Ordinal))
        {
            return false;
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

        return updated;
    }

    public async Task<LockHeartbeatOutcome> ExtendLockForHeartbeatAsync(string lockId, CancellationToken ct)
    {
        bool extended;
        try
        {
            extended = await ExtendLockExpirationAsync(lockId, ct);
        }
        catch (OperationCanceledException) when (ct.IsCancellationRequested)
        {
            // 呼び出し側が実際にキャンセルした場合のみ伝播させ、ハートビートを終了させる
            throw;
        }
        catch (Exception ex)
        {
            // HttpClient のタイムアウト (TaskCanceledException) やネットワーク断などの一時的失敗。
            // OperationCanceledException であっても ct 未キャンセルならここで一時的失敗として扱う。
            _consecutiveExtendFailures++;
            logger.ZLogWarning(ex, $"Failed to extend compaction lock by heartbeat. LockId={lockId}, ConsecutiveFailures={_consecutiveExtendFailures}");
            return ClassifyHeartbeatFailure();
        }

        if (extended)
        {
            _consecutiveExtendFailures = 0;
            return LockHeartbeatOutcome.Extended;
        }

        // 例外は出ないが延長できなかった (ロック消失・別オーナー・CAS 競合)
        _consecutiveExtendFailures++;
        logger.ZLogWarning($"Heartbeat could not extend compaction lock. LockId={lockId}, ConsecutiveFailures={_consecutiveExtendFailures}");
        return ClassifyHeartbeatFailure();
    }

    private LockHeartbeatOutcome ClassifyHeartbeatFailure() =>
        _consecutiveExtendFailures >= MaxConsecutiveExtendFailures
            ? LockHeartbeatOutcome.Abandoned
            : LockHeartbeatOutcome.TransientFailure;

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
