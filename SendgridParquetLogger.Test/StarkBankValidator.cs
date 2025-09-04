using EllipticCurve;

namespace SendgridParquetLogger.Helper;

public static class StarkBankValidator
{
    public static bool VerifySignature(string payload, string pem, string signature, string timestamp)
    {
        PublicKey? publicKey = PublicKey.fromPem(pem);
        string timestampedPayload = timestamp + payload;
        Signature? decodedSignature = Signature.fromBase64(signature);
        return Ecdsa.verify(timestampedPayload, decodedSignature, publicKey);
    }
}
