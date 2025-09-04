namespace SendgridParquet.Shared.Json;

[JsonSerializable(typeof(Shared.SendGridEvent[]))]
[JsonSourceGenerationOptions(GenerationMode = JsonSourceGenerationMode.Metadata, PropertyNamingPolicy = JsonKnownNamingPolicy.Unspecified)]
public partial class SharedJsonContext : JsonSerializerContext
{
}
