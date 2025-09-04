#if UseSwagger
using System.Net;

using Microsoft.AspNetCore.Mvc;

using SendgridParquet.Shared;

using SendgridParquetLogger.Helper;

using ZLogger;

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
        var (status, body) = await webhookHelper.ProcessReceiveSendGridEventsAsync(Request.BodyReader, Request.Headers, ct);
        return status == HttpStatusCode.OK
            ? Ok(body)
            : StatusCode((int)status, body);
    }

}
#endif
