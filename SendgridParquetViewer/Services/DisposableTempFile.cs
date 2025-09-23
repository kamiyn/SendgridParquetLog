namespace SendgridParquetViewer.Services;

public static class DisposableTempFile
{
    public const int BufferSize = 65536;

    public static FileStream Open(string filename) =>
        new(Path.Combine(Path.GetTempPath(), $"{filename}-{Path.GetRandomFileName()}"),
            FileMode.Create,
            FileAccess.ReadWrite,
            FileShare.None,
            BufferSize,
            options: FileOptions.DeleteOnClose);
}
