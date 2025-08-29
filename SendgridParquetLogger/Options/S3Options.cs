using System.ComponentModel.DataAnnotations;

namespace SendgridParquetLogger.Options;

public class S3Options
{
    public const string SectionName = "S3";

    [Required(ErrorMessage = "S3 ServiceUrl is required")]
    [Url(ErrorMessage = "S3 ServiceUrl must be a valid URL")]
    public string ServiceUrl { get; set; } = string.Empty;

    [Required(ErrorMessage = "S3 AccessKey is required")]
    public string AccessKey { get; set; } = string.Empty;

    [Required(ErrorMessage = "S3 SecretKey is required")]
    public string SecretKey { get; set; } = string.Empty;

    [Required(ErrorMessage = "S3 BucketName is required")]
    public string BucketName { get; set; } = string.Empty;
}
