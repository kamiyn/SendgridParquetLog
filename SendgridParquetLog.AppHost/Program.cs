using Microsoft.Extensions.Configuration;

var builder = DistributedApplication.CreateBuilder(args);

// Add Redis for caching and session management
// var redis = builder.AddRedis("cache");

// Local helper to add both logger and viewer projects with shared S3 settings
void AddSolutionApps(Func<string> serviceUrlFactory, string region, string accessKey, string secretKey, string bucketName)
{
    builder.AddProject<Projects.SendgridParquetLogger>("sendgridparquetlogger")
        // .WithReference(redis)
        .WithEnvironment("S3__SERVICEURL", serviceUrlFactory)
        .WithEnvironment("S3__REGION", region)
        .WithEnvironment("S3__ACCESSKEY", accessKey)
        .WithEnvironment("S3__SECRETKEY", secretKey)
        .WithEnvironment("S3__BUCKETNAME", bucketName)
        .WithEnvironment("SENDGRID__VERIFICATIONKEY", "VERIFIED");

    builder.AddProject<Projects.SendgridParquetViewer>("sendgridparquetviewer")
        // .WithReference(redis)
        .WithEnvironment("S3__SERVICEURL", serviceUrlFactory)
        .WithEnvironment("S3__REGION", region)
        .WithEnvironment("S3__ACCESSKEY", accessKey)
        .WithEnvironment("S3__SECRETKEY", secretKey)
        .WithEnvironment("S3__BUCKETNAME", bucketName)
        .WithEnvironment("ENABLE_DEV_AUTH", "true");
}

var s3Section = builder.Configuration.GetSection("S3");
if (string.IsNullOrEmpty(s3Section.GetValue<string>("ACCESSKEY")))
{
    var MINIO_ROOT_USER = "minioadmin";
    var MINIO_ROOT_PASSWORD = "minioadmin";
    var MINIO_REGION = "jp-north-1";
    // Add MinIO for S3-compatible storage
    var minio = builder.AddContainer("s3storage", "minio/minio")
        .WithArgs("server", "/data", "--console-address", ":9001")
        .WithEnvironment("MINIO_ROOT_USER", MINIO_ROOT_USER)
        .WithEnvironment("MINIO_ROOT_PASSWORD", MINIO_ROOT_PASSWORD)
        .WithEnvironment("MINIO_REGION", MINIO_REGION)
        .WithEndpoint(9000, targetPort: 9000, name: "api")
        .WithEndpoint(9001, targetPort: 9001, name: "console")
        .WithVolume("minio-data", "/data")
        .WithLifetime(ContainerLifetime.Persistent);

    AddSolutionApps(
        () => $"http://localhost:{minio.GetEndpoint("api").Port}",
        MINIO_REGION,
        MINIO_ROOT_USER,
        MINIO_ROOT_PASSWORD,
        "sendgrid-events");
}
else
{
    // Add the SendGrid Parquet apps using S3 settings from configuration
    AddSolutionApps(
        () => s3Section.GetValue<string>("SERVICEURL")!,
        s3Section.GetValue<string>("REGION")!,
        s3Section.GetValue<string>("ACCESSKEY")!,
        s3Section.GetValue<string>("SECRETKEY")!,
        s3Section.GetValue<string>("BUCKETNAME")!);
}

builder.Build().Run();
