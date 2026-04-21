using SendgridParquet.Shared;

using ZLogger;

namespace SendgridParquetViewer.Services;

/// <summary>
/// Compaction 実行時に行う簡易な健全性チェック。
/// JST 基準で「1 日前の生データが一切ない」「2 日前の生データが残っている」を検知する。
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
        string prefix = SendGridPathUtility.GetS3NonCompactionPrefix(yesterday.Year, yesterday.Month, yesterday.Day);
        try
        {
            bool anyFile = await s3.AnyFileExistsAsync(prefix, ct);
            if (!anyFile)
            {
                warnings.Add($"1 日前 ({yesterday:yyyy-MM-dd} JST) の Webhook 生データが S3 に見当たりません。Webhook 受信が止まっている可能性があります (prefix: {prefix})。");
            }
            else
            {
                logger.ZLogInformation($"Health check: yesterday ({yesterday:yyyy-MM-dd}) has at least 1 raw file.");
            }
        }
        catch (OperationCanceledException) { throw; }
        catch (Exception ex)
        {
            logger.ZLogError(ex, $"Failed to check yesterday's raw data presence.");
            warnings.Add($"1 日前 ({yesterday:yyyy-MM-dd} JST) のデータ有無チェックでエラー: {ex.GetType().Name}: {ex.Message}");
        }
    }

    private async Task CheckDayBeforeYesterdayIsCompacted(List<string> warnings, DateOnly dayBeforeYesterday, CancellationToken ct)
    {
        string prefix = SendGridPathUtility.GetS3NonCompactionPrefix(dayBeforeYesterday.Year, dayBeforeYesterday.Month, dayBeforeYesterday.Day);
        try
        {
            bool anyFile = await s3.AnyFileExistsAsync(prefix, ct);
            if (anyFile)
            {
                warnings.Add($"2 日前 ({dayBeforeYesterday:yyyy-MM-dd} JST) の生データが残っています。前回の Compaction が未完了の可能性があります (prefix: {prefix})。");
            }
            else
            {
                logger.ZLogInformation($"Health check: day-before-yesterday ({dayBeforeYesterday:yyyy-MM-dd}) raw data is empty (compacted).");
            }
        }
        catch (OperationCanceledException) { throw; }
        catch (Exception ex)
        {
            logger.ZLogError(ex, $"Failed to check day-before-yesterday's raw data residue.");
            warnings.Add($"2 日前 ({dayBeforeYesterday:yyyy-MM-dd} JST) のデータ残存チェックでエラー: {ex.GetType().Name}: {ex.Message}");
        }
    }
}
