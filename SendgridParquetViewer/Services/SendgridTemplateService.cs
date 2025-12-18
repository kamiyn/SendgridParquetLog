using System.Net.Http.Headers;
using System.Text.Json;

using Microsoft.Extensions.Options;

using SendgridParquetViewer.Models;

namespace SendgridParquetViewer.Services;

public interface ISendgridTemplateService
{
    Task<SendgridTemplateItemResult?> GetSendgridTemplateItemAsync(string templateId, CancellationToken ct);
}

public class SendgridTemplateService(
    HttpClient httpClient,
    IOptions<SendgridOptions> sendgridOptions,
    ILogger<SendgridTemplateService> logger)
    : ISendgridTemplateService
{
    private readonly SendgridOptions _sendgridOptions = sendgridOptions.Value;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public async Task<SendgridTemplateItemResult?> GetSendgridTemplateItemAsync(string templateId, CancellationToken ct)
    {
        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, $"https://api.sendgrid.com/v3/templates/{templateId}");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _sendgridOptions.ApiKey);

            var response = await httpClient.SendAsync(request, ct);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStreamAsync(ct);
            var result = JsonSerializer.Deserialize<SendgridTemplateItemResult>(content, JsonOptions);

            return result;
        }
        catch (JsonException ex)
        {
            logger.LogError(ex, "Error deserializing SendGrid template item response: {TemplateId}", templateId);
            return null;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting SendGrid template item: {TemplateId}", templateId);
            throw;
        }
    }
}
