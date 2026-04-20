using System.Net;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using SendgridParquet.Shared;

namespace SendgridParquetViewer.Controllers;

[ApiController]
[Route("webhook")]
[AllowAnonymous]
[IgnoreAntiforgeryToken]
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
            return new ContentResult
            {
                Content = body ?? string.Empty,
                ContentType = "application/json",
                StatusCode = (int)HttpStatusCode.BadRequest
            };
        }
        return StatusCode((int)status);
    }
}
