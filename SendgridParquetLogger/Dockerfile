# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

# Copy project files
COPY SendgridParquetLogger/SendgridParquetLogger.csproj SendgridParquetLogger/
COPY SendgridParquetLog.ServiceDefaults/SendgridParquetLog.ServiceDefaults.csproj SendgridParquetLog.ServiceDefaults/
COPY SendgridParquet.Shared/SendgridParquet.Shared.csproj SendgridParquet.Shared/

# Restore dependencies
RUN dotnet restore SendgridParquetLogger/SendgridParquetLogger.csproj

# Copy source code
COPY SendgridParquetLogger/ SendgridParquetLogger/
COPY SendgridParquetLog.ServiceDefaults/ SendgridParquetLog.ServiceDefaults/
COPY SendgridParquet.Shared/ SendgridParquet.Shared/

# Build and publish as self-contained for linux-musl-x64 (Alpine)
WORKDIR /src/SendgridParquetLogger
RUN dotnet publish -c Release -r linux-musl-x64 --self-contained true -o /app/publish

# Runtime stage - Using Alpine for minimal size
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS runtime
WORKDIR /app

# Copy published application
COPY --from=build /app/publish .

# Make the app executable
RUN chmod +x ./SendgridParquetLogger

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Expose port
EXPOSE 8080

# Health check
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#   CMD curl -f http://localhost:8080/webhook/health || exit 1

# Run the application
ENTRYPOINT ["/app/SendgridParquetLogger"]
