using ZLogger;

namespace SendgridParquetViewer.Services;

public sealed class CompactionStartupHostedService(
    ILogger<CompactionStartupHostedService> logger,
    CompactionService compactionService
) : BackgroundService
{
    private readonly TimeSpan _periodicSpan = TimeSpan.FromDays(1);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await Run(stoppingToken);
        using var timer = new PeriodicTimer(_periodicSpan);
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            await Run(stoppingToken);
        }

        await compactionService.StopCompactionAsync(CancellationToken.None);
    }

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
}
