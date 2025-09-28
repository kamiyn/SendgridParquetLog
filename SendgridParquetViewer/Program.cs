using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Authorization;
using Microsoft.FluentUI.AspNetCore.Components;
using Microsoft.Identity.Web;
using Microsoft.Identity.Web.UI;

using SendgridParquet.Shared;

using SendgridParquetViewer.Components;
using SendgridParquetViewer.Models;
using SendgridParquetViewer.Services;

var builder = WebApplication.CreateBuilder(args);

#if UseAspire
// Add Aspire service defaults (service discovery, health checks, OpenTelemetry)
builder.AddServiceDefaults();
#endif

// 開発用認証は、環境変数 ENABLE_DEV_AUTH が true の場合に有効になります。
// 本番環境では public な S3 互換ストレージを利用することを想定しています。
// Development authentication is enabled when the ENABLE_DEV_AUTH environment variable is set to true.
var enableDevAuth = Environment.GetEnvironmentVariable("ENABLE_DEV_AUTH");
if (string.Equals(enableDevAuth, "true", StringComparison.OrdinalIgnoreCase))
{
    builder.AddDevAuthentication();
    builder.AddDevAuthorization();
}
else
{
    // Add Azure AD authentication
    builder.Services.AddAuthentication(OpenIdConnectDefaults.AuthenticationScheme)
        .AddMicrosoftIdentityWebApp(options =>
        {
            builder.Configuration.GetSection("AzureAd").Bind(options);
            options.Events = new OpenIdConnectEvents
            {
                OnRedirectToIdentityProvider = context =>
                {
                    // リダイレクトURIをHTTPSに強制 EntraID は https しか受け付けない
                    if (context.ProtocolMessage.RedirectUri.StartsWith("http://", StringComparison.OrdinalIgnoreCase))
                    {
                        context.ProtocolMessage.RedirectUri =
                            context.ProtocolMessage.RedirectUri.Replace("http://", "https://",
                                StringComparison.OrdinalIgnoreCase);
                    }

                    return Task.CompletedTask;
                }
            };
        });

    // Add authorization with role-based policies
    builder.Services.AddAuthorization(options =>
    {
        // Require authenticated users by default
        options.FallbackPolicy = new AuthorizationPolicyBuilder()
            .RequireAuthenticatedUser()
            .Build();

        // Define role-based policies for AppRoles
        options.AddPolicy("ViewerRole", policy =>
            policy.RequireRole("Viewer", "Admin"));

        options.AddPolicy("AdminRole", policy =>
            policy.RequireRole("Admin"));
    });
}

// Configure S3 options with validation
builder.Services.AddOptions<S3Options>()
    .Bind(builder.Configuration.GetSection(S3Options.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();

// Configure Compaction options
builder.Services.AddOptions<CompactionOptions>()
    .Bind(builder.Configuration.GetSection(CompactionOptions.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();

//builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddOptions<TimeProviderOptions>()
    .Configure(options =>
    {
        if (TimeSpan.TryParse(builder.Configuration["TimeProviderOffset"], null, out TimeSpan span))
        {
            options.Offset = span;
        }
    });
builder.Services.AddSingleton<TimeProvider, ConfigurableTimeProvider>();

// Add services to the container.
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents()
    .AddMicrosoftIdentityConsentHandler();

// Add controllers for authentication UI
builder.Services.AddControllersWithViews()
    .AddMicrosoftIdentityUI();

// Add Fluent UI
builder.Services.AddFluentUIComponents();

// Add DuckDB service
builder.Services.AddTransient<DuckDbService>();

// Add S3 storage service
builder.Services.AddHttpClient<S3StorageService>();
builder.Services.AddSingleton<IS3LockService, S3LockService>();

// Add Parquet service
builder.Services.AddSingleton<ParquetService>(); // 無状態のため AddSingleton

// Add Compaction service
builder.Services.AddSingleton<CompactionService>(); // 1プロセスあたり同時実行は1つだけにする
builder.Services.AddHostedService<CompactionStartupHostedService>(); // 起動時にコンパクションを開始するホストサービス

// Add health checks
builder.Services.AddHealthChecks();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}
app.UseStatusCodePagesWithReExecute("/not-found");

app.UseHttpsRedirection();

// Add authentication and authorization middleware
app.UseAuthentication();
app.UseAuthorization();

app.UseAntiforgery();

app.MapStaticAssets();
app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();

// Map controllers for authentication endpoints
app.MapControllers();

// Map health check endpoint (allow anonymous access)
app.MapHealthChecks("/health6QQl").AllowAnonymous();

#if UseAspire
// Map Aspire default endpoints (health checks etc. in dev)
app.MapDefaultEndpoints();
#endif

app.Run();
