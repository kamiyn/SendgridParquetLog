(
    cd SendgridParquetViewer/duckdb-wasm-vite
    npm i
    npm run build
)

dotnet run --project SendgridParquetLog.AppHost -c Debug
