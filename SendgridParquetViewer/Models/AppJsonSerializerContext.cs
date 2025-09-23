using System.Text.Json.Serialization;

namespace SendgridParquetViewer.Models;

[JsonSerializable(typeof(SendgridParquet.Shared.SendGridEvent[]))]
[JsonSourceGenerationOptions(GenerationMode = JsonSourceGenerationMode.Default, PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase)]
public partial class AppJsonSerializerContext : JsonSerializerContext
{
}
