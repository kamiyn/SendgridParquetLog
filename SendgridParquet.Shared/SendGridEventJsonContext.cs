using System.Text.Json.Serialization;

namespace SendgridParquet.Shared;

[JsonSerializable(typeof(SendGridEvent[]))]
[JsonSourceGenerationOptions(GenerationMode = JsonSourceGenerationMode.Default, PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase)]
public partial class SendGridEventJsonContext : JsonSerializerContext;
