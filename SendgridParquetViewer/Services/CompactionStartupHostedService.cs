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
    private static readonly TimeZoneInfo s_japanTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Tokyo");
    private const int ScheduledHour = 6; // 日本時間午前6時

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
            while (!stoppingToken.IsCancellationRequested)
            {
                TimeSpan delayUntilNextRun = CalculateDelayUntilNextScheduledTime();
                logger.ZLogInformation($"Next compaction scheduled in {delayUntilNextRun}");
                await Task.Delay(delayUntilNextRun, stoppingToken);
                await Run(stoppingToken);
            }
        }, stoppingToken).ContinueWith(_ => compactionService.StopCompactionAsync(CancellationToken.None), CancellationToken.None);
    }

    private static TimeSpan CalculateDelayUntilNextScheduledTime()
    {
        DateTimeOffset now = DateTimeOffset.UtcNow;
        DateTimeOffset japanNow = TimeZoneInfo.ConvertTime(now, s_japanTimeZone);
        DateTimeOffset nextRunJapan = new(japanNow.Date.AddHours(ScheduledHour), s_japanTimeZone.GetUtcOffset(japanNow));

        if (japanNow >= nextRunJapan)
        {
            nextRunJapan = nextRunJapan.AddDays(1);
        }

        return nextRunJapan - now;
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
