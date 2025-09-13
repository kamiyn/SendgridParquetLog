using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Logging;

using OpenTelemetry;
using OpenTelemetry.Metrics;
using OpenTelemetry.Exporter;
using OpenTelemetry.Trace;
using Azure.Monitor.OpenTelemetry.AspNetCore;

namespace Microsoft.Extensions.Hosting;

// Adds common .NET Aspire services: service discovery, resilience, health checks, and OpenTelemetry.
// This project should be referenced by each service project in your solution.
// To learn more about using this project, see https://aka.ms/dotnet/aspire/service-defaults
public static class Extensions
{
    public static IHostApplicationBuilder AddServiceDefaults(this IHostApplicationBuilder builder)
    {
        builder.ConfigureOpenTelemetry();

        builder.AddDefaultHealthChecks();

        builder.Services.AddServiceDiscovery();

        builder.Services.ConfigureHttpClientDefaults(http =>
        {
            // Turn on resilience by default
            http.AddStandardResilienceHandler();

            // Turn on service discovery by default
            http.AddServiceDiscovery();
        });

        // Uncomment the following to restrict the allowed schemes for service discovery.
        // builder.Services.Configure<ServiceDiscoveryOptions>(options =>
        // {
        //     options.AllowedSchemes = ["https"];
        // });

        return builder;
    }

    public static IHostApplicationBuilder ConfigureOpenTelemetry(this IHostApplicationBuilder builder)
    {
        builder.Logging.AddOpenTelemetry(logging =>
        {
            logging.IncludeFormattedMessage = true;
            logging.IncludeScopes = true;
        });

        builder.Services.AddOpenTelemetry()
            .WithMetrics(metrics =>
            {
                metrics.AddAspNetCoreInstrumentation()
                    .AddHttpClientInstrumentation()
                    .AddRuntimeInstrumentation();
            })
            .WithTracing(tracing =>
            {
                tracing.AddAspNetCoreInstrumentation()
                    // Uncomment the following line to enable gRPC instrumentation (requires the OpenTelemetry.Instrumentation.GrpcNetClient package)
                    //.AddGrpcClientInstrumentation()
                    .AddHttpClientInstrumentation();
            });

        builder.AddOpenTelemetryExporters();

        return builder;
    }

    private static IHostApplicationBuilder AddOpenTelemetryExporters(this IHostApplicationBuilder builder)
    {
        var endpoint = builder.Configuration["OTEL_EXPORTER_OTLP_ENDPOINT"];
        var fromDashboard = false;
        if (string.IsNullOrWhiteSpace(endpoint))
        {
            // Fallback for .NET Aspire Dashboard local dev
            endpoint = builder.Configuration["DOTNET_DASHBOARD_OTLP_ENDPOINT_URL"];
            fromDashboard = !string.IsNullOrWhiteSpace(endpoint);
        }

        if (!string.IsNullOrWhiteSpace(endpoint))
        {
            var uri = new Uri(endpoint);
            var protoEnv = builder.Configuration["OTEL_EXPORTER_OTLP_PROTOCOL"];
            var protocol = OtlpExportProtocol.Grpc;
            if (!string.IsNullOrWhiteSpace(protoEnv))
            {
                protocol = protoEnv.Equals("http/protobuf", StringComparison.OrdinalIgnoreCase)
                    ? OtlpExportProtocol.HttpProtobuf
                    : OtlpExportProtocol.Grpc;
            }
            else if (fromDashboard || uri.Scheme.StartsWith("http", StringComparison.OrdinalIgnoreCase))
            {
                protocol = OtlpExportProtocol.HttpProtobuf;
            }

            // Use overload compatible with OpenTelemetry 1.12.0
            builder.Services.AddOpenTelemetry().UseOtlpExporter(protocol, uri);
        }

        // Enable the Azure Monitor exporter when connection string is provided
        if (!string.IsNullOrWhiteSpace(builder.Configuration["APPLICATIONINSIGHTS_CONNECTION_STRING"]))
        {
            builder.Services.AddOpenTelemetry().UseAzureMonitor();
        }

        return builder;
    }

    public static IHostApplicationBuilder AddDefaultHealthChecks(this IHostApplicationBuilder builder)
    {
        builder.Services.AddHealthChecks()
            // Add a default liveness check to ensure app is responsive
            .AddCheck("self", () => HealthCheckResult.Healthy(), ["live"]);

        return builder;
    }

    public static WebApplication MapDefaultEndpoints(this WebApplication app)
    {
        // Adding health checks endpoints to applications in non-development environments has security implications.
        // See https://aka.ms/dotnet/aspire/healthchecks for details before enabling these endpoints in non-development environments.
        if (app.Environment.IsDevelopment())
        {
            // All health checks must pass for app to be considered ready to accept traffic after starting
            app.MapHealthChecks("/health");

            // Only health checks tagged with the "live" tag must pass for app to be considered alive
            app.MapHealthChecks("/alive", new HealthCheckOptions
            {
                Predicate = r => r.Tags.Contains("live")
            });
        }

        return app;
    }
}
