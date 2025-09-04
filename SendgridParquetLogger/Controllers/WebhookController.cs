using System.Buffers;
using System.IO.Pipelines;
using System.Net;
using System.Text;
using System.Text.Json;

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
        var (httpStatusCode, events) = await webhookHelper.ReadSendGridEvents(Request.BodyReader, Request.Headers, ct);
        if (httpStatusCode != HttpStatusCode.OK)
        {
            logger.ZLogWarning($"Failed to read request body: {httpStatusCode}");
            return StatusCode((int)httpStatusCode, "Failed to read request body");
        }

        try
        {
            if (!events.Any())
            {
                logger.ZLogWarning($"Received empty or null events");
                return BadRequest("No events received");
            }

            logger.ZLogInformation($"Received {events.Count} events from SendGrid");

            ICollection<HttpStatusCode> results = await webhookHelper.WriteParquetGroupByYmd(events, ct);

            var nonOkResults = results.Where(x => x != HttpStatusCode.OK).ToArray();
            return nonOkResults.Any()
                ? new StatusCodeResult((int)nonOkResults.First())
                : Ok(new
                {
#if DEBUG
                    message = "Events processed successfully",
#endif
                    count = events.Count
                });
        }
        catch (Exception ex)
        {
            logger.ZLogError(ex, $"Error processing SendGrid webhook");
            return StatusCode(500, "Internal server error");
        }
    }

}
