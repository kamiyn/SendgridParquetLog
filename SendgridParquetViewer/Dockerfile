# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

# Copy csproj files and restore to leverage Docker layer cache
COPY SendgridParquetViewer/SendgridParquetViewer.csproj SendgridParquetViewer/
COPY SendgridParquet.Shared/SendgridParquet.Shared.csproj SendgridParquet.Shared/

RUN dotnet restore "SendgridParquetViewer/SendgridParquetViewer.csproj"

# Copy the rest of the source
COPY SendgridParquetViewer/ SendgridParquetViewer/
COPY SendgridParquet.Shared/ SendgridParquet.Shared/

# Publish for linux-x64 so native assets (libduckdb.so) are included
WORKDIR /src/SendgridParquetViewer
RUN dotnet publish "SendgridParquetViewer.csproj" \
    -c Release -r linux-x64 --self-contained false -o /app/publish /p:PublishTrimmed=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS runtime
WORKDIR /app

# Copy published output
COPY --from=build /app/publish .

# Ensure native libraries from publish are discoverable
ENV LD_LIBRARY_PATH=/app

# Environment
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

# Expose port and add a simple healthcheck
EXPOSE 5000

# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#   CMD curl -f http://localhost:5000/ || exit 1

ENTRYPOINT ["dotnet", "SendgridParquetViewer.dll"]