using System.Text.Json.Serialization;

namespace SendgridParquetViewer.Models;

[JsonSerializable(typeof(RunStatus))]
[JsonSerializable(typeof(RunStatus[]))]
[JsonSerializable(typeof(LockInfo))]
[JsonSerializable(typeof(LockInfo[]))]
[JsonSerializable(typeof(SearchCondition))]
[JsonSerializable(typeof(SearchCondition[]))]
[JsonSerializable(typeof(MoreCompactionStatus))]
[JsonSourceGenerationOptions(GenerationMode = JsonSourceGenerationMode.Default,
    PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase,
    WriteIndented = true // 人間が読むこともあるのでインデントする
)]
public partial class AppJsonSerializerContext : JsonSerializerContext
{
}
