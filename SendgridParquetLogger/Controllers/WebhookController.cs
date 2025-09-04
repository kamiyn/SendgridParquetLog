#if UseSwagger
using System.Net;

using Microsoft.AspNetCore.Mvc;

using SendgridParquetLogger.Helper;

namespace SendgridParquetLogger.Controllers;

[ApiController]
[Route("webhook")]
public class WebhookController(
    ILogger<WebhookController> logger,
    WebhookHelper webhookHelper
) : ControllerBase
{
    [HttpPost("sendgrid")]
    public async Task<IActionResult> ReceiveSendGridEvents(CancellationToken ct)
    {
        var (status, body) = await webhookHelper.ProcessReceiveSendGridEventsAsync(Request.Body, Request.Headers, ct);
        return status == HttpStatusCode.OK
            ? Ok(body)
            : StatusCode((int)status, body);
    }
}
#endif
