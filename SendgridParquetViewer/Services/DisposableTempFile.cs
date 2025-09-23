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
        var sb = new System.Text.StringBuilder(filename.Length);
        foreach (char c in filename)
        {
            sb.Append(s_invalidChars.Contains(c) ? '_' : c);
        }
        string sanitizedFileName = sb.ToString();
        return Path.Combine(Path.GetTempPath(), $"{sanitizedFileName}-{Path.GetRandomFileName()}");
    }
}
