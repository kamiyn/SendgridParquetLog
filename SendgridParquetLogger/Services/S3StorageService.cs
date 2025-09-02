using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Xml.Linq;

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

    public async ValueTask<bool> PutObjectAsync(Stream content, string key, DateTimeOffset now, CancellationToken ct)
    {
        S3SignatureSource signatureSource = new(now, _options.REGION);
        try
        {
            var uri = new Uri($"{_options.SERVICEURL}/{_options.BUCKETNAME}/{key}");
            using var request = new HttpRequestMessage(HttpMethod.Put, uri);

            AddAwsSignatureHeaders(request, content, signatureSource);

            content.Seek(0, SeekOrigin.Begin);
            request.Content = new StreamContent(content);
            request.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/octet-stream");
            using HttpResponseMessage response = await httpClient.SendAsync(request, ct);

            if (response.IsSuccessStatusCode)
            {
                // 成功時には Content は空のため Read しなくてよい
                //string responseContent = await response.Content.ReadAsStringAsync(ct);
                string? etag = response.Headers.ETag?.Tag;
                logger.ZLogInformation($"File {key} uploaded successfully to S3. ETag: {etag}", key, etag);
                return true;
            }
            else
            {
                string responseContent = await response.Content.ReadAsStringAsync(ct);
                logger.ZLogError($"Error uploading file {key} to S3. Status: {response.StatusCode}, Response: {responseContent}");
                return false;
            }
        }
        catch (Exception ex)
        {
            logger.ZLogError(ex, $"Error uploading file {key} to S3", key);
            return false;
        }
    }

    private async ValueTask<bool> BucketExistsAsync(DateTimeOffset now, CancellationToken ct)
    {
        string uriString = $"{_options.SERVICEURL}/{_options.BUCKETNAME}/?max-keys=1";
        logger.ZLogInformation($"Bucket {uriString} checking");
        S3SignatureSource signatureSource = new(now, _options.REGION);
        try
        {
            var uri = new Uri(uriString);
            using HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Get, uri);
            using var requestContent = new MemoryStream([]);
            AddAwsSignatureHeaders(request, requestContent, signatureSource);
            using HttpResponseMessage response = await httpClient.SendAsync(request, ct);
            string content = await response.Content.ReadAsStringAsync(ct);
            logger.ZLogDebug($"Content {content}");
            return response.StatusCode != HttpStatusCode.NotFound;
        }
        catch (Exception ex)
        {
            logger.ZLogWarning(ex, $"Error checking if bucket {uriString} exists");
            return false;
        }
    }

    public async ValueTask CreateBucketIfNotExistsAsync(DateTimeOffset now, CancellationToken ct)
    {
        if (!await BucketExistsAsync(now, ct))
        {
            string uriString = $"{_options.SERVICEURL}/{_options.BUCKETNAME}";
            logger.ZLogInformation($"Bucket {uriString} creating");
            S3SignatureSource signatureSource = new(now, _options.REGION);
            try
            {
                var uri = new Uri(uriString);
                var request = new HttpRequestMessage(HttpMethod.Put, uri);
                using var requestContent = new MemoryStream([]);
                AddAwsSignatureHeaders(request, requestContent, signatureSource);
                var response = await httpClient.SendAsync(request, ct);
                if (response.IsSuccessStatusCode)
                {
                    logger.ZLogInformation($"Bucket {uriString} created successfully");
                }
                else
                {
                    var error = await response.Content.ReadAsStringAsync(ct);
                    logger.ZLogError($"Error creating bucket {uriString}. Status: {response.StatusCode}, Response: {error}");
                    throw new InvalidOperationException($"Failed to create bucket: {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                logger.ZLogError(ex, $"Error creating bucket {uriString}");
                throw;
            }
        }
    }

    /// <summary>
    /// Object を取得する
    /// 見つからない場合は空の byte[] を返す
    /// </summary>
    /// <param name="key"></param>
    /// <param name="now"></param>
    /// <param name="ct"></param>
    /// <returns></returns>
    public async ValueTask<byte[]> GetObjectAsByteArrayAsync(string key, DateTimeOffset now, CancellationToken ct)
    {
        S3SignatureSource signatureSource = new(now, _options.REGION);
        var uri = new Uri($"{_options.SERVICEURL}/{_options.BUCKETNAME}/{key}");
        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, uri);
            using var requestContent = new MemoryStream([]);
            AddAwsSignatureHeaders(request, requestContent, signatureSource);
            using HttpResponseMessage response = await httpClient.SendAsync(request, ct);
            byte[] content = await response.Content.ReadAsByteArrayAsync(ct);

            if (response.IsSuccessStatusCode)
            {
                return content;
            }
            else
            if (response.StatusCode == HttpStatusCode.NotFound)
            {
                return [];
            }
            else
            {
                string responseContent = Encoding.UTF8.GetString(content);
                logger.ZLogError($"Error getting object {key} from S3. Status: {response.StatusCode}, Response: {responseContent}");
                throw new InvalidOperationException($"Failed to get object: {response.StatusCode}");
            }
        }
        catch (Exception ex)
        {
            logger.ZLogError(ex, $"Error getting object {uri} from S3");
            throw;
        }
    }

    public async ValueTask<bool> DeleteObjectAsync(string key, DateTimeOffset now, CancellationToken ct)
    {
        S3SignatureSource signatureSource = new(now, _options.REGION);
        try
        {
            var uri = new Uri($"{_options.SERVICEURL}/{_options.BUCKETNAME}/{key}");
            using var request = new HttpRequestMessage(HttpMethod.Delete, uri);
            using var requestContent = new MemoryStream([]);
            AddAwsSignatureHeaders(request, requestContent, signatureSource);
            using HttpResponseMessage response = await httpClient.SendAsync(request, ct);

            if (response.IsSuccessStatusCode || response.StatusCode == HttpStatusCode.NoContent)
            {
                logger.ZLogInformation($"Object {key} deleted successfully from S3", key);
                return true;
            }
            else
            {
                string responseContent = await response.Content.ReadAsStringAsync(ct);
                logger.ZLogError($"Error deleting object {key} from S3. Status: {response.StatusCode}, Response: {responseContent}");
                return false;
            }
        }
        catch (Exception ex)
        {
            logger.ZLogError(ex, $"Error deleting object {key} from S3", key);
            return false;
        }
    }

    public async ValueTask<bool> PutObjectWithConditionAsync(string key, byte[] content, byte[] expectedContent, DateTimeOffset now, CancellationToken ct)
    {
        S3SignatureSource signatureSource = new(now, _options.REGION);
        try
        {
            // First, get the current ETag if object exists
            string? currentETag = null;
            if (expectedContent.Any())
            {
                currentETag = await GetCurrentEtag(key, signatureSource, ct);
                // Expected content but no current object - should fail
                if (string.IsNullOrEmpty(currentETag))
                {
                    return false;
                }
            }

            // Now do conditional PUT
            var uri = new Uri($"{_options.SERVICEURL}/{_options.BUCKETNAME}/{key}");
            using var request = new HttpRequestMessage(HttpMethod.Put, uri);
            using var stream = new MemoryStream(content);

            // Add conditional header if we have an expected ETag
            if (!string.IsNullOrEmpty(currentETag))
            {
                request.Headers.TryAddWithoutValidation("If-Match", currentETag);
            }
            else
            {
                // No expected content - only create if doesn't exist
                request.Headers.TryAddWithoutValidation("If-None-Match", "*");
            }

            AddAwsSignatureHeaders(request, stream, signatureSource);

            stream.Seek(0, SeekOrigin.Begin);
            request.Content = new StreamContent(stream);
            request.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/json");
            using HttpResponseMessage response = await httpClient.SendAsync(request, ct);

            if (response.IsSuccessStatusCode)
            {
                string? etag = response.Headers.ETag?.Tag;
                logger.ZLogInformation($"Object {key} uploaded conditionally to S3. ETag: {etag}", key, etag);
                return true;
            }
            else if (response.StatusCode == HttpStatusCode.PreconditionFailed)
            {
                logger.ZLogInformation($"Conditional PUT failed for {key} - precondition not met", key);
                return false;
            }
            else
            {
                string responseContent = await response.Content.ReadAsStringAsync(ct);
                logger.ZLogError($"Error uploading object {key} to S3. Status: {response.StatusCode}, Response: {responseContent}");
                return false;
            }
        }
        catch (Exception ex)
        {
            logger.ZLogError(ex, $"Error uploading object {key} to S3", key);
            return false;
        }
    }

    private async ValueTask<string?> GetCurrentEtag(string key, S3SignatureSource signatureSource, CancellationToken ct)
    {
        var headUri = new Uri($"{_options.SERVICEURL}/{_options.BUCKETNAME}/{key}");
        using var headRequest = new HttpRequestMessage(HttpMethod.Head, headUri);
        using var headRequestContent = new MemoryStream([]);
        AddAwsSignatureHeaders(headRequest, headRequestContent, signatureSource);
        using HttpResponseMessage headResponse = await httpClient.SendAsync(headRequest, ct);
        return headResponse.IsSuccessStatusCode ? headResponse.Headers.ETag?.Tag : null;
    }

    /// <summary>
    /// prefix の下にある直下の "ディレクトリ"（CommonPrefixes）を列挙する
    /// 再帰的な列挙はしない
    /// </summary>
    /// <param name="prefix"></param>
    /// <param name="now"></param>
    /// <param name="ct"></param>
    /// <returns></returns>
    public async ValueTask<IList<string>> ListDirectoriesAsync(string prefix, DateTimeOffset now, CancellationToken ct)
    {
        S3SignatureSource signatureSource = new(now, _options.REGION);

        try
        {
            var delimiter = "/";
            var encodedPrefix = Uri.EscapeDataString(prefix + "/");
            var uriString = $"{_options.SERVICEURL}/{_options.BUCKETNAME}/?prefix={encodedPrefix}&delimiter={delimiter}";
            var uri = new Uri(uriString);
            using var request = new HttpRequestMessage(HttpMethod.Get, uri);
            using var requestContent = new MemoryStream([]);
            AddAwsSignatureHeaders(request, requestContent, signatureSource);
            using HttpResponseMessage response = await httpClient.SendAsync(request, ct);
            string content = await response.Content.ReadAsStringAsync(ct);

            if (response.IsSuccessStatusCode)
            {
                // Parse XML response using LINQ to XML
                XDocument doc = XDocument.Parse(content);
                XNamespace ns = doc.Root?.GetDefaultNamespace() ?? XNamespace.None;
                return doc.Descendants(ns + "CommonPrefixes")
                    .Select(cp => cp.Element(ns + "Prefix")?.Value)
                    .Where(p => !string.IsNullOrEmpty(p))
                    .Select(p => p!.TrimEnd('/').Split('/').LastOrDefault() ?? string.Empty)
                    .Where(d => !string.IsNullOrEmpty(d))
                    .ToList();
            }
            else
            {
                logger.ZLogError($"Error listing directories for prefix {prefix}. Status: {response.StatusCode}, Response: {content}");
                return [];
            }
        }
        catch (Exception ex)
        {
            logger.ZLogError(ex, $"Error listing directories for prefix {prefix}", prefix);
            return [];
        }
    }

    private void AddAwsSignatureHeaders(HttpRequestMessage request, Stream content, S3SignatureSource signatureSource)
    {
        content.Seek(0, SeekOrigin.Begin);
        var contentHash = CalculateSHA256Hash(content);
        var headers = new KeyValuePair<string, string>[]
        {
            new("Host", request.RequestUri!.Host),
            new("X-Amz-Date", signatureSource.AmzDate),
            new("X-Amz-Content-Sha256", contentHash)
        };
        foreach (var header in headers)
        {
            request.Headers.Add(header.Key, header.Value);
        }

        // Create canonical request
        var canonicalHeaders = new S3CanonicalHeaders(headers);
        var canonicalRequest = CreateCanonicalRequest(request, contentHash, canonicalHeaders);
        var canonicalRequestHash = CalculateSHA256Hash(Encoding.UTF8.GetBytes(canonicalRequest));
        var credentialScope = signatureSource.GetCredentialScope();
        var stringToSign = $"AWS4-HMAC-SHA256\n{signatureSource.AmzDate}\n{credentialScope}\n{canonicalRequestHash}";
        var signature = CalculateSignature(stringToSign, signatureSource);
        var authorization = $"AWS4-HMAC-SHA256 " +
                           $"Credential={_options.ACCESSKEY}/{credentialScope}," +
                           $"SignedHeaders={canonicalHeaders.SignedHeaders}," +
                           $"Signature={signature}";

        request.Headers.TryAddWithoutValidation("Authorization", authorization);
    }

    private string CreateCanonicalRequest(HttpRequestMessage request, string contentHash, S3CanonicalHeaders canonicalHeaders)
    {
        var method = request.Method.Method;
        var canonicalUri = request.RequestUri!.AbsolutePath;
        var canonicalQueryString = request.RequestUri.Query.TrimStart('?');
        var canonicalHeadersString = canonicalHeaders.CanonicalHeaders;
        var signedHeaders = canonicalHeaders.SignedHeaders;
        return $"{method}\n{canonicalUri}\n{canonicalQueryString}\n{canonicalHeadersString}\n{signedHeaders}\n{contentHash}";
    }

    private string CalculateSignature(string stringToSign, S3SignatureSource signatureSource)
    {
        var kDate = HmacSHA256(Encoding.UTF8.GetBytes($"AWS4{_options.SECRETKEY}"), signatureSource.Date);
        var kRegion = HmacSHA256(kDate, signatureSource.Region);
        var kService = HmacSHA256(kRegion, signatureSource.Service);
        var kSigning = HmacSHA256(kService, signatureSource.Signing);
        var signature = HmacSHA256(kSigning, stringToSign);
        return Convert.ToHexString(signature).ToLowerInvariant();
    }

    private static byte[] HmacSHA256(byte[] key, string data)
    {
        using var hmac = new HMACSHA256(key);
        return hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
    }

    private static string CalculateSHA256Hash(Stream data)
    {
        using var sha256 = SHA256.Create();
        byte[] hash = sha256.ComputeHash(data);
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    private static string CalculateSHA256Hash(byte[] data)
    {
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

    internal string CanonicalHeaders => string.Join("\n", _sortedHeaders.Select(h => $"{h.Key}:{h.Value}")) + "\n";
    /// <summary>
    /// セミコロン区切りで ヘッダー名を連結したもの
    /// </summary>
    internal string SignedHeaders => string.Join(";", _sortedHeaders.Keys);
}

internal record struct S3SignatureSource(DateTimeOffset now, string region)
{
    internal string Date => now.ToString("yyyyMMdd");
    internal string AmzDate => now.ToString("yyyyMMddTHHmmssZ");
    internal string Region => region;
    internal string Service => "s3";
    internal string Signing => "aws4_request";
    internal string GetCredentialScope() => $"{Date}/{Region}/{Service}/{Signing}";
}
