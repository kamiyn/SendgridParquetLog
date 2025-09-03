using Microsoft.AspNetCore.Mvc;

namespace SendgridParquetLogger.ModelBinding;

public sealed class SendGridWebhookAttribute : ModelBinderAttribute
{
    public SendGridWebhookAttribute() : base(typeof(SendGridWebhookModelBinder))
    {
        BindingSource = BindingSource.Body;
    }
}

