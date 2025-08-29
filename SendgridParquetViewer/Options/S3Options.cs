﻿namespace SendgridParquetViewer.Options;

public class S3Options
{
    public const string SectionName = "S3";

    public string ServiceUrl { get; set; } = string.Empty;
    public string AccessKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public string BucketName { get; set; } = string.Empty;
}
