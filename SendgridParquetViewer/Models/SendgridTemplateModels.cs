namespace SendgridParquetViewer.Models;

/// <summary>
/// SendGrid API /v3/templates/{templateId} のレスポンス
/// </summary>
public class SendgridTemplateItemResult
{
    public string Id { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Generation { get; init; } = string.Empty;
    public string Updated_At { get; init; } = string.Empty;
    public IList<SendgridTemplateItemVersion> Versions { get; init; } = Array.Empty<SendgridTemplateItemVersion>();
}

public class SendgridTemplateItemVersion
{
    public string Id { get; init; } = string.Empty;
    public int User_Id { get; init; }
    public string Template_Id { get; init; } = string.Empty;
    public int Active { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Html_Content { get; init; } = string.Empty;
    public string Plain_Content { get; init; } = string.Empty;
    public bool Generate_Plain_Content { get; init; }
    public string Subject { get; init; } = string.Empty;
    public string Updated_At { get; init; } = string.Empty;
    public string Editor { get; init; } = string.Empty;
    public string Test_Data { get; init; } = string.Empty;
    public string Thumbnail_Url { get; init; } = string.Empty;
}
