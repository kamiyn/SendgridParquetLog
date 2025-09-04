using SendgridParquet.Shared;

using SendgridParquetLogger.Helper;

using ZLogger;

var builder = WebApplication.CreateBuilder(args);

#if UseAspire
// Add Aspire service defaults
builder.AddServiceDefaults();
#endif

// Configure ZLogger
builder.Logging.ClearProviders();
builder.Logging.AddZLoggerConsole();

// Configure options
builder.Services.AddOptions<S3Options>()
    .Bind(builder.Configuration.GetSection(S3Options.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services.AddOptions<SendGridOptions>()
    .Bind(builder.Configuration.GetSection(SendGridOptions.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();

#if UseSwagger
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
        options.JsonSerializerOptions.WriteIndented = false;
    });
#endif

#if UseSwagger
// Learn more about configuring OpenAPI at https://aka.ms/aspnetcore/openapi
//builder.Services.AddEndpointsApiExplorer(); // dotnet 8.0 以前用
//builder.Services.AddSwaggerGen(); // dotnet 8.0 以前用
builder.Services.AddOpenApi();
#endif

// Register services
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddSingleton<ParquetService>(); // 無状態のため AddSingleton
builder.Services.AddSingleton<RequestValidator>(); // 処理は無状態 PublicKey の生成をキャッシュするため AddSingleton
builder.Services.AddHttpClient<S3StorageService>();
builder.Services.AddScoped<WebhookHelper>();

var app = builder.Build();

// if (!app.Environment.IsDevelopment())
{
    var s3Service = app.Services.GetRequiredService<S3StorageService>();
    await s3Service.CreateBucketIfNotExistsAsync(TimeProvider.System.GetUtcNow(), CancellationToken.None);
}
#if UseSwagger
{
    //app.UseSwagger(); // dotnet 8.0 以前用
    app.MapOpenApi();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "SendGrid Parquet Logger API v1");
    });
}
#endif

#if UseSwagger
app.MapControllers();
#else
// Minimal APIs when UseSwagger is not defined
app.MapGet("/health6QQl", (TimeProvider timeProvider) =>
{
    return Results.Ok(new { status = "healthy", timestamp = timeProvider.GetUtcNow() });
});

app.MapPost("/webhook/sendgrid", async (HttpContext httpContext, WebhookHelper webhookHelper, CancellationToken ct) =>
{
    var (status, body) = await webhookHelper.ProcessReceiveSendGridEventsAsync(httpContext.Request.BodyReader, httpContext.Request.Headers, ct);
    if (status == System.Net.HttpStatusCode.OK)
    {
        return Results.Ok(body);
    }
    if (status == System.Net.HttpStatusCode.BadRequest)
    {
        return Results.BadRequest(body);
    }
    return Results.StatusCode((int)status);
});
#endif

#if UseAspire
// Map Aspire default endpoints (health checks, etc.)
app.MapDefaultEndpoints();
#endif

app.Run();
