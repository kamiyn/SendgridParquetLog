# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview-alpine AS build
WORKDIR /src

# NativeAOT prerequisites (platform linker, musl toolchain)
RUN apk add --no-cache \
    build-base \
    clang \
    lld \
    musl-dev \
    musl-utils

# Accept build-time variables from CI
ARG VERSION
ARG GITHUB_RUN_NUMBER
ARG GITHUB_SHA

# Copy project files
COPY SendgridParquetLogger/SendgridParquetLogger.csproj SendgridParquetLogger/
COPY SendgridParquetLog.ServiceDefaults/SendgridParquetLog.ServiceDefaults.csproj SendgridParquetLog.ServiceDefaults/
COPY SendgridParquet.Shared/SendgridParquet.Shared.csproj SendgridParquet.Shared/
COPY Directory.Build.props ./

# Restore dependencies
RUN dotnet restore SendgridParquetLogger/SendgridParquetLogger.csproj

# Copy source code
COPY SendgridParquetLogger/ SendgridParquetLogger/
COPY SendgridParquetLog.ServiceDefaults/ SendgridParquetLog.ServiceDefaults/
COPY SendgridParquet.Shared/ SendgridParquet.Shared/

# Build and publish as self-contained for linux-musl-x64 (Alpine)
WORKDIR /src/SendgridParquetLogger
# Propagate build metadata into MSBuild so Directory.Build.props picks them up
ENV VERSION=${VERSION}
ENV GITHUB_RUN_NUMBER=${GITHUB_RUN_NUMBER}
ENV GITHUB_SHA=${GITHUB_SHA}
RUN dotnet publish -c Release -r linux-musl-x64 --self-contained true \
  -p:PublishTrimmed=true \
  -p:PublishAot=true \
  -p:PublishSingleFile=false \
  -p:UseAppHost=false \
  -p:PublishReadyToRun=true \
  -p:VERSION=${VERSION} \
  -p:GITHUB_RUN_NUMBER=${GITHUB_RUN_NUMBER} \
  -p:GITHUB_SHA=${GITHUB_SHA} \
  -o /app/publish

# Runtime stage - Using Alpine for minimal size
FROM alpine:3.20
WORKDIR /app

# Install required dependencies for .NET runtime on Alpine
RUN apk add --no-cache \
    libstdc++ \
    libgcc \
    icu-libs \
    ca-certificates \
    curl

# Copy published application
COPY --from=build /app/publish .

# Make the app executable
RUN chmod +x ./SendgridParquetLogger

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health6QQl || exit 1

# Run the application
ENTRYPOINT ["/app/SendgridParquetLogger"]
