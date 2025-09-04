using System.Text.Json.Serialization;

namespace SendgridParquetLogger.Models;

[JsonSerializable(typeof(HealthResponse))]
[JsonSerializable(typeof(ErrorResponse))]
[JsonSerializable(typeof(ProcessOkResponse))]
[JsonSerializable(typeof(SendgridParquet.Shared.SendGridEvent[]))]
[JsonSourceGenerationOptions(GenerationMode = JsonSourceGenerationMode.Default, PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase)]
public partial class AppJsonSerializerContext : JsonSerializerContext
{
}
