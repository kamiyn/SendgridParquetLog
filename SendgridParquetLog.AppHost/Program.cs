using Google.Protobuf.WellKnownTypes;

using Microsoft.Extensions.Configuration;

var builder = DistributedApplication.CreateBuilder(args);

// Add Redis for caching and session management
// var redis = builder.AddRedis("cache");

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

    // Add the SendGrid Parquet Logger API
    builder.AddProject<Projects.SendgridParquetLogger>("sendgridparquetlogger")
        // .WithReference(redis)
        .WithEnvironment("S3__SERVICEURL", () => $"http://localhost:{minio.GetEndpoint("api").Port}")
        .WithEnvironment("S3__REGION", MINIO_REGION)
        .WithEnvironment("S3__ACCESSKEY", MINIO_ROOT_USER)
        .WithEnvironment("S3__SECRETKEY", MINIO_ROOT_PASSWORD)
        .WithEnvironment("S3__BUCKETNAME", "sendgrid-events")
        .WithEnvironment("SENDGRID__VERIFICATIONKEY", "VERIFIED")
        ;

    builder.AddProject<Projects.SendgridParquetViewer>("sendgridparquetviewer")
        // .WithReference(redis)
        .WithEnvironment("S3__SERVICEURL", () => $"http://localhost:{minio.GetEndpoint("api").Port}")
        .WithEnvironment("S3__REGION", MINIO_REGION)
        .WithEnvironment("S3__ACCESSKEY", MINIO_ROOT_USER)
        .WithEnvironment("S3__SECRETKEY", MINIO_ROOT_PASSWORD)
        .WithEnvironment("S3__BUCKETNAME", "sendgrid-events")
        .WithEnvironment("AzureAd__Instance", "")
        ;
}
else
{
    builder.AddProject<Projects.SendgridParquetLogger>("sendgridparquetlogger")
        .WithEnvironment("S3__SERVICEURL", s3Section.GetValue<string>("SERVICEURL"))
        .WithEnvironment("S3__REGION", s3Section.GetValue<string>("REGION"))
        .WithEnvironment("S3__ACCESSKEY", s3Section.GetValue<string>("ACCESSKEY"))
        .WithEnvironment("S3__SECRETKEY", s3Section.GetValue<string>("SECRETKEY"))
        .WithEnvironment("S3__BUCKETNAME", s3Section.GetValue<string>("BUCKETNAME"))
        .WithEnvironment("SENDGRID__VERIFICATIONKEY", "VERIFIED")
        ;

    builder.AddProject<Projects.SendgridParquetViewer>("sendgridparquetviewer")
        .WithEnvironment("S3__SERVICEURL", s3Section.GetValue<string>("SERVICEURL"))
        .WithEnvironment("S3__REGION", s3Section.GetValue<string>("REGION"))
        .WithEnvironment("S3__ACCESSKEY", s3Section.GetValue<string>("ACCESSKEY"))
        .WithEnvironment("S3__SECRETKEY", s3Section.GetValue<string>("SECRETKEY"))
        .WithEnvironment("S3__BUCKETNAME", s3Section.GetValue<string>("BUCKETNAME"))
        .WithEnvironment("AzureAd__Instance", "")
        ;
}

builder.Build().Run();
