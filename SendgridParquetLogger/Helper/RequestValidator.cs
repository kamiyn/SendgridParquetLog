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

    private readonly ILogger<RequestValidator> _logger;
    private readonly SendGridOptions _options;
    private readonly Lazy<PublicKey?> _lazyPublicKey;

    public RequestValidator(
        ILogger<RequestValidator> logger,
        IOptions<SendGridOptions> options)
    {
        _logger = logger;
        _options = options.Value;
        string pem = options.Value.VERIFICATIONKEY; // captured value
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

    public RequestValidatorResult VerifySignature(string payload, IHeaderDictionary headers)
    {
        PublicKey? publicKey = _lazyPublicKey.Value;
        if (publicKey == null)
        {
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
        var timestamp = headers[TimestampHeader];
        if (!timestamp.Any())
        {
            return RequestValidatorResult.Failed;
        }

        string timestampedPayload = timestamp + payload;
        Signature? decodedSignature = Signature.fromBase64(signature);
        return Ecdsa.verify(timestampedPayload, decodedSignature, publicKey)
            ? RequestValidatorResult.Verified
            : RequestValidatorResult.Failed;
    }
}
