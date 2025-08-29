using Microsoft.AspNetCore.OpenApi;

using SendgridParquetLogger.Options;
using SendgridParquetLogger.Services;

var builder = WebApplication.CreateBuilder(args);

// Add Aspire service defaults
builder.AddServiceDefaults();

// Configure options (Aspire will provide environment variables)
builder.Services.Configure<S3Options>(builder.Configuration.GetSection(S3Options.SectionName));
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
        options.JsonSerializerOptions.WriteIndented = false;
    });

#if UseSwagger
// Learn more about configuring OpenAPI at https://aka.ms/aspnetcore/openapi
builder.Services.AddOpenApi();
builder.Services.AddSwaggerGen();
#endif

// Register services
builder.Services.AddSingleton<ParquetService>();
builder.Services.AddSingleton<S3StorageService>();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    var s3Service = app.Services.GetRequiredService<S3StorageService>();
    await s3Service.CreateBucketIfNotExistsAsync();
}
#if UseSwagger
{
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
