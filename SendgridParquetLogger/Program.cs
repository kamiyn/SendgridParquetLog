using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

using SendgridParquetLogger.Options;
using SendgridParquetLogger.Services;

using ZLogger;

foreach (string env in new[] { "S3__SERVICEURL", "S3__REGION", "S3__BUCKETNAME" })
{
    Console.WriteLine($"EnvironmentVariable: {env}: {Environment.GetEnvironmentVariable(env)}");
}

var builder = WebApplication.CreateBuilder(args);

// Add Aspire service defaults
builder.AddServiceDefaults();

// Configure ZLogger
builder.Logging.ClearProviders();
builder.Logging.AddZLoggerConsole();

// Configure options
builder.Services.AddOptions<S3Options>()
    .Bind(builder.Configuration.GetSection(S3Options.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
        options.JsonSerializerOptions.WriteIndented = false;
    });

#if UseSwagger
// Learn more about configuring OpenAPI at https://aka.ms/aspnetcore/openapi
//builder.Services.AddEndpointsApiExplorer(); // dotnet 8.0 以前用
//builder.Services.AddSwaggerGen(); // dotnet 8.0 以前用
builder.Services.AddOpenApi();
#endif

// Register services
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddSingleton<ParquetService>();
builder.Services.AddHttpClient<S3StorageService>();

var app = builder.Build();

// if (!app.Environment.IsDevelopment())
{
    var options = app.Services.GetRequiredService<IOptions<S3Options>>();
    Console.WriteLine($"s3: {options.Value.SERVICEURL}/{options.Value.BUCKETNAME}");
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

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

// Map Aspire default endpoints (health checks, etc.)
app.MapDefaultEndpoints();

app.Run();
