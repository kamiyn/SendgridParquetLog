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
    IOptions<AzureAdIdentityOptions> azureAdIdentity,
    ILogger<SlackNotifier> logger)
{
    // 通知は運用補助のため、Slack 側が遅い/ハングしても Compaction 本処理をブロックしない。
    // 呼び出し元の CancellationToken とリンクし、短いタイムアウトで打ち切る。
    private static readonly TimeSpan s_httpTimeout = TimeSpan.FromSeconds(5);

    private readonly SlackNotifierOptions _options = options.Value;
    private readonly AzureAdIdentityOptions _azureAdIdentity = azureAdIdentity.Value;

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

        string payloadText = PrependIdentity(text);

        using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
        cts.CancelAfter(s_httpTimeout);

        try
        {
            // Slack Incoming Webhook expects { "text": "..." }
            using HttpResponseMessage response = await httpClient.PostAsJsonAsync(uri, new { text = payloadText }, cts.Token);
            if (response.IsSuccessStatusCode)
            {
                logger.ZLogInformation($"Slack {level} notification sent.");
            }
            else
            {
                string body = await response.Content.ReadAsStringAsync(cts.Token);
                logger.ZLogError($"Slack {level} notification failed. Status: {response.StatusCode}, Body: {body}");
            }
        }
        catch (OperationCanceledException) when (ct.IsCancellationRequested)
        {
            // 呼び出し元のキャンセルは伝搬する
            throw;
        }
        catch (OperationCanceledException)
        {
            // タイムアウト: 通知失敗として握りつぶす
            logger.ZLogError($"Slack {level} notification timed out after {s_httpTimeout.TotalSeconds:0}s.");
        }
        catch (Exception ex)
        {
            logger.ZLogError(ex, $"Slack {level} notification threw an exception.");
        }
    }

    /// <summary>
    /// アプリケーション特定の助けになるよう、AzureAd ClientId / TenantId をメッセージ先頭に差し込む。
    /// どちらも未設定の場合はヘッダーを省略する。
    /// </summary>
    private string PrependIdentity(string text)
    {
        string clientId = string.IsNullOrEmpty(_azureAdIdentity.ClientId) ? "(unset)" : _azureAdIdentity.ClientId;
        string tenantId = string.IsNullOrEmpty(_azureAdIdentity.TenantId) ? "(unset)" : _azureAdIdentity.TenantId;

        if (clientId == "(unset)" && tenantId == "(unset)")
        {
            return text;
        }

        return $"📍 AzureAd ClientId=`{clientId}` TenantId=`{tenantId}`\n{text}";
    }
}
