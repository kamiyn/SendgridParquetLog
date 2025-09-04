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
    public const string SIGNATURE_HEADER = "X-Twilio-Email-Event-Webhook-Signature";
    public const string TIMESTAMP_HEADER = "X-Twilio-Email-Event-Webhook-Timestamp";

    private readonly Lazy<PublicKey> _lazyPublicKey;

    public RequestValidator(IOptions<SendGridOptions> options)
    {
        string pem = options.Value.PUBLICKEY; // captured value
        _lazyPublicKey = new Lazy<PublicKey>(() => PublicKey.fromPem(pem));
    }

    public bool VerifySignature(string payload, string signature, string timestamp)
    {
        string timestampedPayload = timestamp + payload;
        Signature? decodedSignature = Signature.fromBase64(signature);
        return Ecdsa.verify(timestampedPayload, decodedSignature, _lazyPublicKey.Value);
    }
}
