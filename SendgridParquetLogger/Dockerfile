# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Accept build-time variables from CI
ARG VERSION=0.0.0
ARG GITHUB_RUN_NUMBER
ARG GITHUB_SHA

# need for NativeAOT
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    clang \
    lld \
    zlib1g-dev \
 && rm -rf /var/lib/apt/lists/*

COPY . .
RUN dotnet restore

WORKDIR /src/SendgridParquetLogger
# Propagate build metadata into MSBuild so Directory.Build.props picks them up
ENV VERSION=${VERSION}
ENV GITHUB_RUN_NUMBER=${GITHUB_RUN_NUMBER}
ENV GITHUB_SHA=${GITHUB_SHA}

# use Aot for Logger
RUN dotnet publish -c Release -r linux-x64 \
 -p:PublishTrimmed=true \
 -p:PublishAot=true \
 -p:VERSION=${VERSION:-0.0.0} \
 -p:GITHUB_RUN_NUMBER=${GITHUB_RUN_NUMBER} \
 -p:GITHUB_SHA=${GITHUB_SHA} \
 -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0-noble-chiseled AS runtime
WORKDIR /app

# Copy published output
COPY --from=build /app/publish .

# Ensure native libraries from publish are discoverable
ENV LD_LIBRARY_PATH=/app

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 8080

# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#   CMD curl -f http://localhost:8080/health6QQl || exit 1

ENTRYPOINT ["dotnet", "SendgridParquetLogger.dll"]
