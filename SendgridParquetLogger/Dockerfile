# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

COPY . .
RUN dotnet restore

# Build and publish as self-contained for linux-musl-x64 (Alpine)
WORKDIR /src/SendgridParquetLogger
RUN dotnet publish -c Release -r linux-x64 -o /app/publish \
 --self-contained false \
 -p:PublishTrimmed=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS runtime
WORKDIR /app

# Copy published application
COPY --from=build /app/publish .

# Ensure native libraries from publish are discoverable
ENV LD_LIBRARY_PATH=/app

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 8080

# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#   CMD curl -f http://localhost:8080/webhook/health || exit 1

# Run the application
ENTRYPOINT ["dotnet", "SendgridParquetLogger.dll"]
