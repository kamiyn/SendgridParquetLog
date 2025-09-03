using System.ComponentModel.DataAnnotations;

namespace SendgridParquet.Shared;

public class SendGridOptions
{
    public const string SectionName = "SENDGRID";

    [Required(ErrorMessage = "SENDGRID PUBLICKEY is required")]
    public string PUBLICKEY { get; set; } = string.Empty;
}

