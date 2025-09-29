# Stage 1: Build DuckDB WASM bundle with Node.js
FROM node:20-slim AS duckdb-bundle
WORKDIR /workspace/DuckDbBundle

# Install dependencies
COPY DuckDbBundle/package*.json ./
RUN npm install --include=dev

# Build bundle assets
COPY DuckDbBundle/ ./
# DUCKDB_OUTPUT_DIRECTORY specifies the output directory for the DuckDB WASM bundle assets.
# The npm build process reads this environment variable to determine where to place the built files,
# which are later copied into the ASP.NET Core app's wwwroot/duckdb directory in the next Docker stage.
ENV DUCKDB_OUTPUT_DIRECTORY=/duckdb-dist
RUN npm run build

# Stage 2: Build and publish the ASP.NET Core app
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

ARG VERSION=0.0.0
ARG GITHUB_RUN_NUMBER
ARG GITHUB_SHA

COPY . .
# The source path '/duckdb-dist/' must match the value of DUCKDB_OUTPUT_DIRECTORY set in stage 1 above.
COPY --from=duckdb-bundle /duckdb-dist/ SendgridParquetViewer/wwwroot/duckdb/

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

# Stage 3: Runtime image
# -chiseled does not support ICS. do not use -chiseled
FROM mcr.microsoft.com/dotnet/aspnet:10.0-noble AS runtime
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
