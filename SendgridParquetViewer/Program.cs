using Microsoft.FluentUI.AspNetCore.Components;

using SendgridParquetViewer.Components;
using SendgridParquetViewer.Options;
using SendgridParquetViewer.Services;

var builder = WebApplication.CreateBuilder(args);

// Configure S3 options
builder.Services.Configure<S3Options>(builder.Configuration.GetSection(S3Options.SectionName));

// Add services to the container.
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

// Add Fluent UI
builder.Services.AddFluentUIComponents();

// Add DuckDB service - using Scoped for better connection management in Blazor Server
builder.Services.AddScoped<DuckDbService>();

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

app.UseAntiforgery();

app.MapStaticAssets();
app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();

app.Run();
