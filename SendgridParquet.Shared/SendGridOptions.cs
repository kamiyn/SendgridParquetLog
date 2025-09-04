using System.ComponentModel.DataAnnotations;

namespace SendgridParquet.Shared;

public class SendGridOptions
{
    public const string SectionName = "SENDGRID";

#if !DEBUG
    [Required(ErrorMessage = "SENDGRID VERIFICATIONKEY is required")]
#endif
    public string VERIFICATIONKEY { get; set; } = string.Empty;

    /// <summary>
    /// Maximum allowed request body size in bytes for webhook payloads.
    /// Set via environment variable SENDGRID__MAXBODYBYTES. Default is 1 MiB.
    /// </summary>
    [Range(1, 104_857_600)] // 1 .. 100 MiB
    public int MaxBodyBytes { get; set; } = 1 * 1024 * 1024;

    /// <summary>
    /// Allowed skew for webhook timestamp validation.
    /// Parsed with System.TimeSpan.Parse (invariant), e.g. "00:05:00" (5 minutes), "00:00:30" (30 seconds).
    /// Set via environment variable SENDGRID__ALLOWEDSKEW. Default is "00:05:00" (5 minutes).
    /// </summary>
    public string AllowedSkew { get; set; } = "00:05:00";
}
