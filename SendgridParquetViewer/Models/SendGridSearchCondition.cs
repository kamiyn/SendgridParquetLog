namespace SendgridParquetViewer.Models;

/// <summary>
/// SendGrid events search conditions
/// </summary>
public class SendGridSearchCondition
{
    /// <summary>
    /// Email address filter (LIKE clause case-insensitive)
    /// </summary>
    public string? Email { get; init; }

    /// <summary>
    /// Event type filter (exact match)
    /// </summary>
    public string? Event { get; init; }

    /// <summary>
    /// sg_template_id filter (exact match)
    /// </summary>
    public string? SgTemplateId { get; init; }

    public static readonly SendGridSearchCondition Empty = new SendGridSearchCondition();

    /// <summary>
    /// Generate WHERE clause for SQL query
    /// </summary>
    /// <returns>WHERE clause string (empty if no conditions)</returns>
    public string BuildWhereClause()
    {
        var conditions = new List<string>();

        if (!string.IsNullOrWhiteSpace(Email))
        {
            // Escape single quotes to prevent SQL injection
            string emailEscaped = Email.Replace("'", "''");
            conditions.Add($"email ILIKE '{emailEscaped}'"); // DuckDB uses ILIKE for case-insensitive LIKE
        }

        if (!string.IsNullOrWhiteSpace(Event))
        {
            // Escape single quotes to prevent SQL injection
            string eventEscaped = Event.Replace("'", "''");
            conditions.Add($"event = '{eventEscaped}'");
        }

        if (!string.IsNullOrWhiteSpace(SgTemplateId))
        {
            // Escape single quotes to prevent SQL injection
            string sgTemplateIdEscaped = SgTemplateId.Replace("'", "''");
            conditions.Add($"sg_template_id = '{sgTemplateIdEscaped}'");
        }

        return conditions.Any() ? $"WHERE {string.Join(" AND ", conditions)}" : string.Empty;
    }
}

/// <summary>
/// SendGrid event types constants
/// https://www.twilio.com/docs/sendgrid/for-developers/tracking-events/event#event-objects
/// </summary>
public static class SendGridEventTypes
{
    public const string Delivered = "delivered";
    public const string Deferred = "deferred";
    public const string Bounce = "bounce";
    public const string Dropped = "dropped";
    public const string Processed = "processed";
    public const string Open = "open";
    public const string Click = "click";
    public const string SpamReport = "spamreport";
    public const string Unsubscribe = "unsubscribe";
    public const string GroupUnsubscribe = "group_unsubscribe";

    /// <summary>
    /// All available event types for dropdown selection
    /// </summary>
    public static readonly (string Value, string Display)[] AllEventTypes =
    [
        ("", "全イベント"),
        (Processed, $"処理済み({Processed})"),
        (Delivered, $"配信完了({Delivered})"),
        (Deferred, $"配信遅延({Deferred})"),
        (Bounce, $"バウンス({Bounce})"),
        (Dropped, $"ドロップ({Dropped})"),
        (Open, $"開封({Open})"),
        (Click, $"クリック({Click})"),
        (SpamReport, $"スパム報告({SpamReport})"),
        (Unsubscribe, $"配信停止({Unsubscribe})"),
        (GroupUnsubscribe, $"グループ配信停止({GroupUnsubscribe})")
    ];
}
