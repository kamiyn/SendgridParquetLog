namespace SendgridParquetViewer.Services;

public sealed class CompactionStartupHostedService(
    CompactionService compactionService
) : IHostedService, IAsyncDisposable
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        await compactionService.StartCompactionAsync(cancellationToken);
    }

    public async Task StopAsync(CancellationToken cancellationToken)
    {
        await compactionService.StopCompactionAsync(cancellationToken);
    }

    public async ValueTask DisposeAsync()
    {
        await compactionService.StopCompactionAsync(CancellationToken.None);
    }
}
