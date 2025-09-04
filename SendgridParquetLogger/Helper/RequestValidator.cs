using System;
using System.Globalization;
using System.Text;
using EllipticCurve;

using Microsoft.Extensions.Options;

using SendgridParquet.Shared;

using ZLogger;

namespace SendgridParquetLogger.Helper;

/// <summary>
/// This class allows you to use the Event Webhook feature. Read the docs for
/// more details: https://sendgrid.com/docs/for-developers/tracking-events/event
/// </summary>
public class RequestValidator
{
    private const string SignatureHeader = "X-Twilio-Email-Event-Webhook-Signature";
    private const string TimestampHeader = "X-Twilio-Email-Event-Webhook-Timestamp";
    private static readonly TimeSpan DefaultAllowedSkew = TimeSpan.FromMinutes(5);

    private readonly ILogger<RequestValidator> _logger;
    private readonly SendGridOptions _options;
    private readonly Lazy<PublicKey?> _lazyPublicKey;
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
        _lazyPublicKey = new Lazy<PublicKey?>(() =>
        {
            try
            {
                return string.IsNullOrEmpty(pem) ? null : PublicKey.fromPem(pem);
            }
            catch (Exception ex) when (ex is FormatException or ArgumentException)
            {
                _logger.ZLogError(ex, $"Configure {nameof(SendGridOptions.VERIFICATIONKEY)} currentValue:{pem}");
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

    public RequestValidatorResult VerifySignature(ReadOnlyMemory<byte> payloadUtf8, IHeaderDictionary headers)
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
        PublicKey? publicKey = _lazyPublicKey.Value;
        if (publicKey == null)
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

        // StarkBank ECDSA verifier expects string input; compose from timestamp + UTF-8 payload.
        string timestampedPayload = timestampHeader + Encoding.UTF8.GetString(payloadUtf8.Span);
        Signature? decodedSignature = Signature.fromBase64(signature);
        return Ecdsa.verify(timestampedPayload, decodedSignature, publicKey)
            ? RequestValidatorResult.Verified
            : RequestValidatorResult.Failed;
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
}
