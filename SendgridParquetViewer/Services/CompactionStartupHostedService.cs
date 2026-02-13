using Microsoft.Extensions.Options;

using SendgridParquetViewer.Models;

using ZLogger;

namespace SendgridParquetViewer.Services;

public sealed class CompactionStartupHostedService(
    ILogger<CompactionStartupHostedService> logger,
    IOptions<CompactionOptions> options,
    CompactionService compactionService,
    TimeProvider timeProvider
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
            // 初回実行: 複数インスタンスの競合を避けるためランダムな jitter を入れる
            var jitterSeconds = Random.Shared.Next(5, 31);
            logger.ZLogInformation($"Initial compaction startup jitter: {jitterSeconds}s");
            await Task.Delay(TimeSpan.FromSeconds(jitterSeconds), stoppingToken);

            // jitter 後にロックの有効期限を確認（他インスタンスが先にクリーンアップしていないか再確認）
            try
            {
                var lockInfo = await compactionService.CleanupExpiredLockAsync(stoppingToken);
                if (lockInfo != null)
                {
                    logger.ZLogInformation($"Lock is still valid (ExpiresAt: {lockInfo.ExpiresAt:s}). Another instance may be running.");
                }
            }
            catch (Exception ex)
            {
                logger.ZLogError(ex, $"Error during initial lock cleanup");
            }

            await Run(stoppingToken);
            while (!stoppingToken.IsCancellationRequested)
            {
                (DateTimeOffset nextRunJapan, TimeSpan delayUntilNextRun) = CalculateDelayUntilNextScheduledTime(timeProvider);
                logger.ZLogInformation($"Next compaction scheduled at {nextRunJapan:O}");
                await Task.Delay(delayUntilNextRun, stoppingToken);
                await Run(stoppingToken);
            }
        }, stoppingToken).ContinueWith(_ => compactionService.StopCompactionAsync(CancellationToken.None), CancellationToken.None);
    }

    private static (DateTimeOffset nextRunJapan, TimeSpan delayUntilNextRun) CalculateDelayUntilNextScheduledTime(TimeProvider timeProvider)
    {
        DateTimeOffset now = timeProvider.GetUtcNow();
        DateTimeOffset japanNow = TimeZoneInfo.ConvertTime(now, s_japanTimeZone);
        DateTimeOffset nextRunJapan = new(japanNow.Date.AddHours(ScheduledHour), s_japanTimeZone.GetUtcOffset(japanNow));

        if (japanNow > nextRunJapan)
        {
            nextRunJapan = nextRunJapan.AddDays(1);
        }

        return (nextRunJapan, nextRunJapan - now);
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
