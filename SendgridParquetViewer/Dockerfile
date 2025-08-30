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

# Build and publish as self-contained for linux-x64
WORKDIR /src/SendgridParquetViewer
RUN dotnet publish -c Release -r linux-x64 --self-contained true -p:PublishSingleFile=true -o /app/publish

# Runtime stage - Using Ubuntu for compatibility with glibc
FROM ubuntu:24.04
WORKDIR /app

# Install required dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    libicu74 \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

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