using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;

using Microsoft.Extensions.Options;

using SendgridParquetLogger.Options;

namespace SendgridParquetLogger.Services;

public class S3StorageService
{
    private readonly IAmazonS3 _s3Client;
    private readonly S3Options _options;
    private readonly ILogger<S3StorageService> _logger;

    public S3StorageService(IOptions<S3Options> options, ILogger<S3StorageService> logger)
    {
        _logger = logger;
        _options = options.Value;

        var config = new AmazonS3Config
        {
            ServiceURL = _options.SERVICEURL,
            ForcePathStyle = true
        };

        var credentials = new BasicAWSCredentials(_options.ACCESSKEY, _options.SECRETKEY);
        _s3Client = new AmazonS3Client(credentials, config);
    }

    public async Task<bool> UploadFileAsync(Stream stream, string fileName)
    {
        try
        {
            var request = new PutObjectRequest
            {
                BucketName = _options.BUCKETNAME,
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

    private async Task<bool> BucketExistsAsync()
    {
        try
        {
            await _s3Client.ListObjectsV2Async(new ListObjectsV2Request
            {
                BucketName = _options.BUCKETNAME,
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
                    BucketName = _options.BUCKETNAME
                });
                _logger.LogInformation($"Bucket {_options.BUCKETNAME} created successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creating bucket {_options.BUCKETNAME}");
                throw;
            }
        }
    }
}
