namespace SendgridParquetViewer.Models;

public class CompactionOptions
{
    public const string SectionName = "Compaction";

    /// <summary>
    /// 最大読み込みバイト数 (デフォルト: 512MB)
    /// </summary>
    public long MaxBatchSizeBytes { get; set; } = 512 * 1024 * 1024;
}
