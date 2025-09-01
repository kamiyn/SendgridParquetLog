using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Authorization;
using Microsoft.FluentUI.AspNetCore.Components;
using Microsoft.Identity.Web;
using Microsoft.Identity.Web.UI;

using SendgridParquetViewer.Components;
using SendgridParquetViewer.Options;
using SendgridParquetViewer.Services;

var builder = WebApplication.CreateBuilder(args);

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
                    context.ProtocolMessage.RedirectUri = context.ProtocolMessage.RedirectUri.Replace("http://", "https://", StringComparison.OrdinalIgnoreCase);
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

// Configure S3 options with validation
builder.Services.AddOptions<S3Options>()
    .Bind(builder.Configuration.GetSection(S3Options.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services.AddSingleton(TimeProvider.System);

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

// Add health checks
builder.Services.AddHealthChecks();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}
app.UseStatusCodePagesWithReExecute("/not-found", createScopeForErrors: true);

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

app.Run();
