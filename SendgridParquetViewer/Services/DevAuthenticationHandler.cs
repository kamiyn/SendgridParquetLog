#if DEBUG // 認証機能については 安全のため Release ビルドで明示的に無効化された状態にする
using System.Security.Claims;
using System.Text.Encodings.Web;

using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace SendgridParquetViewer.Services;

/// <summary>
/// Minimal authentication handler used only for development
/// </summary>
internal sealed class DevAuthenticationHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "debug-user"),
            new Claim(ClaimTypes.Name, "Debug User"),
            new Claim(ClaimTypes.Email, "debug@example.com"),
            new Claim(ClaimTypes.Role, "Viewer"),
        };
        var identity = new ClaimsIdentity(claims, Scheme.Name);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, Scheme.Name);
        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}

internal static class DevAuthenticationExtensions
{
    public static WebApplicationBuilder AddDevAuthentication(this WebApplicationBuilder builder)
    {
        builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = "Dev";
                options.DefaultChallengeScheme = "Dev";
            })
            .AddScheme<AuthenticationSchemeOptions, DevAuthenticationHandler>("Dev", _ => { });
        return builder;
    }
    public static WebApplicationBuilder AddDevAuthorization(this WebApplicationBuilder builder)
    {
        builder.Services.AddAuthorization(options =>
        {
            // Require authenticated users by default, using the Dev scheme in development.
            options.FallbackPolicy = new AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .AddAuthenticationSchemes("Dev")
                .Build();
            options.AddPolicy("ViewerRole", policy =>
                policy.RequireRole("Viewer", "Admin"));
            options.AddPolicy("AdminRole", policy =>
                policy.RequireRole("Admin"));
        });
        return builder;
    }
}
#endif
