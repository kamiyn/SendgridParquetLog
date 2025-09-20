using System;
using System.Collections.Generic;
using System.Linq;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

using SendgridParquetViewer.Models;

namespace SendgridParquetViewer.Controllers;

[ApiController]
[Authorize]
[Route("api/telemetry")]
public sealed class TelemetryController(IConfiguration configuration) : ControllerBase
{
    [HttpGet("config")]
    public ActionResult<TelemetryConfigDto> GetConfig()
    {
        string? endpoint = configuration["OTEL_EXPORTER_OTLP_ENDPOINT"];
        string? protocol = configuration["OTEL_EXPORTER_OTLP_PROTOCOL"];
        string? headersRaw = configuration["OTEL_EXPORTER_OTLP_HEADERS"];
        string? serviceName = configuration["OTEL_SERVICE_NAME"] ?? configuration["OTEL_RESOURCE_ATTRIBUTES"];

        var headers = ParseHeaders(headersRaw);
        bool enabled = !string.IsNullOrEmpty(endpoint);

        var dto = new TelemetryConfigDto(
            Enabled: enabled,
            Endpoint: endpoint,
            Protocol: protocol,
            Headers: headers,
            ServiceName: serviceName
        );

        return Ok(dto);
    }

    private static IReadOnlyDictionary<string, string> ParseHeaders(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
        {
            return new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        }

        var result = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        var pairs = raw.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        foreach (string pair in pairs)
        {
            var kv = pair.Split('=', 2, StringSplitOptions.TrimEntries);
            if (kv.Length == 2 && !string.IsNullOrEmpty(kv[0]))
            {
                result[kv[0]] = kv[1];
            }
        }

        return result;
    }
}
