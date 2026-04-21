using System.Text.Json.Serialization;

namespace SendgridParquetViewer.Models;

/// <summary>
/// 追加コンパクション (MoreCompaction) の完了マーカー。
/// この JSON が対象年月に存在すれば、当該年月の全 yyyy/MM/dd/HH フォルダに
/// Parquet ファイルが 1 つしか存在しないことが保証される。
/// </summary>
public class MoreCompactionStatus
{
    [JsonPropertyName("year")]
    public int Year { get; init; }

    [JsonPropertyName("month")]
    public int Month { get; init; }

    [JsonPropertyName("completedAt")]
    public DateTimeOffset CompletedAt { get; init; }

    /// <summary>
    /// 確認した yyyy/MM/dd/HH フォルダの数。
    /// </summary>
    [JsonPropertyName("verifiedHourFolders")]
    public int VerifiedHourFolders { get; init; }
}
