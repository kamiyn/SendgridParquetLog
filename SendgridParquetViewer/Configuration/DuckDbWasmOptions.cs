using System.ComponentModel.DataAnnotations;

namespace SendgridParquetViewer.Configuration;

public sealed class DuckDbWasmOptions
{
    public const string SectionName = "DuckDbWasm";

    [Required]
    public string BundleBasePath { get; set; } = "/duckdb";

    [Required]
    public string ModuleLoader { get; set; } = "duckdb-browser-bundle.js";

    [Required]
    public string MainModule { get; set; } = "duckdb-eh.wasm";

    public string? PthreadWorker { get; set; } = "duckdb-browser-coi.pthread.worker.js";

    [Required]
    public string MainWorker { get; set; } = "duckdb-browser-eh.worker.js";
}
