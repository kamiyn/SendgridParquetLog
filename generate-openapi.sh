#!/bin/bash

echo "Starting server in Development mode to generate OpenAPI specification..."

# Change to project directory
cd /home/h/Playground/SendgridParquetLog/SendgridParquetLogger

# Build the project first
echo "Building the project..."
dotnet build

# Start the server in background
echo "Starting server..."
ASPNETCORE_ENVIRONMENT=Development dotnet run --urls "http://localhost:5000" &
SERVER_PID=$!

# Wait for server to start
echo "Waiting for server to start..."
sleep 10

# Check if server is running
if ! ps -p $SERVER_PID > /dev/null; then
    echo "Failed to start server"
    exit 1
fi

# Try to fetch OpenAPI specification
echo "Fetching OpenAPI specification..."

# Try Swagger endpoint first
if curl -s http://localhost:5000/swagger/v1/swagger.json > /dev/null 2>&1; then
    echo "Found Swagger endpoint, downloading OpenAPI specification..."
    curl -s http://localhost:5000/swagger/v1/swagger.json -o openapi.json
    echo "OpenAPI specification saved to openapi.json"
elif curl -s http://localhost:5000/openapi/v1.json > /dev/null 2>&1; then
    echo "Found OpenAPI endpoint, downloading OpenAPI specification..."
    curl -s http://localhost:5000/openapi/v1.json -o openapi.json
    echo "OpenAPI specification saved to openapi.json"
else
    echo "Could not find OpenAPI endpoint, trying alternative paths..."
    
    # Try other common paths
    if curl -s http://localhost:5000/openapi.json > /dev/null 2>&1; then
        curl -s http://localhost:5000/openapi.json -o openapi.json
        echo "OpenAPI specification saved to openapi.json"
    elif curl -s http://localhost:5000/api/openapi.json > /dev/null 2>&1; then
        curl -s http://localhost:5000/api/openapi.json -o openapi.json
        echo "OpenAPI specification saved to openapi.json"
    else
        echo "Failed to find OpenAPI specification endpoint"
        echo "Available endpoints:"
        curl -s http://localhost:5000/ || echo "Server may not be responding"
    fi
fi

# Stop the server
echo "Stopping server..."
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null

echo "Done!"

# Display the generated file if it exists
if [ -f "openapi.json" ]; then
    echo "Successfully generated openapi.json"
    echo "File size: $(du -h openapi.json | cut -f1)"
    echo "First 10 lines of openapi.json:"
    head -10 openapi.json
else
    echo "Failed to generate openapi.json"
    exit 1
fi