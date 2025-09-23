using ZLogger;

namespace SendgridParquetViewer.Services;

public sealed class DisposableTempFile(string filename, ILogger logger) : IDisposable
{
    public const int BufferSize = 65536;

    private readonly string _path = Path.Combine(Path.GetTempPath(), $"{filename}-{Path.GetRandomFileName()}");

    public FileStream Open() =>
        new(_path,
            FileMode.Create,
            FileAccess.ReadWrite,
            FileShare.None,
            BufferSize,
            useAsync: true);

    public void Dispose()
    {
        try
        {
            File.Delete(_path);
        }
        catch (Exception ex)
        {
            logger.ZLogWarning(ex, $"Failed to delete temporary file: {_path}");
        }
    }
}
