namespace SendgridParquetViewer.Models;

public class CompactionOptions
{
    public const string SectionName = "Compaction";

    /// <summary>
    /// 最大読み込みバイト数 (デフォルト: 256MB)
    /// 
    /// アプリケーション自体が 300MB 程度消費し
    /// 読み込みと 書き込みのためのバッファで概ね2倍使うため 1GB インスタンスの場合最大 350MB 程度となる
    /// </summary>
    public long MaxBatchSizeBytes { get; set; } = 512 * 1024 * 1024;

    /// <summary>
    /// 標準では JST基準で昨日以前のものが対象になる
    /// </summary>
    public TimeSpan TargetBefore { get; set; } = TimeSpan.FromDays(-1);
}
