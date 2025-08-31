# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

COPY . .
RUN dotnet restore

# Publish for linux-x64 so native assets (libduckdb.so) are included
WORKDIR /src/SendgridParquetViewer
RUN dotnet publish \
    -c Release -r linux-x64 --self-contained false -o /app/publish /p:PublishTrimmed=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS runtime
WORKDIR /app

# Copy published output
COPY --from=build /app/publish .

# Ensure native libraries from publish are discoverable
ENV LD_LIBRARY_PATH=/app

# Set environment variables
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 5000

# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#   CMD curl -f http://localhost:5000/ || exit 1

ENTRYPOINT ["dotnet", "SendgridParquetViewer.dll"]
