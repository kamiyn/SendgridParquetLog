using System.Text.Json.Serialization;

namespace SendgridParquetViewer.Models;

public sealed class DuckDbWasmOptions
{
    public string BundleBasePath { get; set; } = "/duckdb";

    public string MainModule { get; set; } = "duckdb-eh.wasm";

    public string PthreadWorker { get; set; } = "duckdb-browser-coi.pthread.worker.js";

    public string MainWorker { get; set; } = "duckdb-browser-eh.worker.js";

    public string ModuleLoader { get; set; } = "duckdb-browser-bundle.js";
}

public sealed class SearchCondition
{
    [JsonPropertyName("parquetUrls")]
    public IReadOnlyCollection<string> ParquetUrls { get; set; } = [];

    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [JsonPropertyName("eventType")]
    public string EventType { get; set; } = string.Empty;

    [JsonPropertyName("sgTemplateId")]
    public string SgTemplateId { get; set; } = string.Empty;
}
