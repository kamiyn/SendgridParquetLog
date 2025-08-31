# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

# Copy project files
COPY SendgridParquetViewer/SendgridParquetViewer.csproj SendgridParquetViewer/
COPY SendgridParquet.Shared/SendgridParquet.Shared.csproj SendgridParquet.Shared/

# Restore dependencies
RUN dotnet restore SendgridParquetViewer/SendgridParquetViewer.csproj

# Copy source code
COPY SendgridParquetViewer/ SendgridParquetViewer/
COPY SendgridParquet.Shared/ SendgridParquet.Shared/

# Build and publish as self-contained for linux-musl-x64 (Alpine)
WORKDIR /src/SendgridParquetViewer
RUN dotnet publish -c Release -r linux-musl-x64 --self-contained true -p:PublishSingleFile=true -o /app/publish

# Runtime stage - Using Alpine for minimal size
FROM alpine:3.20
WORKDIR /app

# Install required dependencies for .NET runtime and DuckDB on Alpine
RUN apk add --no-cache \
    libstdc++ \
    libgcc \
    icu-libs \
    ca-certificates \
    curl \
    openssl

# Copy published application
COPY --from=build /app/publish .

# Make the app executable
RUN chmod +x ./SendgridParquetViewer

# Set environment variables
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/ || exit 1

# Run the application
ENTRYPOINT ["/app/SendgridParquetViewer"]