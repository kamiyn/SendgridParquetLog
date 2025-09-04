using System.ComponentModel.DataAnnotations;

namespace SendgridParquet.Shared;

public class SendGridOptions
{
    public const string SectionName = "SENDGRID";

#if !DEBUG
    [Required(ErrorMessage = "SENDGRID PUBLICKEY is required")]
#endif
    public string PUBLICKEY { get; set; } = string.Empty;
}

