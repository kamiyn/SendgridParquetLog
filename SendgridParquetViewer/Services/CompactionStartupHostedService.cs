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

    public ValueTask DisposeAsync()
    {
        // Dispose is called after StopAsync, so no need to call StopCompactionAsync here.
        // await compactionService.StopCompactionAsync(CancellationToken.None);
        return ValueTask.CompletedTask;
    }
}
