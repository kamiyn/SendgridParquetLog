using System.ComponentModel.DataAnnotations;

namespace SendgridParquet.Shared;

public class SendGridOptions
{
    public const string SectionName = "SENDGRID";

#if !DEBUG
    [Required(ErrorMessage = "SENDGRID VERIFICATIONKEY is required")]
#endif
    public string VERIFICATIONKEY { get; set; } = string.Empty;
}

