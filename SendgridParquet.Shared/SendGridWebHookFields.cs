namespace SendgridParquet.Shared;

public static class SendGridWebHookFields
{
    /// <summary>
    /// Parquet 列定義のバージョンに合わせて フォルダー名の prefix を付与する
    ///
    /// Compaction 前のフォルダー名
    /// </summary>
    public const string FolderPrefixNonCompaction = "v2raw";

    /// <summary>
    /// Parquet 列定義のバージョンに合わせて フォルダー名の prefix を付与する
    ///
    /// Compaction 後のフォルダー名
    /// </summary>
    public const string FolderPrefixCompaction = "v2compaction";

    public const string Email = "email";
    public const string Timestamp = "timestamp";
    public const string Event = "event";
    public const string Category = "category";
    public const string SgEventId = "sg_event_id";
    public const string SgTemplateId = "sg_template_id";
    public const string SgMessageId = "sg_message_id";
    public const string SmtpId = "smtp-id";
    public const string UserAgent = "useragent";
    public const string Ip = "ip";
    public const string Url = "url";
    public const string Reason = "reason";
    public const string Status = "status";
    public const string Response = "response";
    public const string Tls = "tls";
    public const string Attempt = "attempt";
    public const string Type = "type";
    public const string BounceClassification = "bounce_classification";
    public const string AsmGroupId = "asm_group_id";
    public const string UniqueArgs = "unique_args";
    public const string MarketingCampaignId = "marketing_campaign_id";
    public const string MarketingCampaignName = "marketing_campaign_name";
    public const string Pool = "pool";
    public const string SendAt = "send_at";

    public const string SmtpIdParquetColumn = "smtp_id";
    public const string PoolNameParquetColumn = "pool_name";
    public const string PoolIdParquetColumn = "pool_id";

    public static class PoolFields
    {
        public const string Name = "name";
        public const string Id = "id";
    }
}
