using EllipticCurve;

using Microsoft.Extensions.Options;

using SendgridParquet.Shared;

namespace SendgridParquetLogger.Helper;

/// <summary>
/// This class allows you to use the Event Webhook feature. Read the docs for
/// more details: https://sendgrid.com/docs/for-developers/tracking-events/event
/// </summary>
public class RequestValidator
{
    private const string SignatureHeader = "X-Twilio-Email-Event-Webhook-Signature";
    private const string TimestampHeader = "X-Twilio-Email-Event-Webhook-Timestamp";

    private readonly Lazy<PublicKey?> _lazyPublicKey;

    public RequestValidator(IOptions<SendGridOptions> options)
    {
        string pem = options.Value.VERIFICATIONKEY; // captured value
        _lazyPublicKey = new Lazy<PublicKey?>(() => string.IsNullOrEmpty(pem) ? null : PublicKey.fromPem(pem));
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
            return RequestValidatorResult.NotConfigured;
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
