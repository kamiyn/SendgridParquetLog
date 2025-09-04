using System.Security.Cryptography;
using System.Text;

using EllipticCurve;

using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

using Newtonsoft.Json;

using SendgridParquet.Shared;

using SendgridParquetLogger.Helper;

using ZLogger;

namespace SendgridParquetLogger.Test;

public class RequestValidatorTest
{
    private static RequestValidator CreateValidator(string verificationKey, TimeSpan? allowedSkew = null)
    {
        var logger = LoggerFactory.Create(b =>
        {
            b.ClearProviders();
            b.AddZLoggerConsole();
            b.AddDebug();
            b.SetMinimumLevel(LogLevel.Debug);
        }).CreateLogger<RequestValidator>();
        var skew = $"{allowedSkew ?? TimeSpan.FromMinutes(5)}";
        var options = Options.Create(new SendGridOptions { VERIFICATIONKEY = verificationKey, AllowedSkew = skew });
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
        var curve = ECCurve.CreateFromFriendlyName("secp256k1");
        using var ecdsa = ECDsa.Create(curve);
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
        var validator = CreateValidator(pem, allowedSkew: TimeSpan.Zero);
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

    [Test]
    public void Compare_StarkBankValidator()
    {
        string payloadJson = "[{\"email\":\"test@example.com\",\"timestamp\":1513299569,\"event\":\"delivered\"}]";
        (string, string) LocalFunc()
        {
            // Prepare payload and timestamp
            byte[] payloadBytes = Encoding.UTF8.GetBytes(payloadJson);
            long ts = 1756978099;
            string tsString = ts.ToString();

            // Create key and signature
            var curve = ECCurve.CreateFromFriendlyName("secp256k1");
            using var ecdsa = ECDsa.Create(curve);
            byte[] combined = new byte[Encoding.UTF8.GetByteCount(tsString) + payloadBytes.Length];
            int written = Encoding.UTF8.GetBytes(tsString, 0, tsString.Length, combined, 0);
            Buffer.BlockCopy(payloadBytes, 0, combined, written, payloadBytes.Length);

            byte[] sig = ecdsa.SignData(combined, HashAlgorithmName.SHA256);
            return (Convert.ToBase64String(sig), ecdsa.ExportECPrivateKeyPem());
        }
        ;
        (string sigBase64dotnet, string privateKeyPem) = LocalFunc();

        PrivateKey privateKey = PrivateKey.fromPem(privateKeyPem);
        Signature signature = Ecdsa.sign(payloadJson, privateKey);
        string? sigBase64expected = signature.toBase64();
        //PrivateKey privateKey = PrivateKey.fromPem("-----BEGIN EC PARAMETERS-----\nBgUrgQQACg==\n-----END EC PARAMETERS-----\n-----BEGIN EC PRIVATE KEY-----\nMHQCAQEEIODvZuS34wFbt0X53+P5EnSj6tMjfVK01dD1dgDH02RzoAcGBSuBBAAK\noUQDQgAE/nvHu/SQQaos9TUljQsUuKI15Zr5SabPrbwtbfT/408rkVVzq8vAisbB\nRmpeRREXj5aog/Mq8RrdYy75W9q/Ig==\n-----END EC PRIVATE KEY-----\n");
        //Signature signature = Ecdsa.sign(message, privateKey);


        Assert.That(sigBase64dotnet, Is.EqualTo(sigBase64expected));
    }

    public class EventClass
    {
        [JsonProperty("email")]
        public string Email;

        [JsonProperty("event")]
        public string Event;

        [JsonProperty("reason")]
        public string Reason;

        [JsonProperty("sg_event_id")]
        public string SgEventId;

        [JsonProperty("sg_message_id")]
        public string SgMessageId;

        [JsonProperty("smtp-id")]
        public string SmtpId;

        [JsonProperty("timestamp")]
        public long Timestamp;

        internal const string PUBLIC_KEY = "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE83T4O/n84iotIvIW4mdBgQ/7dAfSmpqIM8kF9mN1flpVKS3GRqe62gw+2fNNRaINXvVpiglSI8eNEc6wEA3F+g==";
        internal const string SIGNATURE = "MEUCIGHQVtGj+Y3LkG9fLcxf3qfI10QysgDWmMOVmxG0u6ZUAiEAyBiXDWzM+uOe5W0JuG+luQAbPIqHh89M15TluLtEZtM=";
        internal const string TIMESTAMP = "1600112502";

        internal static string PAYLOAD() => JsonConvert.SerializeObject(new[]{
            new EventClass {
                Email = "hello@world.com",
                Event = "dropped",
                Reason = "Bounced Address",
                SgEventId = "ZHJvcC0xMDk5NDkxOS1MUnpYbF9OSFN0T0doUTRrb2ZTbV9BLTA",
                SgMessageId = "LRzXl_NHStOGhQ4kofSm_A.filterdrecv-p3mdw1-756b745b58-kmzbl-18-5F5FC76C-9.0",
                SmtpId = "<LRzXl_NHStOGhQ4kofSm_A@ismtpd0039p1iad1.sendgrid.net>",
                Timestamp = 1600112492,
            }
        }) + "\r\n"; // Be sure to include the trailing carriage return and newline!
    }

    [Test]
    public void StarkBankValidator_Succeeds2()
    {
        var result = StarkBankValidator.VerifySignature(EventClass.PAYLOAD(), EventClass.PUBLIC_KEY, EventClass.SIGNATURE, EventClass.TIMESTAMP);
        Assert.That(result, Is.EqualTo(true));
    }

    [Test]
    public void Validator_Succeeds2()
    {
        var payloadJson = EventClass.PAYLOAD();
        var payload = Encoding.UTF8.GetBytes(payloadJson);
        var ts = EventClass.TIMESTAMP;
        var validator = CreateValidator(verificationKey: "");
        var headers = MakeHeaders(ts, sig: "ignored");

        var result = validator.VerifySignature(payload, headers);

        Assert.That(result, Is.EqualTo(RequestValidator.RequestValidatorResult.Verified));
    }

    record RequestParameters(string payload, string pem, string signature, string timestamp);

    private static RequestParameters GetValidPayload() => new RequestParameters(
        @"[{""email"":""example@test.com"",""timestamp"":1756978099,""smtp-id"":""\u003c14c5d75ce93.dfd.64b469@ismtpd-555\u003e"",""event"":""processed"",""category"":[""cat facts""],""sg_event_id"":""A46jsG3T3NmurWTDFXPkiQ=="",""sg_message_id"":""14c5d75ce93.dfd.64b469.filter0001.16648.5515E0B88.0""},{""email"":""example@test.com"",""timestamp"":1756978099,""smtp-id"":""\u003c14c5d75ce93.dfd.64b469@ismtpd-555\u003e"",""event"":""deferred"",""category"":[""cat facts""],""sg_event_id"":""j5PmIu7JliU9hYvYfc8K0Q=="",""sg_message_id"":""14c5d75ce93.dfd.64b469.filter0001.16648.5515E0B88.0"",""response"":""400 try again later"",""attempt"":""5""},{""email"":""example@test.com"",""timestamp"":1756978099,""smtp-id"":""\u003c14c5d75ce93.dfd.64b469@ismtpd-555\u003e"",""event"":""delivered"",""category"":[""cat facts""],""sg_event_id"":""8xa5uuN2-kfahpy31gL9yA=="",""sg_message_id"":""14c5d75ce93.dfd.64b469.filter0001.16648.5515E0B88.0"",""response"":""250 OK""},{""email"":""example@test.com"",""timestamp"":1756978099,""smtp-id"":""\u003c14c5d75ce93.dfd.64b469@ismtpd-555\u003e"",""event"":""open"",""category"":[""cat facts""],""sg_event_id"":""vSVz42Di1PoAteCOCWAaYQ=="",""sg_message_id"":""14c5d75ce93.dfd.64b469.filter0001.16648.5515E0B88.0"",""useragent"":""Mozilla/4.0 (compatible; MSIE 6.1; Windows XP; .NET CLR 1.1.4322; .NET CLR 2.0.50727)"",""ip"":""255.255.255.255""},{""email"":""example@test.com"",""timestamp"":1756978099,""smtp-id"":""\u003c14c5d75ce93.dfd.64b469@ismtpd-555\u003e"",""event"":""click"",""category"":[""cat facts""],""sg_event_id"":""iEYzPYOFZH84LM-7JXOLwA=="",""sg_message_id"":""14c5d75ce93.dfd.64b469.filter0001.16648.5515E0B88.0"",""useragent"":""Mozilla/4.0 (compatible; MSIE 6.1; Windows XP; .NET CLR 1.1.4322; .NET CLR 2.0.50727)"",""ip"":""255.255.255.255"",""url"":""http://www.sendgrid.com/""},{""email"":""example@test.com"",""timestamp"":1756978099,""smtp-id"":""\u003c14c5d75ce93.dfd.64b469@ismtpd-555\u003e"",""event"":""bounce"",""category"":[""cat facts""],""sg_event_id"":""6gOgJy0YoeV3l9woEHcJnA=="",""sg_message_id"":""14c5d75ce93.dfd.64b469.filter0001.16648.5515E0B88.0"",""reason"":""500 unknown recipient"",""status"":""5.0.0""},{""email"":""example@test.com"",""timestamp"":1756978099,""smtp-id"":""\u003c14c5d75ce93.dfd.64b469@ismtpd-555\u003e"",""event"":""dropped"",""category"":[""cat facts""],""sg_event_id"":""F3JgfHmSk8nwaSkFWWXqJQ=="",""sg_message_id"":""14c5d75ce93.dfd.64b469.filter0001.16648.5515E0B88.0"",""reason"":""Bounced Address"",""status"":""5.0.0""},{""email"":""example@test.com"",""timestamp"":1756978099,""smtp-id"":""\u003c14c5d75ce93.dfd.64b469@ismtpd-555\u003e"",""event"":""spamreport"",""category"":[""cat facts""],""sg_event_id"":""-qql8GWzr-QovKSuw9kQbQ=="",""sg_message_id"":""14c5d75ce93.dfd.64b469.filter0001.16648.5515E0B88.0""},{""email"":""example@test.com"",""timestamp"":1756978099,""smtp-id"":""\u003c14c5d75ce93.dfd.64b469@ismtpd-555\u003e"",""event"":""unsubscribe"",""category"":[""cat facts""],""sg_event_id"":""dMq02kRaE-Y6g0B2ouzNnw=="",""sg_message_id"":""14c5d75ce93.dfd.64b469.filter0001.16648.5515E0B88.0""},{""email"":""example@test.com"",""timestamp"":1756978099,""smtp-id"":""\u003c14c5d75ce93.dfd.64b469@ismtpd-555\u003e"",""event"":""group_unsubscribe"",""category"":[""cat facts""],""sg_event_id"":""9__KadD01Un5fxEJeTfqZA=="",""sg_message_id"":""14c5d75ce93.dfd.64b469.filter0001.16648.5515E0B88.0"",""useragent"":""Mozilla/4.0 (compatible; MSIE 6.1; Windows XP; .NET CLR 1.1.4322; .NET CLR 2.0.50727)"",""ip"":""255.255.255.255"",""url"":""http://www.sendgrid.com/"",""asm_group_id"":10},{""email"":""example@test.com"",""timestamp"":1756978099,""smtp-id"":""\u003c14c5d75ce93.dfd.64b469@ismtpd-555\u003e"",""event"":""group_resubscribe"",""category"":[""cat facts""],""sg_event_id"":""78rdgPoCKxrRzW_JKRRFug=="",""sg_message_id"":""14c5d75ce93.dfd.64b469.filter0001.16648.5515E0B88.0"",""useragent"":""Mozilla/4.0 (compatible; MSIE 6.1; Windows XP; .NET CLR 1.1.4322; .NET CLR 2.0.50727)"",""ip"":""255.255.255.255"",""url"":""http://www.sendgrid.com/"",""asm_group_id"":10}]",
        "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAElfwhrGF18oVj/8KIQtvzNi6HxqupuFVp5iKJUiRsdEGnZKJZd31NUS/kWVXXCPO8YMlp7iX45KDz2O/oWGBVLQ==",
        "MEUCIQDiWx4W1dVQ8M/bpIU9M6e50jFhwVzPy8EfJcG96/ea6gIgJK0+LBYqdYJJGzgXo92O1PTH161yCByYuS5VtjRGz20=",
        "1756978099"
    );

    [Test]
    public void StarkBankValidator_Succeeds()
    {
        (string payload, string pem, string signature, string timestamp) = GetValidPayload();
        var result = StarkBankValidator.VerifySignature(payload, pem, signature, timestamp);

        Assert.That(result, Is.EqualTo(true));
    }

    [Test]
    public void Validator_Succeeds()
    {
        (string payloadJson, string pem, string sig, string ts) = GetValidPayload();
        byte[] payloadBytes = Encoding.UTF8.GetBytes(payloadJson);
        var validator = CreateValidator(pem, TimeSpan.FromDays(36500));
        var headers = MakeHeaders(ts, sig);

        var result = validator.VerifySignature(payloadBytes, headers);

        Assert.That(result, Is.EqualTo(RequestValidator.RequestValidatorResult.Verified));
    }
}
