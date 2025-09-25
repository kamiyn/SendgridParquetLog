using ZLogger;

namespace SendgridParquetViewer.Services;

public sealed class CompactionStartupHostedService(
    ILogger<CompactionStartupHostedService> logger,
    CompactionService compactionService
) : IHostedService, IAsyncDisposable
{
    private readonly TimeSpan _periodicSpan = TimeSpan.FromDays(1);
    private CancellationTokenSource? _cts;
    private Task? _loopTask;

    private async Task Run(CancellationToken ct)
    {
        logger.ZLogInformation($"Starting compaction process in CompactionStartupHostedService.");
        try
        {
            var compactionStartResult = await compactionService.StartCompactionAsync(ct);
            if (compactionStartResult?.StartTask != null)
            {
                await compactionStartResult.StartTask;
            }
        }
        catch (OperationCanceledException) { }
        catch (Exception ex)
        {
            logger.ZLogError(ex, $"CompactionStartupHostedService");
        }
    }

    public Task StartAsync(CancellationToken ct)
    {
        _cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
        _ = Run(_cts.Token).ContinueWith(t =>
        {
            if (t.Exception != null)
            {
                logger.ZLogError(t.Exception, "Exception in initial compaction Run task");
            }
        }, TaskContinuationOptions.OnlyOnFaulted);
        _loopTask = Task.Run(async () =>
        {
            using var timer = new PeriodicTimer(_periodicSpan);
            while (await timer.WaitForNextTickAsync(_cts.Token))
            {
                await Run(_cts.Token);
            }
        }, _cts.Token);
        return Task.CompletedTask;
    }

    public async Task StopAsync(CancellationToken ct)
    {
        if (_cts != null)
        {
            await _cts.CancelAsync();
        }
        await compactionService.StopCompactionAsync(ct);
        if (_loopTask != null)
        {
            try
            {
                await _loopTask;
            }
            catch (OperationCanceledException) { }
            catch (Exception ex)
            {
                logger.ZLogError(ex, $"Error occurred during hosted service shutdown in StopAsync");
            }
        }
    }

    public async ValueTask DisposeAsync()
    {
        if (_cts != null)
        {
            await _cts.CancelAsync();
            _cts.Dispose();
            _cts = null;
        }
        // Dispose is called after StopAsync, so no need to call StopCompactionAsync here.
        // await compactionService.StopCompactionAsync(CancellationToken.None);
    }
}
