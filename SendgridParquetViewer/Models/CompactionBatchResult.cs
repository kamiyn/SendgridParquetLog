namespace SendgridParquetViewer.Models;

internal sealed class CompactionBatchResult
{
    internal IReadOnlyCollection<string> ProcessedFiles { get; init; } = [];
}
