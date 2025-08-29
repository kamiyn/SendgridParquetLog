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
    // accessKey, secretKey, Bucket の作成を自動化できていないため これらは手動で作成し .env に設定するか 環境変数に設定する
    // .WithEnvironment("S3__AccessKey", accessKey)
    // .WithEnvironment("S3__SecretKey", secretKey)
    // .WithEnvironment("S3__BucketName", "sendgrid-events")
    ;

builder.Build().Run();
