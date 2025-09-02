using System;
using System.IO;
using System.Security.Cryptography;

namespace SendgridParquet.Shared;

/// <summary>
/// SendGrid関連のS3パスとファイル名生成のユーティリティクラス
/// </summary>
public static class SendGridPathUtility
{
    public const string ParquetFileExtension = ".parquet";

    /// <summary>
    /// Parquet 列定義のバージョンに合わせて フォルダー名の prefix を付与する
    ///
    /// Compaction 前のフォルダー名
    /// </summary>
    const string FolderPrefixNonCompaction = "v2raw";

    /// <summary>
    /// Parquet 列定義のバージョンに合わせて フォルダー名の prefix を付与する
    ///
    /// Compaction 後のフォルダー名
    /// </summary>
    const string FolderPrefixCompaction = "v2compaction";

    /// <summary>
    /// Base64Url エンコードを行う（ASP.NET Core依存を避けるため独自実装）
    /// </summary>
    private static string Base64UrlEncode(byte[] input) =>
        Convert.ToBase64String(input).TrimEnd('=').Replace('+', '-').Replace('/', '_');

    /// <summary>
    /// ディレクトリパスを生成する（ファイル名を除く）
    /// </summary>
    /// <param name="folderPrefix">フォルダープレフィックス</param>
    /// <param name="targetDay">対象の日付</param>
    /// <returns>ディレクトリパス</returns>
    private static string GetDirectoryPath(string folderPrefix, DateTime targetDay) =>
        $"{folderPrefix}/{targetDay:yyyy/MM/dd}";

    /// <summary>
    /// Parquetファイル名を生成する（NonCompaction用のオーバーロード）
    /// </summary>
    /// <param name="targetDay">対象の日付</param>
    /// <param name="parquetData">Parquetデータのストリーム</param>
    /// <returns>S3オブジェクトキー</returns>
    public static string GetParquetNonCompactionFileName(DateTime targetDay, Stream parquetData)
    {
        // S3 Object key names are case sensitive https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-keys.html
        string hashString = GetHashString(parquetData);
        return $"{GetDirectoryPath(FolderPrefixNonCompaction, targetDay)}/{hashString}{ParquetFileExtension}";
    }

    /// <summary>
    /// Parquetファイル名を生成する（Compaction用のオーバーロード）
    /// </summary>
    /// <param name="targetDay">対象の日付</param>
    /// <param name="targetHour">対称の時刻</param>
    /// <param name="parquetData">Parquetデータのストリーム</param>
    /// <returns>S3オブジェクトキー</returns>
    public static string GetParquetCompactionFileName(DateTime targetDay, int targetHour, Stream parquetData)
    {
        // S3 Object key names are case sensitive https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-keys.html
        string hashString = GetHashString(parquetData);
        return $"{GetDirectoryPath(FolderPrefixCompaction, targetDay)}/{targetHour:D2}/{hashString}{ParquetFileExtension}";
    }

    private static string GetHashString(Stream parquetData)
    {
        parquetData.Seek(0, SeekOrigin.Begin);
        using var sha256 = SHA256.Create();
        byte[] hash = sha256.ComputeHash(parquetData);
        return Base64UrlEncode(hash);
    }

    private static string GetYmdWildcard(int? year, int? month, int? day) =>
        (year, month, day) switch
        {
            (null, null, null) => "",
            ({ /* NOT NULL pattern */ } y, { } m, { } d) => $"/{y:D4}/{m:D2}/{d:D2}",
            ({ } y, { } m, null) => $"/{y:D4}/{m:D2}/*",
            ({ } y, null, _) => $"/{y:D4}/*/*",
            (null, _, _) => "/*/*/*"
        };

    /// <summary>
    /// パス（prefix/path/*）を生成する（NonCompaction用のオーバーロード）
    /// </summary>
    /// <param name="year">年（nullの場合は全年対象）</param>
    /// <param name="month">月（nullの場合は全月対象）</param>
    /// <param name="day">日（nullの場合は全日対象）</param>
    /// <returns>完全なS3パス</returns>
    public static string GetS3NonCompactionWildcard(int? year, int? month, int? day) =>
        $"{FolderPrefixNonCompaction}{GetYmdWildcard(year, month, day)}";

    private static string GetYmdhWildcard(int? year, int? month, int? day, int? hour) =>
        (year, month, day, hour) switch
        {
            (null, null, null, null) => "",
            ({ /* NOT NULL pattern */ } y, { } m, { } d, { } h) => $"/{y:D4}/{m:D2}/{d:D2}/{h:D2}",
            ({ } y, { } m, { } d, null) => $"/{y:D4}/{m:D2}/{d:D2}/*",
            ({ } y, { } m, null, _) => $"/{y:D4}/{m:D2}/*/*",
            ({ } y, null, _, _) => $"/{y:D4}/*/*/*",
            (null, _, _, _) => "/*/*/*/*"
        };

    /// <summary>
    /// パス（prefix/path/*）を生成する（Compaction用のオーバーロード）
    /// </summary>
    /// <param name="year">年（nullの場合は全年対象）</param>
    /// <param name="month">月（nullの場合は全月対象）</param>
    /// <param name="day">日（nullの場合は全日対象）</param>
    /// <param name="hour">時 (nullの場合は全時間対象)</param>
    /// <returns>完全なS3パス</returns>
    public static string GetS3CompactionWildcard(int? year, int? month, int? day, int? hour) =>
        $"{FolderPrefixCompaction}{GetYmdhWildcard(year, month, day, hour)}";

    private static string GetYmdPrefix(int? year, int? month, int? day) =>
        (year, month, day) switch
        {
            (null, null, null) => "",
            ({ } y, { } m, { } d) => $"/{y:D4}/{m:D2}/{d:D2}",
            ({ } y, { } m, null) => $"/{y:D4}/{m:D2}",
            ({ } y, null, _) => $"/{y:D4}",
            (null, _, _) => ""
        };

    /// <summary>
    /// prefixを生成する（NonCompaction用のオーバーロード）
    /// </summary>
    /// <param name="year">年（nullの場合は全年対象）</param>
    /// <param name="month">月（nullの場合は全月対象）</param>
    /// <param name="day">日（nullの場合は全日対象）</param>
    /// <returns>完全なS3パス</returns>
    public static string GetS3NonCompactionPrefix(int? year, int? month, int? day) =>
        $"{FolderPrefixNonCompaction}{GetYmdPrefix(year, month, day)}";

    private static string GetYmdhPrefix(int? year, int? month, int? day, int? hour) =>
        (year, month, day, hour) switch
        {
            (null, null, null, null) => "",
            ({ /* NOT NULL pattern */ } y, { } m, { } d, { } h) => $"/{y:D4}/{m:D2}/{d:D2}/{h:D2}",
            ({ } y, { } m, { } d, null) => $"/{y:D4}/{m:D2}/{d:D2}",
            ({ } y, { } m, null, _) => $"/{y:D4}/{m:D2}",
            ({ } y, null, _, _) => $"/{y:D4}",
            (null, _, _, _) => ""
        };

    /// <summary>
    /// prefixを生成する（Compaction用のオーバーロード）
    /// </summary>
    /// <param name="year">年（nullの場合は全年対象）</param>
    /// <param name="month">月（nullの場合は全月対象）</param>
    /// <param name="day">日（nullの場合は全日対象）</param>
    /// <param name="hour">時 (nullの場合は全時間対象)</param>
    /// <returns>完全なS3パス</returns>
    public static string GetS3CompactionPrefix(int? year, int? month, int? day, int? hour) =>
        $"{FolderPrefixCompaction}{GetYmdhPrefix(year, month, day, hour)}";

    public static (string runJsonPath, string lockPath) GetS3CompactionRunFile() =>
        ($"{FolderPrefixCompaction}/run.json", $"{FolderPrefixCompaction}/run.lock");
}
