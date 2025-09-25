using System.Diagnostics;

using SendgridParquetViewer.Models;

namespace SendgridParquetViewer.Services;

public sealed class CompactionStartupHostedService(
    CompactionService compactionService
) : IHostedService, IAsyncDisposable
{
    private readonly TimeSpan _periodicSpan = TimeSpan.FromDays(1);
    private CancellationTokenSource? _cts;
    private CompactionStartResult? _compactionStartResult;

    public Task StartAsync(CancellationToken ct)
    {
        _cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
        _ = Task.Run(async () =>
        {
            Stopwatch stopwatch = new();
            do
            {
                stopwatch.Restart();
                _compactionStartResult = await compactionService.StartCompactionAsync(ct);
                if (_compactionStartResult?.StartTask != null)
                {
                    await _compactionStartResult.StartTask;
                }

                TimeSpan elapsed = stopwatch.Elapsed;
                if (elapsed < _periodicSpan)
                {
                    await Task.Delay(elapsed - _periodicSpan, _cts.Token);
                }
            } while (!_cts.IsCancellationRequested);
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
    }

    public ValueTask DisposeAsync()
    {
        // Dispose is called after StopAsync, so no need to call StopCompactionAsync here.
        // await compactionService.StopCompactionAsync(CancellationToken.None);
        return ValueTask.CompletedTask;
    }
}
