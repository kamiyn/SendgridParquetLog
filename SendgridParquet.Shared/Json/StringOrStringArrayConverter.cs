using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace SendgridParquet.Shared.Json;

/// <summary>
/// Converts a JSON value that may be a string or an array of strings into a single string representation.
/// - If the JSON token is a string, returns that string as-is.
/// - If the JSON token is an array of strings, returns its JSON string (e.g. ["a","b"]).
/// </summary>
public sealed class StringOrStringArrayConverter : JsonConverter<string?>
{
    public override string? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.String)
        {
            return reader.GetString();
        }
        if (reader.TokenType == JsonTokenType.StartArray)
        {
            // Capture the array JSON into a JsonDocument, then return raw text
            using var doc = JsonDocument.ParseValue(ref reader);
            return doc.RootElement.GetRawText();
        }
        if (reader.TokenType == JsonTokenType.Null)
        {
            return null;
        }
        // Fallback: parse the value and return its raw JSON text
        using (var doc = JsonDocument.ParseValue(ref reader))
        {
            return doc.RootElement.GetRawText();
        }
    }

    public override void Write(Utf8JsonWriter writer, string? value, JsonSerializerOptions options)
    {
        // We rarely serialize back, but for safety emit as a JSON string.
        // If the value itself contains JSON (e.g. starts with '['), callers should handle direct emission.
        if (value is null)
        {
            writer.WriteNullValue();
            return;
        }
        writer.WriteStringValue(value);
    }
}

