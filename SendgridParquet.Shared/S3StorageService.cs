using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Xml.Linq;

using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

using ZLogger;

namespace SendgridParquet.Shared;


public class S3StorageService(
    ILogger<S3StorageService> logger,
    IOptions<S3Options> options,
    HttpClient httpClient,
    TimeProvider timeProvider
)
{
    private readonly S3Options _options = options.Value;
    private readonly TimeProvider _timeProvider = timeProvider;

    public async ValueTask<bool> PutObjectAsync(Stream content, string key, CancellationToken ct)
    {
        var uri = new Uri($"{_options.SERVICEURL}/{_options.BUCKETNAME}/{key}");
        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Put, uri);

            AddAwsSignatureHeaders(request, content);

            content.Seek(0, SeekOrigin.Begin);
            request.Content = new StreamContent(content);
            request.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/octet-stream");
            using HttpResponseMessage response = await httpClient.SendAsync(request, ct);

            if (response.IsSuccessStatusCode)
            {
                // 成功時には Content は空のため Read しなくてよい
                //string responseContent = await response.Content.ReadAsStringAsync(ct);
                string? etag = response.Headers.ETag?.Tag;
                logger.ZLogInformation($"File {uri} uploaded successfully to S3. ETag: {etag}");
                return true;
            }
            else
            {
                string responseContent = await response.Content.ReadAsStringAsync(ct);
                logger.ZLogError($"Error uploading file {uri} to S3. Status: {response.StatusCode}, Response: {responseContent}");
                return false;
            }
        }
        catch (Exception ex)
        {
            logger.ZLogError(ex, $"Error uploading file {uri} to S3");
            return false;
        }
    }

    private async ValueTask<bool> BucketExistsAsync(CancellationToken ct)
    {
        string uriString = $"{_options.SERVICEURL}/{_options.BUCKETNAME}/?max-keys=1";
        logger.ZLogInformation($"Bucket {uriString} checking");
        try
        {
            var uri = new Uri(uriString);
            using HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Get, uri);
            using var requestContent = new MemoryStream([]);
            AddAwsSignatureHeaders(request, requestContent);
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

    public async ValueTask CreateBucketIfNotExistsAsync(CancellationToken ct)
    {
        if (!await BucketExistsAsync(ct))
        {
            string uriString = $"{_options.SERVICEURL}/{_options.BUCKETNAME}";
            logger.ZLogInformation($"Bucket {uriString} creating");
            try
            {
                var uri = new Uri(uriString);
                var request = new HttpRequestMessage(HttpMethod.Put, uri);
                using var requestContent = new MemoryStream([]);
                AddAwsSignatureHeaders(request, requestContent);
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
    public async ValueTask<byte[]> GetObjectAsByteArrayAsync(string key, CancellationToken ct)
    {
        var uri = new Uri($"{_options.SERVICEURL}/{_options.BUCKETNAME}/{key}");
        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, uri);
            using var requestContent = new MemoryStream([]);
            AddAwsSignatureHeaders(request, requestContent);
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
                logger.ZLogError($"Error getting object {uri} from S3. Status: {response.StatusCode}, Response: {responseContent}");
                throw new InvalidOperationException($"Failed to get object: {response.StatusCode}");
            }
        }
        catch (Exception ex)
        {
            logger.ZLogError(ex, $"Error getting object {uri} from S3");
            throw;
        }
    }

    public async ValueTask<bool> DeleteObjectAsync(string key, CancellationToken ct)
    {
        var uri = new Uri($"{_options.SERVICEURL}/{_options.BUCKETNAME}/{key}");
        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Delete, uri);
            using var requestContent = new MemoryStream([]);
            AddAwsSignatureHeaders(request, requestContent);
            using HttpResponseMessage response = await httpClient.SendAsync(request, ct);

            if (response.IsSuccessStatusCode || response.StatusCode == HttpStatusCode.NoContent)
            {
                logger.ZLogInformation($"Object {uri} deleted successfully from S3");
                return true;
            }
            else
            {
                string responseContent = await response.Content.ReadAsStringAsync(ct);
                logger.ZLogError($"Error deleting object {uri} from S3. Status: {response.StatusCode}, Response: {responseContent}");
                return false;
            }
        }
        catch (Exception ex)
        {
            logger.ZLogError(ex, $"Error deleting object {uri} from S3");
            return false;
        }
    }

    public async ValueTask<bool> PutObjectWithConditionAsync(string key, byte[] content, byte[] existingLockJson, CancellationToken ct)
    {
        var uri = new Uri($"{_options.SERVICEURL}/{_options.BUCKETNAME}/{key}");
        try
        {
            // First, get the current ETag if object exists
            string? currentETag = null;
            if (existingLockJson.Any())
            {
                currentETag = await GetCurrentEtagAsync(uri, ct);
                // Expected content but no current object - should fail
                if (string.IsNullOrEmpty(currentETag))
                {
                    return false;
                }
            }

            // Now do conditional PUT
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

            AddAwsSignatureHeaders(request, stream);

            stream.Seek(0, SeekOrigin.Begin);
            request.Content = new StreamContent(stream);
            request.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/json");
            using HttpResponseMessage response = await httpClient.SendAsync(request, ct);

            if (response.IsSuccessStatusCode)
            {
                string? etag = response.Headers.ETag?.Tag;
                logger.ZLogInformation($"Object {uri} uploaded conditionally to S3. ETag: {etag}");
                return true;
            }
            else if (response.StatusCode == HttpStatusCode.PreconditionFailed)
            {
                logger.ZLogInformation($"Conditional PUT failed for {uri} - precondition not met");
                return false;
            }
            else
            {
                string responseContent = await response.Content.ReadAsStringAsync(ct);
                logger.ZLogError($"Error uploading object {uri} to S3. Status: {response.StatusCode}, Response: {responseContent}");
                return false;
            }
        }
        catch (Exception ex)
        {
            logger.ZLogError(ex, $"Error uploading object {uri} to S3");
            return false;
        }
    }

    /// <summary>
    /// HEAD リクエストを送り、ETag ヘッダーを取得する
    /// </summary>
    private async ValueTask<string?> GetCurrentEtagAsync(Uri uri, CancellationToken ct)
    {
        using var headRequest = new HttpRequestMessage(HttpMethod.Head, uri);
        using var headRequestContent = new MemoryStream([]);
        AddAwsSignatureHeaders(headRequest, headRequestContent);
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
    public async ValueTask<IEnumerable<string>> ListDirectoriesAsync(string prefix, CancellationToken ct)
    {
        var results = new List<string>();
        string? continuationToken = null;

        do
        {
            if (ct.IsCancellationRequested)
            {
                break;
            }
            var content = await ListObjectsAsync(new ListObjectsRequest(prefix, "/", continuationToken), ct);
            if (string.IsNullOrEmpty(content))
            {
                break;
            }

            XDocument doc = XDocument.Parse(content);
            XNamespace ns = doc.Root?.GetDefaultNamespace() ?? XNamespace.None;

            results.AddRange(
                doc.Descendants(ns + "CommonPrefixes")
                    .Select(cp => cp.Element(ns + "Prefix")?.Value)
                    .Where(p => !string.IsNullOrEmpty(p))
                    .Select(p => p!.TrimEnd('/').Split('/').LastOrDefault() ?? string.Empty)
                    .Where(d => !string.IsNullOrEmpty(d))
            );

            bool isTruncated = string.Equals(doc.Root?.Element(ns + "IsTruncated")?.Value, "true", StringComparison.OrdinalIgnoreCase);
            continuationToken = isTruncated ? doc.Root?.Element(ns + "NextContinuationToken")?.Value : null;
        } while (!string.IsNullOrEmpty(continuationToken));

        return results;
    }

    public async ValueTask<IEnumerable<string>> ListFilesAsync(string prefix, CancellationToken ct)
    {
        var results = new List<string>();
        string? continuationToken = null;

        do
        {
            if (ct.IsCancellationRequested)
            {
                break;
            }
            var content = await ListObjectsAsync(new ListObjectsRequest(prefix, null, continuationToken), ct);
            if (string.IsNullOrEmpty(content))
            {
                break;
            }

            XDocument doc = XDocument.Parse(content);
            XNamespace ns = doc.Root?.GetDefaultNamespace() ?? XNamespace.None;

            results.AddRange(
                doc.Descendants(ns + "Contents")
                   .Select(cp => cp.Element(ns + "Key")?.Value!)
                   .Where(p => !string.IsNullOrEmpty(p))
            );

            bool isTruncated = string.Equals(doc.Root?.Element(ns + "IsTruncated")?.Value, "true", StringComparison.OrdinalIgnoreCase);
            continuationToken = isTruncated ? doc.Root?.Element(ns + "NextContinuationToken")?.Value : null;
        } while (!string.IsNullOrEmpty(continuationToken));

        return results;
    }

    /// <summary>
    /// https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjectsV2.html
    /// </summary>
    public record struct ListObjectsRequest(string Prefix, string? Delimiter, string? ContinuationToken)
    {
        internal string GetQueryString()
        {
            var query = new StringBuilder();
            // Use ListObjectsV2 (supports continuation-token)
            query.Append("list-type=2");
            query.Append("&prefix=");
            query.Append(Uri.EscapeDataString(Prefix.TrimEnd('/') + "/"));
            if (!string.IsNullOrEmpty(Delimiter))
            {
                query.Append("&delimiter=");
                query.Append(Uri.EscapeDataString(Delimiter));
            }
            if (!string.IsNullOrEmpty(ContinuationToken))
            {
                query.Append("&continuation-token=");
                query.Append(Uri.EscapeDataString(ContinuationToken));
            }
            return query.ToString();
        }
    }

    private async ValueTask<string> ListObjectsAsync(ListObjectsRequest req, CancellationToken ct)
    {
        try
        {
            var uriString = $"{_options.SERVICEURL}/{_options.BUCKETNAME}/?{req.GetQueryString()}";
            var uri = new Uri(uriString);
            using var request = new HttpRequestMessage(HttpMethod.Get, uri);
            using var requestContent = new MemoryStream([]);
            AddAwsSignatureHeaders(request, requestContent);
            using HttpResponseMessage response = await httpClient.SendAsync(request, ct);
            string content = await response.Content.ReadAsStringAsync(ct);

            if (response.IsSuccessStatusCode)
            {
                return content;
            }
            else
            {
                logger.ZLogError($"Error listing objects for prefix {req.Prefix}. Status: {response.StatusCode}, Response: {content}");
                return string.Empty;
            }
        }
        catch (Exception ex)
        {
            logger.ZLogError(ex, $"Error listing objects for prefix {req.Prefix}");
            return string.Empty;
        }
    }

    private S3SignatureSource CreateSignatureSource()
    {
        var now = _timeProvider.GetUtcNow();
        return new S3SignatureSource(now, _options.REGION);
    }

    private void AddAwsSignatureHeaders(HttpRequestMessage request, Stream content)
    {
        var signatureSource = CreateSignatureSource();
        content.Seek(0, SeekOrigin.Begin);
        var contentHash = CalculateSHA256Hash(content);
        var uri = request.RequestUri!;
        var hostHeader = uri.IsDefaultPort ? uri.Host : $"{uri.Host}:{uri.Port}";
        var headers = new KeyValuePair<string, string>[]
        {
            new("Host", hostHeader),
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
        var canonicalQueryString = CanonicalizeQuery(request.RequestUri.Query.TrimStart('?'));
        var canonicalHeadersString = canonicalHeaders.CanonicalHeaders;
        var signedHeaders = canonicalHeaders.SignedHeaders;
        return $"{method}\n{canonicalUri}\n{canonicalQueryString}\n{canonicalHeadersString}\n{signedHeaders}\n{contentHash}";
    }

    private string CanonicalizeQuery(string rawQuery)
    {
        if (string.IsNullOrEmpty(rawQuery))
        {
            return string.Empty;
        }
        var sortedSegment = GetQueryKeyValuePairs(rawQuery)
            .OrderBy(p => p.Key, ByteArrayComparer.Instance)
            .ThenBy(p => p.Value, ByteArrayComparer.Instance)
            .Select(kv => $"{Encoding.UTF8.GetString(kv.Key)}={Encoding.UTF8.GetString(kv.Value)}");
        return string.Join("&", sortedSegment);
    }

    private static IEnumerable<(byte[] Key, byte[] Value)> GetQueryKeyValuePairs(string rawQuery)
    {
        foreach (var seg in rawQuery.Split('&', StringSplitOptions.RemoveEmptyEntries))
        {
            var span = seg.AsSpan();
            int idx = span.IndexOf('=');
            ReadOnlySpan<char> keySpan = idx >= 0 ? span[..idx] : span;
            ReadOnlySpan<char> valueSpan = idx >= 0 ? span.Slice(idx + 1) : ReadOnlySpan<char>.Empty;
            yield return (CanonicalizeString(keySpan), CanonicalizeString(valueSpan));
        }
    }

    /// <summary>
    /// RFC3986 にしたがってパーセントエンコードする 結果は UTF-8 のバイト列
    /// </summary>
    private static byte[] CanonicalizeString(ReadOnlySpan<char> s) =>
        CanonicalizedPercentEncode(UrlDecodeToUtf8Bytes(s)).ToArray();

    /// <summary>
    /// input を走査して URL デコードを行い、結果を UTF-8 バイト列として返す。
    /// '+' -> ' '、'%XX' -> バイト、その他は UTF-8 にエンコードして追加する。
    /// サロゲートペアも扱う。
    /// </summary>
    private static IList<byte> UrlDecodeToUtf8Bytes(ReadOnlySpan<char> input)
    {
        var bytes = new List<byte>(input.Length);
        int idx = 0;
        while (idx < input.Length)
        {
            char c = input[idx];
            switch (c)
            {
                case '%':
                    // % の後に 2 つの hex があればバイトとして追加
                    byte? percentDecodeValue = GetPercentDecodeValue(input, idx);
                    if (percentDecodeValue.HasValue)
                    {
                        bytes.Add(percentDecodeValue.Value);
                        idx += 3;
                    }
                    else
                    {
                        // 不正な % シーケンスはリテラル '%' として扱う
                        bytes.Add((byte)'%');
                        idx++;
                    }
                    break;
                case '+':
                    // + はスペースに変換
                    bytes.Add((byte)' ');
                    idx++;
                    break;
                default:
                    if (c <= 0x7F)
                    {
                        // ASCII はそのまま 1 バイト
                        bytes.Add((byte)c);
                        idx++;
                    }
                    else
                    {
                        if (char.IsHighSurrogate(c) && idx + 1 < input.Length && char.IsLowSurrogate(input[idx + 1]))
                        {
                            // 非 ASCII: 2 文字のサロゲートペア
                            bytes.AddRange(Encoding.UTF8.GetBytes([c, input[idx + 1]]));
                            idx += 2;
                        }
                        else
                        {
                            // 非 ASCII: 単一の非 ASCII 文字
                            bytes.AddRange(Encoding.UTF8.GetBytes([c]));
                            idx++;
                        }
                    }
                    break;
            }
        }

        return bytes;
    }

    private static byte? GetPercentDecodeValue(ReadOnlySpan<char> input, int idx)
    {
        if (idx + 2 < input.Length)
        {
            int hi = FromHex(input[idx + 1]);
            int lo = FromHex(input[idx + 2]);
            return hi >= 0 && lo >= 0
                ? (byte)((hi << 4) | lo)
                : null;
        }

        return null;

        static int FromHex(char ch) =>
            ch switch
            {
                >= '0' and <= '9' => ch - '0',
                >= 'a' and <= 'f' => ch - 'a' + 10,
                >= 'A' and <= 'F' => ch - 'A' + 10,
                _ => -1,
            };
    }

    private static IEnumerable<byte> CanonicalizedPercentEncode(IEnumerable<byte> decodedBytes)
    {
        foreach (byte b in decodedBytes)
        {
            if (b switch
            {
                // RFC3986 の unreserved characters
                0x2D or 0x2E or 0x5F or 0x7E => true,
                >= 0x41 and <= 0x5A => true,
                >= 0x61 and <= 0x7A => true,
                >= 0x30 and <= 0x39 => true,
                _ => false,
            })
            {
                // エンコード不要な文字はそのまま
                yield return b;
            }
            else
            {
                // それ以外は %XX にエンコード (A-F は大文字)
                foreach (byte c in Encoding.UTF8.GetBytes($"%{b:X2}"))
                {
                    yield return c;
                }
            }
        }
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
    internal string Date => now.UtcDateTime.ToString("yyyyMMdd");
    internal string AmzDate => now.UtcDateTime.ToString("yyyyMMddTHHmmssZ");
    internal string Region => region;
    internal string Service => "s3";
    internal string Signing => "aws4_request";
    internal string GetCredentialScope() => $"{Date}/{Region}/{Service}/{Signing}";
}

internal sealed class ByteArrayComparer : IComparer<byte[]>, IEqualityComparer<byte[]>
{
    public static readonly ByteArrayComparer Instance = new();

    private ByteArrayComparer() { }

    public int Compare(byte[]? x, byte[]? y)
    {
        if (ReferenceEquals(x, y)) return 0;
        if (x is null) return -1;
        if (y is null) return 1;

        ReadOnlySpan<byte> a = x;
        ReadOnlySpan<byte> b = y;
        int min = Math.Min(a.Length, b.Length);

        for (int i = 0; i < min; i++)
        {
            int diff = a[i] - b[i];
            if (diff != 0) return diff;
        }

        return a.Length - b.Length;
    }

    public bool Equals(byte[]? x, byte[]? y)
    {
        if (ReferenceEquals(x, y)) return true;
        if (x is null || y is null) return false;
        if (x.Length != y.Length) return false;
        return x.AsSpan().SequenceEqual(y);
    }

    public int GetHashCode(byte[]? obj)
    {
        if (obj is null) return 0;
        // 軽量なハッシュ（簡易版）。必要なら FNV-1a や SipHash に差し替え可。
        unchecked
        {
            int hash = 17;
            foreach (var b in obj)
            {
                hash = hash * 31 + b;
            }
            return hash;
        }
    }
}
