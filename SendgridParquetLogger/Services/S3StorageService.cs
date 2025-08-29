using System;
using System.IO;
using System.Threading.Tasks;
using Amazon;
using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace SendgridParquetLogger.Services;

public class S3StorageService
{
        private readonly IAmazonS3 _s3Client;
        private readonly string? _bucketName;
        private readonly ILogger<S3StorageService> _logger;

        public S3StorageService(IConfiguration configuration, ILogger<S3StorageService> logger)
        {
            _logger = logger;
            
            var accessKey = Environment.GetEnvironmentVariable("S3_ACCESS_KEY") ?? configuration["S3:AccessKey"];
            var secretKey = Environment.GetEnvironmentVariable("S3_SECRET_KEY") ?? configuration["S3:SecretKey"];
            var serviceUrl = Environment.GetEnvironmentVariable("S3_SERVICE_URL") ?? configuration["S3:ServiceUrl"];
            _bucketName = Environment.GetEnvironmentVariable("S3_BUCKET_NAME") ?? configuration["S3:BucketName"];

            if (string.IsNullOrEmpty(serviceUrl) || serviceUrl.StartsWith("${"))
            {
                serviceUrl = "https://s3.amazonaws.com"; // Default URL for testing
                _logger.LogWarning("S3_SERVICE_URL not configured, using default: {0}", serviceUrl);
            }

            var config = new AmazonS3Config
            {
                ServiceURL = serviceUrl,
                ForcePathStyle = true
            };

            var credentials = new BasicAWSCredentials(accessKey ?? "test", secretKey ?? "test");
            _s3Client = new AmazonS3Client(credentials, config);
        }

        public async Task<bool> UploadFileAsync(byte[] fileContent, string fileName)
        {
            try
            {
                using var stream = new MemoryStream(fileContent);
                
                var request = new PutObjectRequest
                {
                    BucketName = _bucketName,
                    Key = fileName,
                    InputStream = stream,
                    ContentType = "application/octet-stream"
                };

                var response = await _s3Client.PutObjectAsync(request);
                
                _logger.LogInformation($"File {fileName} uploaded successfully to S3. ETag: {response.ETag}");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error uploading file {fileName} to S3");
                return false;
            }
        }

        public async Task<bool> BucketExistsAsync()
        {
            try
            {
                await _s3Client.ListObjectsV2Async(new ListObjectsV2Request
                {
                    BucketName = _bucketName,
                    MaxKeys = 1
                });
                return true;
            }
            catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return false;
            }
        }

        public async Task CreateBucketIfNotExistsAsync()
        {
            if (!await BucketExistsAsync())
            {
                try
                {
                    await _s3Client.PutBucketAsync(new PutBucketRequest
                    {
                        BucketName = _bucketName
                    });
                    _logger.LogInformation($"Bucket {_bucketName} created successfully");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error creating bucket {_bucketName}");
                    throw;
                }
            }
    }
}