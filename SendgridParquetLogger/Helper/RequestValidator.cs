using System;
using System.Globalization;
using System.Security.Cryptography;
using System.Text;

using Microsoft.Extensions.Options;

using SendgridParquet.Shared;

using ZLogger;

namespace SendgridParquetLogger.Helper;

/// <summary>
/// This class allows you to use the Event Webhook feature. Read the docs for
/// more details: https://sendgrid.com/docs/for-developers/tracking-events/event
/// </summary>
public class RequestValidator : IDisposable
{
    private const string SignatureHeader = "X-Twilio-Email-Event-Webhook-Signature";
    private const string TimestampHeader = "X-Twilio-Email-Event-Webhook-Timestamp";
    private static readonly TimeSpan DefaultAllowedSkew = TimeSpan.FromMinutes(5);

    private readonly ILogger<RequestValidator> _logger;
    private readonly SendGridOptions _options;
    private readonly Lazy<ECDsa?> _lazyEcdsa;
    private readonly TimeProvider _timeProvider;
    private readonly TimeSpan _allowedSkew;

    public RequestValidator(
        ILogger<RequestValidator> logger,
        IOptions<SendGridOptions> options,
        TimeProvider timeProvider)
    {
        _logger = logger;
        _options = options.Value;
        _timeProvider = timeProvider;
        string pem = options.Value.VERIFICATIONKEY; // captured value
        // Parse AllowedSkew (ISO8601/XSD duration). Fallback to default on error.
        _allowedSkew = ParseAllowedSkew(options.Value.AllowedSkew, _logger);
        _lazyEcdsa = new Lazy<ECDsa?>(() =>
        {
            try
            {
                if (string.IsNullOrWhiteSpace(pem)) return null;
                try
                {
                    // If VERIFICATIONKEY is base64 (SPKI), wrap it as PEM and import
                    string pemWrapped = $"-----BEGIN PUBLIC KEY-----\n{pem}\n-----END PUBLIC KEY-----\n";
                    var e = ECDsa.Create(ECCurve.NamedCurves.nistP256);
                    e.ImportFromPem(pemWrapped);
                    return e;
                }
                catch
                {
                    // Fallback to raw PEM SPKI
                    var e = ECDsa.Create(ECCurve.NamedCurves.nistP256);
                    e.ImportFromPem(pem);
                    return e;
                }
            }
            catch (Exception ex) when (ex is CryptographicException or FormatException or ArgumentException)
            {
                _logger.ZLogError(ex, $"Invalid {nameof(SendGridOptions.VERIFICATIONKEY)}. Could not import ECDSA public key.");
                return null;
            }
        });
    }

    public enum RequestValidatorResult
    {
        NotConfigured,
        Verified,
        Failed,
    }

    public RequestValidatorResult VerifySignature(byte[] payloadUtf8, IHeaderDictionary headers)
    {
        // 1) Require timestamp and enforce allowed skew to prevent replay
        var timestampHeader = headers[TimestampHeader];
        if (!timestampHeader.Any())
        {
            return RequestValidatorResult.Failed;
        }
        if (!long.TryParse(timestampHeader.ToString(), out long unixSeconds))
        {
            return RequestValidatorResult.Failed;
        }
        var eventTime = DateTimeOffset.FromUnixTimeSeconds(unixSeconds);
        var now = _timeProvider.GetUtcNow();
        if ((now - eventTime).Duration() > _allowedSkew)
        {
            _logger.ZLogInformation($"Timestamp skew exceeded. now={now:O}, ts={eventTime:O}, skew={(now - eventTime).Duration()}");
            return RequestValidatorResult.Failed;
        }

        // 2) Verify signature when public key is configured
        ECDsa? ecdsa = _lazyEcdsa.Value;
        if (ecdsa == null)
        {
            _logger.ZLogDebug($"PublicKey is not configured. {_options.VERIFICATIONKEY}");
            return _options.VERIFICATIONKEY switch
            {
                "VERIFIED" => RequestValidatorResult.Verified,
                "FAILED" => RequestValidatorResult.Failed,
                _ => RequestValidatorResult.NotConfigured,
            };
        }

        var signature = headers[SignatureHeader];
        if (!signature.Any())
        {
            return RequestValidatorResult.Failed;
        }

        // Verify signature over (timestamp + payload) using SHA-256 without combining arrays
        byte[] tsBuffer = Encoding.UTF8.GetBytes(timestampHeader.ToString());
        using var sha256 = SHA256.Create();
        sha256.TransformBlock(tsBuffer, 0, tsBuffer.Length, null, 0);
        sha256.TransformFinalBlock(payloadUtf8, 0, payloadUtf8.Length);

        byte[] signatureBytes;
        try
        {
            signatureBytes = Convert.FromBase64String(signature!);
        }
        catch (FormatException)
        {
            return RequestValidatorResult.Failed;
        }

        // Compute SHA-256 digest and verify ECDSA signature
        byte[] hash = sha256.Hash ?? Array.Empty<byte>();
        bool ok = ecdsa.VerifyHash(hash, signatureBytes);
        return ok ? RequestValidatorResult.Verified : RequestValidatorResult.Failed;
    }

    private static TimeSpan ParseAllowedSkew(string? value, ILogger<RequestValidator> logger)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return DefaultAllowedSkew;
        }
        try
        {
            // Parse using invariant culture (expected formats like "hh:mm:ss" or "d.hh:mm:ss")
            var ts = TimeSpan.Parse(value, CultureInfo.InvariantCulture);
            // Negative durations are not allowed; treat as invalid config
            if (ts < TimeSpan.Zero)
            {
                logger.ZLogWarning($"SENDGRID__ALLOWEDSKEW is negative: {value}. Using default {DefaultAllowedSkew}.");
                return DefaultAllowedSkew;
            }
            return ts;
        }
        catch (Exception ex)
        {
            logger.ZLogWarning(ex, $"Invalid SENDGRID__ALLOWEDSKEW: {value}. Using default {DefaultAllowedSkew}.");
            return DefaultAllowedSkew;
        }
    }

    public void Dispose()
    {
        if (_lazyEcdsa.IsValueCreated)
        {
            _lazyEcdsa.Value?.Dispose();
        }
    }
}
