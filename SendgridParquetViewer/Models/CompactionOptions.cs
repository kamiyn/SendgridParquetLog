using System.ComponentModel.DataAnnotations;

using SendgridParquet.Shared;

namespace SendgridParquetViewer.Models;

public class CompactionOptions : IValidatableObject
{
    public const string SectionName = "Compaction";

    /// <summary>
    /// Compaction処理の定期実行を有効にするかどうか (デフォルト: true)
    /// </summary>
    public bool PeriodicRunEnabled { get; set; } = true;

    /// <summary>
    /// 最大読み込みバイト数 (デフォルト: 256MB)
    /// </summary>
    public long MaxBatchSizeBytes { get; set; } = 256 * 1024 * 1024;

    /// <summary>
    /// Parquet RowGroup の最大行数。バイト量しきい値と併用する安全上限。
    /// 全列バッファのプリアロケート合計は <see cref="ParquetService.MaxColumnBufferPreAllocateBytes"/> (4 GiB) を超えられない。
    /// </summary>
    [Range(1, int.MaxValue)]
    public int RowGroupSize { get; set; } = 25_000;

    /// <summary>
    /// RowGroup フラッシュ時の概算バイト数しきい値 (デフォルト: 48MB)
    /// </summary>
    [Range(1, int.MaxValue)]
    public int RowGroupMaxEstimatedBytes { get; set; } = 48 * 1024 * 1024;

    /// <summary>
    /// 標準では JST基準で昨日以前のものが対象になる
    /// </summary>
    public TimeSpan TargetBefore { get; set; } = TimeSpan.FromDays(-1);

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (RowGroupSize > ParquetService.MaxRowGroupSize)
        {
            yield return new ValidationResult(
                $"RowGroupSize ({RowGroupSize}) must not exceed {ParquetService.MaxRowGroupSize}. " +
                $"Total column buffer pre-allocation is limited to {ParquetService.MaxColumnBufferPreAllocateBytes:N0} bytes.",
                [nameof(RowGroupSize)]);
        }
    }
}
