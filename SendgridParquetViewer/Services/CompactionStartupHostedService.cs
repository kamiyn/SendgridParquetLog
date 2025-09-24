namespace SendgridParquetViewer.Services;

public sealed class CompactionStartupHostedService(
    CompactionService compactionService
) : IHostedService, IAsyncDisposable
{
    public async Task StartAsync(CancellationToken ct)
    {
        await compactionService.StartCompactionAsync(ct);
    }

    public async Task StopAsync(CancellationToken ct)
    {
        await compactionService.StopCompactionAsync(ct);
    }

    public async ValueTask DisposeAsync()
    {
        await compactionService.StopCompactionAsync(CancellationToken.None);
    }
}
