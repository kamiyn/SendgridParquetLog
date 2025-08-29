using Microsoft.AspNetCore.OpenApi;
using SendgridParquetLogger.Options;
using SendgridParquetLogger.Services;

var builder = WebApplication.CreateBuilder(args);

// Configure options
builder.Services.Configure<S3Options>(builder.Configuration.GetSection(S3Options.SectionName));
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
        options.JsonSerializerOptions.WriteIndented = false;
    });

#if UseSwagger
// Learn more about configuring OpenAPI at https://aka.ms/aspnetcore/openapi
builder.Services.AddEndpointsApiExplorer();
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
    app.UseSwagger();
    app.UseSwaggerUI();
}
#endif

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();
