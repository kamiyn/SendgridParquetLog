using System.Threading;

namespace SendgridParquetViewer.Services;

public sealed class CompactionStartupHostedService(
    CompactionService compactionService
) : IHostedService, IAsyncDisposable
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        await compactionService.StartCompactionAsync((_) => Task.CompletedTask, cancellationToken);
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
