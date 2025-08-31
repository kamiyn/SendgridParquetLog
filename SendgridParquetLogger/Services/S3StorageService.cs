using System.Net;
using System.Security.Cryptography;
using System.Text;

using Microsoft.Extensions.Options;

using SendgridParquetLogger.Options;

using ZLogger;

namespace SendgridParquetLogger.Services;

public class S3StorageService(
    ILogger<S3StorageService> logger,
    IOptions<S3Options> options,
    HttpClient httpClient
)
{
    private readonly S3Options _options = options.Value;

    public async Task<bool> UploadFileAsync(byte[] content, string fileName, DateTimeOffset now, CancellationToken ct)
    {
        S3SignatureSource s3SignatureSource = new(now, _options.REGION);
        try
        {
            var uri = new Uri($"{_options.SERVICEURL}/{_options.BUCKETNAME}/{fileName}");
            using var request = new HttpRequestMessage(HttpMethod.Put, uri);

            AddAwsSignatureHeaders(request, content, s3SignatureSource);

            request.Content = new ByteArrayContent(content);
            request.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/octet-stream");
            using HttpResponseMessage response = await httpClient.SendAsync(request, ct);

            if (response.IsSuccessStatusCode)
            {
                // 成功時には Content は空のため Read しなくてよい
                //string responseContent = await response.Content.ReadAsStringAsync(ct);
                string? etag = response.Headers.ETag?.Tag;
                logger.ZLogInformation($"File {fileName} uploaded successfully to S3. ETag: {etag}", fileName, etag);
                return true;
            }
            else
            {
                string responseContent = await response.Content.ReadAsStringAsync(ct);
                logger.ZLogError($"Error uploading file {fileName} to S3. Status: {response.StatusCode}, Response: {responseContent}");
                return false;
            }
        }
        catch (Exception ex)
        {
            logger.ZLogError(ex, $"Error uploading file {fileName} to S3", fileName);
            return false;
        }
    }

    private async Task<bool> BucketExistsAsync(DateTimeOffset now, CancellationToken ct)
    {
        S3SignatureSource s3SignatureSource = new(now, _options.REGION);
        try
        {
            var uri = new Uri($"{_options.SERVICEURL}/{_options.BUCKETNAME}/?max-keys=1");
            using HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Get, uri);
            AddAwsSignatureHeaders(request, null, s3SignatureSource);
            using HttpResponseMessage response = await httpClient.SendAsync(request, ct);
            string content = await response.Content.ReadAsStringAsync(ct);
            logger.ZLogDebug($"Content {content}");
            return response.StatusCode != HttpStatusCode.NotFound;
        }
        catch (Exception ex)
        {
            logger.ZLogWarning(ex, $"Error checking if bucket {_options.BUCKETNAME} exists");
            return false;
        }
    }

    public async Task CreateBucketIfNotExistsAsync(DateTimeOffset now, CancellationToken ct)
    {
        if (!await BucketExistsAsync(now, ct))
        {
            S3SignatureSource s3SignatureSource = new(now, _options.REGION);
            try
            {
                var uri = new Uri($"{_options.SERVICEURL}/{_options.BUCKETNAME}");
                var request = new HttpRequestMessage(HttpMethod.Put, uri);
                AddAwsSignatureHeaders(request, null, s3SignatureSource);
                var response = await httpClient.SendAsync(request, ct);
                if (response.IsSuccessStatusCode)
                {
                    logger.ZLogInformation($"Bucket {_options.BUCKETNAME} created successfully");
                }
                else
                {
                    var error = await response.Content.ReadAsStringAsync(ct);
                    logger.ZLogError($"Error creating bucket {_options.BUCKETNAME}. Status: {response.StatusCode}, Response: {error}");
                    throw new InvalidOperationException($"Failed to create bucket: {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                logger.ZLogError(ex, $"Error creating bucket {_options.BUCKETNAME}");
                throw;
            }
        }
    }

    private void AddAwsSignatureHeaders(HttpRequestMessage request, byte[]? content, S3SignatureSource s3SignatureSource)
    {
        var contentHash = CalculateSHA256Hash(content);
        var headers = new KeyValuePair<string, string>[]
        {
            new("Host", request.RequestUri!.Host),
            new("X-Amz-Date", s3SignatureSource.amzDate),
            new("X-Amz-Content-Sha256", contentHash)
        };
        foreach (var header in headers)
        {
            request.Headers.Add(header.Key, header.Value);
        }

        // Create canonical request
        var s3CanonicalHeaders = new S3CanonicalHeaders(headers);
        var canonicalRequest = CreateCanonicalRequest(request, contentHash, s3CanonicalHeaders);
        var canonicalRequestHash = CalculateSHA256Hash(Encoding.UTF8.GetBytes(canonicalRequest));
        var credentialScope = s3SignatureSource.GetCredentialScope();
        var stringToSign = $"AWS4-HMAC-SHA256\n{s3SignatureSource.amzDate}\n{credentialScope}\n{canonicalRequestHash}";
        var signature = CalculateSignature(stringToSign, s3SignatureSource);
        var authorization = $"AWS4-HMAC-SHA256 " +
                           $"Credential={_options.ACCESSKEY}/{credentialScope}," +
                           $"SignedHeaders={s3CanonicalHeaders.signedHeaders}," +
                           $"Signature={signature}";

        request.Headers.TryAddWithoutValidation("Authorization", authorization);
    }

    private string CreateCanonicalRequest(HttpRequestMessage request, string contentHash, S3CanonicalHeaders s3CanonicalHeaders)
    {
        var method = request.Method.Method;
        var canonicalUri = request.RequestUri!.AbsolutePath;
        var canonicalQueryString = request.RequestUri.Query.TrimStart('?');
        var canonicalHeaders = s3CanonicalHeaders.canonicalHeaders;
        var signedHeaders = s3CanonicalHeaders.signedHeaders;
        return $"{method}\n{canonicalUri}\n{canonicalQueryString}\n{canonicalHeaders}\n{signedHeaders}\n{contentHash}";
    }

    private string CalculateSignature(string stringToSign, S3SignatureSource s3SignatureSource)
    {
        var kDate = HmacSHA256(Encoding.UTF8.GetBytes($"AWS4{_options.SECRETKEY}"), s3SignatureSource.date);
        var kRegion = HmacSHA256(kDate, s3SignatureSource.region);
        var kService = HmacSHA256(kRegion, s3SignatureSource.service);
        var kSigning = HmacSHA256(kService, s3SignatureSource.signing);
        var signature = HmacSHA256(kSigning, stringToSign);
        return Convert.ToHexString(signature).ToLowerInvariant();
    }

    private static byte[] HmacSHA256(byte[] key, string data)
    {
        using var hmac = new HMACSHA256(key);
        return hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
    }

    private static readonly Lazy<string> s_emptySha256Hash = new Lazy<string>(() =>
    {
        using var sha256 = SHA256.Create();
        var hash = sha256.ComputeHash([]);
        return Convert.ToHexString(hash).ToLowerInvariant();
    });

    private static string CalculateSHA256Hash(byte[]? data)
    {
        if (data == null)
        {
            // AWS S3 は必ず SHA‑256 を計算する
            return s_emptySha256Hash.Value;
        }
        using var sha256 = SHA256.Create();
        byte[] hash = sha256.ComputeHash(data);
        return Convert.ToHexString(hash).ToLowerInvariant();
    }
}

internal class S3CanonicalHeaders
{
    private readonly SortedDictionary<string, string> _sortedHeaders;
    internal S3CanonicalHeaders(IEnumerable<KeyValuePair<string, string>> headers)
    {
        // Create canonical headers (must be sorted)
        // キーは小文字に変換した状態で管理される
        _sortedHeaders = new SortedDictionary<string, string>(StringComparer.Ordinal);
        foreach (var header in headers)
        {
            _sortedHeaders.Add(header.Key.ToLowerInvariant(), header.Value.Trim());
        }
    }

    internal string canonicalHeaders => string.Join("\n", _sortedHeaders.Select(h => $"{h.Key}:{h.Value}")) + "\n";
    /// <summary>
    /// セミコロン区切りで ヘッダー名を連結したもの
    /// </summary>
    internal string signedHeaders => string.Join(";", _sortedHeaders.Keys);
}

internal record struct S3SignatureSource(DateTimeOffset now, string region)
{
    internal string date => now.ToString("yyyyMMdd");
    internal string amzDate => now.ToString("yyyyMMddTHHmmssZ");
    internal string service => "s3";
    internal string signing => "aws4_request";
    internal string GetCredentialScope() => $"{date}/{region}/{service}/{signing}";
}
