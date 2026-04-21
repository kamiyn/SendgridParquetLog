using SendgridParquet.Shared;

using ZLogger;

namespace SendgridParquetViewer.Services;

/// <summary>
/// Compaction 実行時の健全性チェック。以下 3 つの条件が同時に成立したときのみ 1 件の警告を出す。
///
/// <list type="bullet">
///   <item>2 日前 (JST) の圧縮済みデータ (<c>v3compaction</c>) が存在する — 直近の Compaction は動作していた証拠</item>
///   <item>1 日前 (JST) の生データ (<c>v3raw</c>) が存在しない</item>
///   <item>1 日前 (JST) の圧縮済みデータ (<c>v3compaction</c>) が存在しない</item>
/// </list>
///
/// すなわち「Compaction パイプラインは動いているのに 1 日前のデータだけが (raw/compaction のどちらにも) 無い」
/// 状態だけを Webhook 受信停止の強い疑いとして通知する。各条件は独立した警告ではない。
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

        string d2CompactionPrefix = SendGridPathUtility.GetS3CompactionPrefix(dayBeforeYesterday.Year, dayBeforeYesterday.Month, dayBeforeYesterday.Day, hour: null);
        string d1RawPrefix = SendGridPathUtility.GetS3NonCompactionPrefix(yesterday.Year, yesterday.Month, yesterday.Day);
        string d1CompactionPrefix = SendGridPathUtility.GetS3CompactionPrefix(yesterday.Year, yesterday.Month, yesterday.Day, hour: null);

        try
        {
            bool d2Compacted = await s3.AnyFileExistsAsync(d2CompactionPrefix, ct);
            bool d1Raw = await s3.AnyFileExistsAsync(d1RawPrefix, ct);
            bool d1Compacted = await s3.AnyFileExistsAsync(d1CompactionPrefix, ct);

            logger.ZLogInformation($"Health check: d2Compacted={d2Compacted}, d1Raw={d1Raw}, d1Compacted={d1Compacted}");

            if (d2Compacted && !d1Raw && !d1Compacted)
            {
                warnings.Add(
                    $"1 日前 ({yesterday:yyyy-MM-dd} JST) のデータが v3raw・v3compaction のいずれにも存在しません。" +
                    $"一方で 2 日前 ({dayBeforeYesterday:yyyy-MM-dd} JST) の圧縮済みデータ (v3compaction) は存在します。" +
                    $"直近の Compaction パイプラインは動作しているため、Webhook 受信が停止した可能性があります " +
                    $"(d1 raw: {d1RawPrefix}, d1 compaction: {d1CompactionPrefix}, d2 compaction: {d2CompactionPrefix})。");
            }
        }
        catch (OperationCanceledException) { throw; }
        catch (Exception ex)
        {
            logger.ZLogError(ex, $"CompactionHealthCheck failed to query S3");
            warnings.Add($"健全性チェックの S3 照会でエラー: {ex.GetType().Name}: {ex.Message}");
        }

        return warnings;
    }
}
