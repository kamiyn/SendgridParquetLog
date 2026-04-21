namespace SendgridParquetViewer.Models;

public class SlackNotifierOptions
{
    public const string SectionName = "SlackNotifier";

    /// <summary>
    /// 警告通知用 Slack Incoming Webhook URL (任意)。
    /// 未設定または絶対 URI として不正な値の場合は警告通知をスキップする。
    /// </summary>
    public string? WarningWebhookUrl { get; set; }

    /// <summary>
    /// 情報通知用 Slack Incoming Webhook URL (任意)。
    /// 未設定または絶対 URI として不正な値の場合は情報通知をスキップする。
    /// </summary>
    public string? InformationWebhookUrl { get; set; }

    public Uri? TryGetWarningUri() => TryParseAbsoluteHttp(WarningWebhookUrl);
    public Uri? TryGetInformationUri() => TryParseAbsoluteHttp(InformationWebhookUrl);

    private static Uri? TryParseAbsoluteHttp(string? s) =>
        Uri.TryCreate(s, UriKind.Absolute, out Uri? u) &&
        (u.Scheme == Uri.UriSchemeHttp || u.Scheme == Uri.UriSchemeHttps)
            ? u
            : null;
}
