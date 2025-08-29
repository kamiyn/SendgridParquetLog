var builder = DistributedApplication.CreateBuilder(args);

// Add Redis for caching and session management
var redis = builder.AddRedis("cache");

// Add MinIO for S3-compatible storage
var minio = builder.AddContainer("s3storage", "minio/minio")
    .WithArgs("server", "/data", "--console-address", ":9001")
    .WithEnvironment("MINIO_ROOT_USER", "minioadmin")
    .WithEnvironment("MINIO_ROOT_PASSWORD", "minioadmin")
    .WithEndpoint(9000, targetPort: 9000, name: "api")
    .WithEndpoint(9001, targetPort: 9001, name: "console")
    .WithVolume("minio-data", "/data")
    .WithLifetime(ContainerLifetime.Persistent);

// Add the SendGrid Parquet Logger API
builder.AddProject<Projects.SendgridParquetLogger>("sendgridparquetlogger")
    .WithReference(redis)
    .WithEnvironment("S3__ServiceUrl", () => $"http://localhost:{minio.GetEndpoint("api").Port}")
    .WithEnvironment("S3__AccessKey", "minioadmin")
    .WithEnvironment("S3__SecretKey", "minioadmin")
    .WithEnvironment("S3__BucketName", "sendgrid-events");

builder.Build().Run();
