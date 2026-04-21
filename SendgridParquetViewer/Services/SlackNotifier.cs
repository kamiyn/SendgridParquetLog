using System.Net.Http.Json;

using Microsoft.Extensions.Options;

using SendgridParquetViewer.Models;

using ZLogger;

namespace SendgridParquetViewer.Services;

/// <summary>
/// Slack Incoming Webhook へ通知を送る。
/// 該当 URL が未設定または Uri.TryCreate で絶対 URI として不正な場合は黙ってスキップする。
/// 例外は内部で吸収し、呼び出し元（Compaction 本処理）の動作に影響を与えない。
/// </summary>
public sealed class SlackNotifier(
    HttpClient httpClient,
    IOptions<SlackNotifierOptions> options,
    ILogger<SlackNotifier> logger)
{
    private readonly SlackNotifierOptions _options = options.Value;

    public Task SendWarningAsync(string text, CancellationToken ct) =>
        SendAsync(_options.TryGetWarningUri(), "warning", text, ct);

    public Task SendInformationAsync(string text, CancellationToken ct) =>
        SendAsync(_options.TryGetInformationUri(), "information", text, ct);

    private async Task SendAsync(Uri? uri, string level, string text, CancellationToken ct)
    {
        if (uri is null)
        {
            logger.ZLogDebug($"Slack {level} webhook is not configured. Skip.");
            return;
        }

        try
        {
            // Slack Incoming Webhook expects { "text": "..." }
            using HttpResponseMessage response = await httpClient.PostAsJsonAsync(uri, new { text }, ct);
            if (response.IsSuccessStatusCode)
            {
                logger.ZLogInformation($"Slack {level} notification sent.");
            }
            else
            {
                string body = await response.Content.ReadAsStringAsync(ct);
                logger.ZLogError($"Slack {level} notification failed. Status: {response.StatusCode}, Body: {body}");
            }
        }
        catch (OperationCanceledException) { throw; }
        catch (Exception ex)
        {
            logger.ZLogError(ex, $"Slack {level} notification threw an exception.");
        }
    }

}
