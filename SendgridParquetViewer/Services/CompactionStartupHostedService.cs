using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

using SendgridParquetViewer.Models;

using ZLogger;

namespace SendgridParquetViewer.Services;

public sealed class CompactionStartupHostedService(
    IServiceScopeFactory scopeFactory,
    ILogger<CompactionStartupHostedService> logger
) : IHostedService, IAsyncDisposable
{
    private CancellationTokenSource? _startupCancellation;
    private Task? _startupTask;

    public Task StartAsync(CancellationToken cancellationToken)
    {
        _startupCancellation = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        _startupTask = StartCompactionAsync(_startupCancellation.Token);
        return Task.CompletedTask;
    }

    public async Task StopAsync(CancellationToken cancellationToken)
    {
        if (_startupCancellation is null)
        {
            return;
        }

        _startupCancellation.Cancel();

        if (_startupTask is null)
        {
            return;
        }

        try
        {
            await Task.WhenAny(_startupTask, Task.Delay(Timeout.Infinite, cancellationToken));
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            // Host is shutting down; nothing else to do.
        }
    }

    private async Task StartCompactionAsync(CancellationToken cancellationToken)
    {
        try
        {
            await using var scope = scopeFactory.CreateAsyncScope();
            var compactionService = scope.ServiceProvider.GetRequiredService<CompactionService>();

            static Task IgnoreRunStatusAsync(RunStatus? _) => Task.CompletedTask;

            var result = await compactionService.StartCompactionAsync(IgnoreRunStatusAsync, cancellationToken);
            if (!result.CanStart)
            {
                logger.ZLogInformation($"Compaction startup skipped: {result.Reason}");
                return;
            }

            if (result.StartTime is { } startedAt)
            {
                logger.ZLogInformation($"Background compaction started at {startedAt:O}.");
            }
            else
            {
                logger.ZLogInformation($"Background compaction start completed without reported start time.");
            }
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            logger.ZLogInformation($"Compaction startup cancelled.");
        }
        catch (Exception ex)
        {
            logger.ZLogError(ex, $"Unhandled exception while starting compaction on application boot.");
        }
    }

    public async ValueTask DisposeAsync()
    {
        if (_startupCancellation is not null)
        {
            _startupCancellation.Cancel();
            _startupCancellation.Dispose();
        }

        if (_startupTask is not null)
        {
            try
            {
                await _startupTask.ConfigureAwait(false);
            }
            catch (OperationCanceledException)
            {
                // Ignore cancellation on disposal.
            }
        }
    }
}
