using System.Security.Cryptography;
using System.Text;

using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

using SendgridParquet.Shared;
using SendgridParquetLogger.Helper;

namespace SendgridParquetLogger.Test;

public class RequestValidatorTest
{
    private static RequestValidator CreateValidator(string verificationKey, string allowedSkew = "00:05:00")
    {
        var logger = NullLogger<RequestValidator>.Instance;
        var options = Options.Create(new SendGridOptions { VERIFICATIONKEY = verificationKey, AllowedSkew = allowedSkew });
        return new RequestValidator(logger, options, TimeProvider.System);
    }

    private static (string Timestamp, byte[] Payload, string Signature, string PublicPem, string PublicBase64)
        CreateSignedRequest()
    {
        // Prepare payload and timestamp
        string payloadJson = "[{\"email\":\"test@example.com\",\"timestamp\":1513299569,\"event\":\"delivered\"}]";
        byte[] payloadBytes = Encoding.UTF8.GetBytes(payloadJson);
        long ts = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        string tsString = ts.ToString();

        // Create key and signature
        using var ecdsa = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        byte[] combined = new byte[Encoding.UTF8.GetByteCount(tsString) + payloadBytes.Length];
        int written = Encoding.UTF8.GetBytes(tsString, 0, tsString.Length, combined, 0);
        Buffer.BlockCopy(payloadBytes, 0, combined, written, payloadBytes.Length);

        byte[] sig = ecdsa.SignData(combined, HashAlgorithmName.SHA256);
        string sigBase64 = Convert.ToBase64String(sig);

        // Export public key in both formats
        byte[] spki = ecdsa.ExportSubjectPublicKeyInfo();
        string publicBase64 = Convert.ToBase64String(spki);
        string publicPem = "-----BEGIN PUBLIC KEY-----\n" + publicBase64 + "\n-----END PUBLIC KEY-----\n";

        return (tsString, payloadBytes, sigBase64, publicPem, publicBase64);
    }

    private static IHeaderDictionary MakeHeaders(string ts, string sig)
    {
        var headers = new HeaderDictionary
        {
            ["X-Twilio-Email-Event-Webhook-Timestamp"] = ts,
            ["X-Twilio-Email-Event-Webhook-Signature"] = sig
        };
        return headers;
    }

    [Test]
    public void VerifySignature_WithPem_PublicKey_Succeeds()
    {
        var (ts, payload, sig, pem, _) = CreateSignedRequest();
        var validator = CreateValidator(pem);
        var headers = MakeHeaders(ts, sig);

        var result = validator.VerifySignature(payload, headers);

        Assert.That(result, Is.EqualTo(RequestValidator.RequestValidatorResult.Verified));
    }

    [Test]
    public void VerifySignature_WithBase64_PublicKey_Succeeds()
    {
        var (ts, payload, sig, _, base64) = CreateSignedRequest();
        var validator = CreateValidator(base64);
        var headers = MakeHeaders(ts, sig);

        var result = validator.VerifySignature(payload, headers);

        Assert.That(result, Is.EqualTo(RequestValidator.RequestValidatorResult.Verified));
    }

    [Test]
    public void VerifySignature_WithWrongSignature_Fails()
    {
        var (ts, payload, _, pem, _) = CreateSignedRequest();
        var validator = CreateValidator(pem);
        var headers = MakeHeaders(ts, "AAAA");

        var result = validator.VerifySignature(payload, headers);

        Assert.That(result, Is.EqualTo(RequestValidator.RequestValidatorResult.Failed));
    }

    [Test]
    public void VerifySignature_WithSkewTooLarge_Fails()
    {
        var (ts, payload, sig, pem, _) = CreateSignedRequest();
        // Force skew check to fail by using a very small allowed skew
        var validator = CreateValidator(pem, allowedSkew: "00:00:00");
        var headers = MakeHeaders(ts, sig);

        var result = validator.VerifySignature(payload, headers);

        Assert.That(result, Is.EqualTo(RequestValidator.RequestValidatorResult.Failed));
    }

    [Test]
    public void VerifySignature_NoPublicKey_ReturnsNotConfigured()
    {
        var (ts, payload, _, _, _) = CreateSignedRequest();
        var validator = CreateValidator(verificationKey: "");
        var headers = MakeHeaders(ts, sig: "ignored");

        var result = validator.VerifySignature(payload, headers);

        Assert.That(result, Is.EqualTo(RequestValidator.RequestValidatorResult.NotConfigured));
    }
}
