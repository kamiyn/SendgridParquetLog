using System.Buffers;
using System.Text;
using System.Text.Json;

using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

using SendgridParquet.Shared;

namespace SendgridParquetLogger.ModelBinding;

public sealed class SendGridWebhookModelBinder : IModelBinder
{
    public const string AuthErrorKey = "SendGridAuthError";
    private const int MaxBodyBytes = 1 * 1024 * 1024; // 1MB
    private static readonly TimeSpan AllowedSkew = TimeSpan.FromMinutes(5);

    public async Task BindModelAsync(ModelBindingContext bindingContext)
    {
        var http = bindingContext.HttpContext;
        var services = http.RequestServices;
        var logger = services.GetRequiredService<ILogger<SendGridWebhookModelBinder>>();
        var time = services.GetRequiredService<TimeProvider>();
        var sgOptions = services.GetRequiredService<IOptions<SendGridOptions>>().Value;

        // Validate configuration
        if (string.IsNullOrWhiteSpace(sgOptions.PUBLICKEY))
        {
            http.Items[AuthErrorKey] = StatusCodes.Status500InternalServerError;
            bindingContext.Result = ModelBindingResult.Success(new List<SendGridEvent>()); // short-circuit in controller
            logger.LogError("SENDGRID__PUBLICKEY is not configured");
            return;
        }

        string signature = http.Request.Headers["X-Twilio-Email-Event-Webhook-Signature"];
        string timestamp = http.Request.Headers["X-Twilio-Email-Event-Webhook-Timestamp"];

        if (string.IsNullOrWhiteSpace(signature) || string.IsNullOrWhiteSpace(timestamp))
        {
            http.Items[AuthErrorKey] = StatusCodes.Status401Unauthorized;
            bindingContext.Result = ModelBindingResult.Success(new List<SendGridEvent>());
            logger.LogWarning("Missing SendGrid signature or timestamp headers");
            return;
        }

        // Enforce max size using a capped copy
        using var bodyBuffer = new MemoryStream(capacity: Math.Min(http.Request.ContentLength is long l ? (int)Math.Min(l, MaxBodyBytes) : MaxBodyBytes, MaxBodyBytes));
        try
        {
            await CopyToLimitedAsync(http.Request.Body, bodyBuffer, MaxBodyBytes, http.RequestAborted);
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (IOException ex)
        {
            http.Items[AuthErrorKey] = StatusCodes.Status400BadRequest;
            bindingContext.Result = ModelBindingResult.Success(new List<SendGridEvent>());
            logger.LogWarning(ex, "Failed to read request body");
            return;
        }
        catch (InvalidOperationException ex) when (ex.Message == "BodyTooLarge")
        {
            http.Items[AuthErrorKey] = StatusCodes.Status413PayloadTooLarge;
            bindingContext.Result = ModelBindingResult.Success(new List<SendGridEvent>());
            logger.LogWarning("Request body exceeded 1MB limit");
            return;
        }

        var bodyBytes = bodyBuffer.ToArray();
        var now = time.GetUtcNow();

        // Replay prevention: timestamp freshness
        if (!long.TryParse(timestamp, out var tsSeconds))
        {
            http.Items[AuthErrorKey] = StatusCodes.Status401Unauthorized;
            bindingContext.Result = ModelBindingResult.Success(new List<SendGridEvent>());
            logger.LogWarning("Invalid timestamp format");
            return;
        }

        var headerTime = DateTimeOffset.FromUnixTimeSeconds(tsSeconds);
        if (now - headerTime > AllowedSkew || headerTime - now > AllowedSkew)
        {
            http.Items[AuthErrorKey] = StatusCodes.Status403Forbidden;
            bindingContext.Result = ModelBindingResult.Success(new List<SendGridEvent>());
            logger.LogWarning("Timestamp outside allowed skew window");
            return;
        }

        // Signature verification: Ed25519 over (timestamp + body)
        try
        {
            byte[] publicKey = Convert.FromBase64String(sgOptions.PUBLICKEY.Trim());
            byte[] signatureBytes = Convert.FromBase64String(signature.Trim());
            byte[] data = Encoding.UTF8.GetBytes(timestamp + Encoding.UTF8.GetString(bodyBytes));

            bool ok = System.Security.Cryptography.Ed25519.Verify(publicKey, data, signatureBytes);
            if (!ok)
            {
                http.Items[AuthErrorKey] = StatusCodes.Status401Unauthorized;
                bindingContext.Result = ModelBindingResult.Success(new List<SendGridEvent>());
                logger.LogWarning("Signature verification failed");
                return;
            }
        }
        catch (FormatException ex)
        {
            http.Items[AuthErrorKey] = StatusCodes.Status401Unauthorized;
            bindingContext.Result = ModelBindingResult.Success(new List<SendGridEvent>());
            logger.LogWarning(ex, "Invalid base64 in signature/public key");
            return;
        }

        // Deserialize events
        try
        {
            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = null,
                WriteIndented = false
            };
            var events = JsonSerializer.Deserialize<List<SendGridEvent>>(bodyBytes, options) ?? new List<SendGridEvent>();
            bindingContext.Result = ModelBindingResult.Success(events);
        }
        catch (JsonException ex)
        {
            http.Items[AuthErrorKey] = StatusCodes.Status400BadRequest;
            bindingContext.Result = ModelBindingResult.Success(new List<SendGridEvent>());
            logger.LogWarning(ex, "Invalid JSON payload");
        }
    }

    private static async Task CopyToLimitedAsync(Stream src, Stream dst, int maxBytes, CancellationToken ct)
    {
        byte[] buffer = ArrayPool<byte>.Shared.Rent(64 * 1024);
        try
        {
            int total = 0;
            int read;
            while ((read = await src.ReadAsync(buffer.AsMemory(0, Math.Min(buffer.Length, maxBytes - total)), ct)) > 0)
            {
                total += read;
                await dst.WriteAsync(buffer.AsMemory(0, read), ct);
                if (total >= maxBytes)
                {
                    throw new InvalidOperationException("BodyTooLarge");
                }
            }
        }
        finally
        {
            ArrayPool<byte>.Shared.Return(buffer);
        }
    }
}

