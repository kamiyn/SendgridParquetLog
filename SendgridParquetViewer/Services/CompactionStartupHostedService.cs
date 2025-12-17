using Microsoft.Extensions.Options;

using SendgridParquetViewer.Models;

using ZLogger;

namespace SendgridParquetViewer.Services;

public sealed class CompactionStartupHostedService(
    ILogger<CompactionStartupHostedService> logger,
    IOptions<CompactionOptions> options,
    CompactionService compactionService
) : BackgroundService
{
    private readonly TimeSpan _periodicSpan = TimeSpan.FromDays(1);

    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (!options.Value.PeriodicRunEnabled)
        {
            logger.ZLogInformation($"Compaction periodic run is disabled");
            return Task.CompletedTask;
        }

        return Task.Run(async () =>
        {
            await Run(stoppingToken);
            using PeriodicTimer timer = new(_periodicSpan);
            while (await timer.WaitForNextTickAsync(stoppingToken))
            {
                await Run(stoppingToken);
            }
        }, stoppingToken).ContinueWith(_ => compactionService.StopCompactionAsync(CancellationToken.None), CancellationToken.None);
    }

    private async Task Run(CancellationToken ct)
    {
        logger.ZLogInformation($"Starting compaction process in CompactionStartupHostedService.");
        try
        {
            CompactionStartResult compactionStartResult = await compactionService.StartCompactionAsync(ct);
            if (compactionStartResult.StartTask != null)
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
