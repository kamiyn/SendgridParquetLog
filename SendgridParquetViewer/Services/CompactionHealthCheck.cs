using SendgridParquet.Shared;

using ZLogger;

namespace SendgridParquetViewer.Services;

/// <summary>
/// Compaction 実行時に行う簡易な健全性チェック。JST 基準で以下を検知する:
///
/// - 1 日前: <c>v3raw</c> と <c>v3compaction</c> の双方にデータが無ければ警告
///   （Webhook 受信が止まっている可能性。Compaction 実施済みの場合に v3raw だけ空になる
///   ケースを誤警告しないよう、両方を確認する）
/// - 2 日前: <c>v3compaction</c> にデータが無ければ警告
///   （前回の Compaction が出力を生成できていない可能性。v3raw は参照しない）
///
/// 存在有無の判定だけなので <see cref="S3StorageService.AnyFileExistsAsync"/> (max-keys=1) を用いる。
/// </summary>
public sealed class CompactionHealthCheck(
    S3StorageService s3,
    TimeProvider timeProvider,
    ILogger<CompactionHealthCheck> logger)
{
    public async Task<IReadOnlyList<string>> CheckAsync(CancellationToken ct)
    {
        var warnings = new List<string>();

        DateTimeOffset jstNow = timeProvider.GetUtcNow().ToJst();
        DateOnly jstToday = DateOnly.FromDateTime(jstNow.DateTime);
        DateOnly yesterday = jstToday.AddDays(-1);
        DateOnly dayBeforeYesterday = jstToday.AddDays(-2);

        await CheckYesterdayHasData(warnings, yesterday, ct);
        await CheckDayBeforeYesterdayIsCompacted(warnings, dayBeforeYesterday, ct);

        return warnings;
    }

    private async Task CheckYesterdayHasData(List<string> warnings, DateOnly yesterday, CancellationToken ct)
    {
        string rawPrefix = SendGridPathUtility.GetS3NonCompactionPrefix(yesterday.Year, yesterday.Month, yesterday.Day);
        string compactionPrefix = SendGridPathUtility.GetS3CompactionPrefix(yesterday.Year, yesterday.Month, yesterday.Day, hour: null);
        try
        {
            bool anyRaw = await s3.AnyFileExistsAsync(rawPrefix, ct);
            bool anyCompaction = await s3.AnyFileExistsAsync(compactionPrefix, ct);
            if (!anyRaw && !anyCompaction)
            {
                warnings.Add($"1 日前 ({yesterday:yyyy-MM-dd} JST) のデータが S3 に見当たりません (v3raw・v3compaction いずれも 0 件)。Webhook 受信が止まっている可能性があります (raw: {rawPrefix}, compaction: {compactionPrefix})。");
            }
            else
            {
                logger.ZLogInformation($"Health check: yesterday ({yesterday:yyyy-MM-dd}) data present. raw={anyRaw}, compaction={anyCompaction}");
            }
        }
        catch (OperationCanceledException) { throw; }
        catch (Exception ex)
        {
            logger.ZLogError(ex, $"Failed to check yesterday's data presence.");
            warnings.Add($"1 日前 ({yesterday:yyyy-MM-dd} JST) のデータ有無チェックでエラー: {ex.GetType().Name}: {ex.Message}");
        }
    }

    private async Task CheckDayBeforeYesterdayIsCompacted(List<string> warnings, DateOnly dayBeforeYesterday, CancellationToken ct)
    {
        string compactionPrefix = SendGridPathUtility.GetS3CompactionPrefix(dayBeforeYesterday.Year, dayBeforeYesterday.Month, dayBeforeYesterday.Day, hour: null);
        try
        {
            bool anyCompaction = await s3.AnyFileExistsAsync(compactionPrefix, ct);
            if (!anyCompaction)
            {
                warnings.Add($"2 日前 ({dayBeforeYesterday:yyyy-MM-dd} JST) の圧縮済みデータ (v3compaction) が存在しません。前回の Compaction が未完了の可能性があります (prefix: {compactionPrefix})。");
            }
            else
            {
                logger.ZLogInformation($"Health check: day-before-yesterday ({dayBeforeYesterday:yyyy-MM-dd}) has compacted data.");
            }
        }
        catch (OperationCanceledException) { throw; }
        catch (Exception ex)
        {
            logger.ZLogError(ex, $"Failed to check day-before-yesterday's compacted data presence.");
            warnings.Add($"2 日前 ({dayBeforeYesterday:yyyy-MM-dd} JST) の圧縮済みデータ有無チェックでエラー: {ex.GetType().Name}: {ex.Message}");
        }
    }
}
