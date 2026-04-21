using Microsoft.Extensions.Options;

using SendgridParquet.Shared;

using SendgridParquetViewer.Models;

using ZLogger;

namespace SendgridParquetViewer.Services;

public sealed class CompactionStartupHostedService(
    ILogger<CompactionStartupHostedService> logger,
    IOptions<CompactionOptions> options,
    CompactionService compactionService,
    TimeProvider timeProvider,
    CompactionHealthCheck healthCheck,
    SlackNotifier slackNotifier
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
            // 初回実行: jitter
            await Jitter(stoppingToken);
            await Run(stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                (DateTimeOffset nextRunJapan, TimeSpan delayUntilNextRun) = CalculateDelayUntilNextScheduledTime(timeProvider);
                logger.ZLogInformation($"Next compaction scheduled at {nextRunJapan:O}");
                await Task.Delay(delayUntilNextRun, stoppingToken);
                // 定時実行: jitter（複数インスタンスの同時ロック確認を分散）
                await Jitter(stoppingToken);
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

    private async Task Jitter(CancellationToken ct)
    {
        var jitterSeconds = Random.Shared.Next(5, 31);
        logger.ZLogInformation($"Compaction jitter: {jitterSeconds}s");
        await Task.Delay(TimeSpan.FromSeconds(jitterSeconds), ct);
    }

    private async Task Run(CancellationToken ct)
    {
        logger.ZLogInformation($"Starting compaction process in CompactionStartupHostedService.");

        var warnings = new List<string>();

        try
        {
            IReadOnlyList<string> healthWarnings = await healthCheck.CheckAsync(ct);
            warnings.AddRange(healthWarnings);
        }
        catch (OperationCanceledException) { throw; }
        catch (Exception ex)
        {
            logger.ZLogError(ex, $"CompactionHealthCheck failed");
            warnings.Add($"健全性チェックでエラー: {ex.GetType().Name}: {ex.Message}");
        }

        try
        {
            CompactionStartResult compactionStartResult = await compactionService.StartCompactionAsync(ct);
            if (compactionStartResult.StartTask != null)
            {
                await compactionStartResult.StartTask;
            }
        }
        catch (OperationCanceledException) { return; }
        catch (Exception ex)
        {
            logger.ZLogError(ex, $"CompactionStartupHostedService");
            warnings.Add($"Compaction 実行中に例外: {ex.GetType().Name}: {ex.Message}");
        }

        await NotifySlack(warnings, ct);
    }

    private async Task NotifySlack(IReadOnlyList<string> warnings, CancellationToken ct)
    {
        DateTimeOffset jstNow = timeProvider.GetUtcNow().ToJst();

        if (warnings.Count > 0)
        {
            var header = $"⚠️ Compaction 健全性チェックに警告 ({jstNow:yyyy-MM-dd HH:mm:ss} JST)";
            var body = string.Join('\n', warnings.Select(w => $"• {w}"));
            await slackNotifier.SendWarningAsync($"{header}\n{body}", ct);
        }
        else
        {
            await slackNotifier.SendInformationAsync($"✅ Daily Compaction 正常実行 ({jstNow:yyyy-MM-dd HH:mm:ss} JST)", ct);
        }
    }
}
