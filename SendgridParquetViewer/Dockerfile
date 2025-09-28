# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Accept build-time variables from CI
ARG VERSION=0.0.0
ARG GITHUB_RUN_NUMBER
ARG GITHUB_SHA

COPY . .
RUN dotnet restore

WORKDIR /src/SendgridParquetViewer
# dotnet publish passes build metadata properties (-p:VERSION, etc.) to the imported targets

# use aspnet:10.0-noble-chiseled for Viewer
# default setting (PublishAot=false,PublishTrimmed=false,-self-contained false)
RUN dotnet publish -c Release -r linux-x64 \
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
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 5000

# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#   CMD curl -f http://localhost:5000/ || exit 1

ENTRYPOINT ["dotnet", "SendgridParquetViewer.dll"]
