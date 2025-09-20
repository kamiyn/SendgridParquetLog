# Build stage
# Build duckdb-wasm assets with Node
ARG NODE_VERSION=20-bullseye
FROM node:${NODE_VERSION} AS duckdb-wasm
WORKDIR /src/SendgridParquetViewer

# Install dependencies and build frontend bundle
COPY SendgridParquetViewer/duckdb-wasm-vite/package*.json ./duckdb-wasm-vite/
RUN cd duckdb-wasm-vite \
 && npm ci

COPY SendgridParquetViewer ./
RUN cd duckdb-wasm-vite \
 && npm run build

# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

COPY . .
# Overwrite bundled assets with freshly built output
COPY --from=duckdb-wasm /src/SendgridParquetViewer/wwwroot/js/ SendgridParquetViewer/wwwroot/js/
RUN dotnet restore

# Publish for linux-x64 so native assets (libduckdb.so) are included
WORKDIR /src/SendgridParquetViewer
RUN dotnet publish -c Release -r linux-x64 -o /app/publish \
 --self-contained false \
 -p:PublishTrimmed=false

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
