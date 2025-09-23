namespace SendgridParquetViewer.Services;

public static class DisposableTempFile
{
    public const int BufferSize = 65536;

    public static FileStream Open(string filename) =>
        new(GetPath(filename),
            FileMode.Create,
            FileAccess.ReadWrite,
            FileShare.None,
            BufferSize,
            options: FileOptions.DeleteOnClose);

    private static readonly HashSet<char> s_invalidChars =  Path.GetInvalidFileNameChars().ToHashSet();

    private static string GetPath(string filename)
    {
        string sanitizedFileName = new string(filename.Select(c => s_invalidChars.Contains(c) ? '_' : c).ToArray());
        return Path.Combine(Path.GetTempPath(), $"{sanitizedFileName}-{Path.GetRandomFileName()}");
    }
}
