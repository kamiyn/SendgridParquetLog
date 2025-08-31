using System.Globalization;
using System.Net;
using System.Security.Cryptography;
using System.Text;

using Microsoft.Extensions.Options;

using SendgridParquetLogger.Options;

namespace SendgridParquetLogger.Services;

public class S3StorageService
{
    private readonly HttpClient _httpClient;
    private readonly S3Options _options;
    private readonly ILogger<S3StorageService> _logger;

    public S3StorageService(HttpClient httpClient, IOptions<S3Options> options, ILogger<S3StorageService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _options = options.Value;
    }

    public async Task<bool> UploadFileAsync(Stream stream, string fileName)
    {
        try
        {
            // Read stream to byte array for signing
            stream.Position = 0;
            var content = new byte[stream.Length];
            await stream.ReadExactlyAsync(content);

            var uri = new Uri($"{_options.SERVICEURL}/{_options.BUCKETNAME}/{fileName}");
            var request = new HttpRequestMessage(HttpMethod.Put, uri);

            request.Content = new ByteArrayContent(content);
            request.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/octet-stream");

            // Add AWS signature headers
            AddAwsSignatureHeaders(request, content, fileName);

            var response = await _httpClient.SendAsync(request);

            if (response.IsSuccessStatusCode)
            {
                var etag = response.Headers.ETag?.Tag;
                _logger.LogInformation($"File {fileName} uploaded successfully to S3. ETag: {etag}");
                return true;
            }
            else
            {
                var error = await response.Content.ReadAsStringAsync();
                _logger.LogError($"Error uploading file {fileName} to S3. Status: {response.StatusCode}, Response: {error}");
                return false;
            }
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
            var uri = new Uri($"{_options.SERVICEURL}/{_options.BUCKETNAME}/?max-keys=1");
            var request = new HttpRequestMessage(HttpMethod.Get, uri);

            // Add AWS signature headers for GET request
            AddAwsSignatureHeaders(request, [], "");

            var response = await _httpClient.SendAsync(request);
            return response.StatusCode != HttpStatusCode.NotFound;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, $"Error checking if bucket {_options.BUCKETNAME} exists");
            return false;
        }
    }

    public async Task CreateBucketIfNotExistsAsync()
    {
        if (!await BucketExistsAsync())
        {
            try
            {
                var uri = new Uri($"{_options.SERVICEURL}/{_options.BUCKETNAME}");
                var request = new HttpRequestMessage(HttpMethod.Put, uri);

                // Add AWS signature headers for PUT bucket request
                AddAwsSignatureHeaders(request, [], "");

                var response = await _httpClient.SendAsync(request);

                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation($"Bucket {_options.BUCKETNAME} created successfully");
                }
                else
                {
                    var error = await response.Content.ReadAsStringAsync();
                    _logger.LogError($"Error creating bucket {_options.BUCKETNAME}. Status: {response.StatusCode}, Response: {error}");
                    throw new InvalidOperationException($"Failed to create bucket: {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creating bucket {_options.BUCKETNAME}");
                throw;
            }
        }
    }

    private void AddAwsSignatureHeaders(HttpRequestMessage request, byte[] content, string key)
    {
        var now = DateTimeOffset.UtcNow;
        var dateStamp = now.ToString("yyyyMMdd");
        var amzDate = now.ToString("yyyyMMddTHHmmssZ");

        // Add required headers
        request.Headers.Add("Host", request.RequestUri!.Host);
        request.Headers.Add("X-Amz-Date", amzDate);

        // Calculate content hash
        var contentHash = CalculateSHA256Hash(content);
        request.Headers.Add("X-Amz-Content-Sha256", contentHash);

        // Create canonical request
        var canonicalRequest = CreateCanonicalRequest(request, contentHash);
        var canonicalRequestHash = CalculateSHA256Hash(Encoding.UTF8.GetBytes(canonicalRequest));

        // Create string to sign
        var credentialScope = $"{dateStamp}/us-east-1/s3/aws4_request";
        var stringToSign = $"AWS4-HMAC-SHA256\n{amzDate}\n{credentialScope}\n{canonicalRequestHash}";

        // Calculate signature
        var signature = CalculateSignature(stringToSign, dateStamp);

        // Create authorization header
        var authorization = $"AWS4-HMAC-SHA256 " +
                           $"Credential={_options.ACCESSKEY}/{credentialScope}," +
                           $"SignedHeaders=host;x-amz-content-sha256;x-amz-date," +
                           $"Signature={signature}";

        request.Headers.TryAddWithoutValidation("Authorization", authorization);
    }

    private string CreateCanonicalRequest(HttpRequestMessage request, string contentHash)
    {
        var method = request.Method.Method;
        var canonicalUri = request.RequestUri!.AbsolutePath;
        var canonicalQueryString = request.RequestUri.Query.TrimStart('?');

        // Create canonical headers (must be sorted)
        var headers = new SortedDictionary<string, string>();
        headers.Add("host", request.RequestUri.Host);
        headers.Add("x-amz-content-sha256", contentHash);
        headers.Add("x-amz-date", request.Headers.GetValues("X-Amz-Date").First());

        var canonicalHeaders = string.Join("\n", headers.Select(h => $"{h.Key}:{h.Value}")) + "\n";
        var signedHeaders = string.Join(";", headers.Keys);

        return $"{method}\n{canonicalUri}\n{canonicalQueryString}\n{canonicalHeaders}\n{signedHeaders}\n{contentHash}";
    }

    private string CalculateSignature(string stringToSign, string dateStamp)
    {
        var kDate = HmacSHA256(Encoding.UTF8.GetBytes($"AWS4{_options.SECRETKEY}"), dateStamp);
        var kRegion = HmacSHA256(kDate, "us-east-1");
        var kService = HmacSHA256(kRegion, "s3");
        var kSigning = HmacSHA256(kService, "aws4_request");

        var signature = HmacSHA256(kSigning, stringToSign);
        return Convert.ToHexString(signature).ToLowerInvariant();
    }

    private static byte[] HmacSHA256(byte[] key, string data)
    {
        using var hmac = new HMACSHA256(key);
        return hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
    }

    private static string CalculateSHA256Hash(byte[] data)
    {
        using var sha256 = SHA256.Create();
        var hash = sha256.ComputeHash(data);
        return Convert.ToHexString(hash).ToLowerInvariant();
    }
}
