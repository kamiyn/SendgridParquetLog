using System.ComponentModel.DataAnnotations;

namespace SendgridParquetViewer.Models;

public class SendgridOptions
{
    public const string SectionName = "SENDGRID";

    [Required]
    public string ApiKey { get; set; } = string.Empty;
}
