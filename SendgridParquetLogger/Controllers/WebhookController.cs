#if UseSwagger
using System.Net;

using Microsoft.AspNetCore.Mvc;

using SendgridParquetLogger.Helper;

namespace SendgridParquetLogger.Controllers;

[ApiController]
[Route("webhook")]
public class WebhookController(
    WebhookHelper webhookHelper
) : ControllerBase
{
    [HttpPost("sendgrid")]
    public async Task<IActionResult> ReceiveSendGridEvents(CancellationToken ct)
    {
        var (status, body) = await webhookHelper.ProcessReceiveSendGridEventsAsync(Request.BodyReader, Request.Headers, ct);
        if (status == HttpStatusCode.OK)
        {
            return Content(body ?? string.Empty, "application/json");
        }
        if (status == HttpStatusCode.BadRequest)
        {
            return Content(body ?? string.Empty, "application/json", (int)HttpStatusCode.BadRequest);
        }
        return StatusCode((int)status);
    }
}
#endif
