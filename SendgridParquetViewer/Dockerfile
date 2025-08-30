# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files
COPY SendgridParquetViewer/SendgridParquetViewer.csproj SendgridParquetViewer/
COPY SendgridParquet.Shared/SendgridParquet.Shared.csproj SendgridParquet.Shared/

# Restore dependencies
RUN dotnet restore SendgridParquetViewer/SendgridParquetViewer.csproj

# Copy source code
COPY SendgridParquetViewer/ SendgridParquetViewer/
COPY SendgridParquet.Shared/ SendgridParquet.Shared/

# Build and publish
WORKDIR /src/SendgridParquetViewer
RUN dotnet publish -c Release -o /app/publish --no-restore

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Install necessary dependencies for DuckDB
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

# Copy published application
COPY --from=build /app/publish .

# Set environment variables
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/ || exit 1

# Run the application
ENTRYPOINT ["dotnet", "SendgridParquetViewer.dll"]