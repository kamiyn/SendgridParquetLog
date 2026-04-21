namespace SendgridParquetViewer.Models;

/// <summary>
/// AzureAd 構成のうち、Slack 通知にアプリケーション識別情報として載せたい部分だけを取り出すための Options。
/// 認証用の OpenIdConnectOptions バインディングとは独立に <c>AzureAd</c> セクションへバインドする。
/// </summary>
public class AzureAdIdentityOptions
{
    public const string SectionName = "AzureAd";

    public string? ClientId { get; set; }
    public string? TenantId { get; set; }
}
