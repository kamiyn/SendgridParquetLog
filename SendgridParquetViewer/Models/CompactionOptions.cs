namespace SendgridParquetViewer.Models;

public class CompactionOptions
{
    public const string SectionName = "Compaction";

    /// <summary>
    /// 最大読み込みバイト数 (デフォルト: 512MB)
    /// </summary>
    public long MaxBatchSizeBytes { get; set; } = 512 * 1024 * 1024;

    /// <summary>
    /// メモリ上で保持する最大イベント数
    /// </summary>
    public int MaxEventsPerChunk { get; set; } = 10_000;

    /// <summary>
    /// 標準では JST基準で昨日以前のものが対象になる
    /// </summary>
    public TimeSpan TargetBefore { get; set; } = TimeSpan.FromDays(-1);
}
