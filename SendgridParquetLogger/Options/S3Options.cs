using System.ComponentModel.DataAnnotations;

namespace SendgridParquetLogger.Options;

public class S3Options
{
    public const string SectionName = "S3";

    [Required(ErrorMessage = "S3 SERVICEURL is required")]
    [Url(ErrorMessage = "S3 SERVICEURL must be a valid URL")]
    public string SERVICEURL { get; set; } = string.Empty;

    [Required(ErrorMessage = "S3 REGION is required")]
    public string REGION { get; set; } = string.Empty;

    [Required(ErrorMessage = "S3 ACCESSKEY is required")]
    public string ACCESSKEY { get; set; } = string.Empty;

    [Required(ErrorMessage = "S3 SECRETKEY is required")]
    public string SECRETKEY { get; set; } = string.Empty;

    [Required(ErrorMessage = "S3 BUCKETNAME is required")]
    public string BUCKETNAME { get; set; } = string.Empty;
}
