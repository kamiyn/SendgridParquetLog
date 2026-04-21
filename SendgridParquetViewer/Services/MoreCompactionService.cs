using System.Runtime.CompilerServices;
using System.Text.Json;

using Parquet;

using SendgridParquet.Shared;

using SendgridParquetViewer.Models;

using ZLogger;

namespace SendgridParquetViewer.Services;

/// <summary>
/// 追加コンパクション (MoreCompaction) の実行サービス。
///
/// 通常の Compaction が途中で失敗すると v3compaction/yyyy/MM/dd/HH 直下に
/// 複数の parquet ファイルが残ることがあるため、指定した年月について
/// 1 時間フォルダ あたり 1 ファイルへ統合する。
/// 自動実行はせず 画面からの明示指示で 年月単位のスキャン / フォルダ単位の実行を行う。
/// </summary>
public class MoreCompactionService(
    ILogger<MoreCompactionService> logger,
    S3StorageService s3StorageService,
    ParquetService parquetService,
    TimeProvider timeProvider
)
{
    /// <summary>
    /// Compaction と同じ RowGroup サイズ。
    /// メモリ使用量を抑えるためストリーミングで書き込む。
    /// </summary>
    private const int RowGroupSize = 60_000;

    public sealed record HourFolder(
        int Year,
        int Month,
        int Day,
        int Hour,
        string Prefix,
        IReadOnlyList<S3ObjectEntry> ParquetFiles)
    {
        public long TotalBytes => ParquetFiles.Sum(f => f.Size);
    }

    public sealed record ScanResult(
        int Year,
        int Month,
        IReadOnlyList<HourFolder> AllHourFolders,
        IReadOnlyList<HourFolder> MultiFileFolders)
    {
        public int TotalHourFolders => AllHourFolders.Count;

        /// <summary>
        /// 逐次実行時に一時的に必要となる最大ディスク量。
        /// MoreCompaction は 1 フォルダずつ処理するため、最大サイズのフォルダ 1 つぶん。
        /// </summary>
        public long MaxTempBytesPerFolder =>
            MultiFileFolders.Count == 0 ? 0L : MultiFileFolders.Max(f => f.TotalBytes);
    }

    public sealed record DiskSpaceEstimate(
        string TempPath,
        long RequiredBytes,
        long AvailableFreeBytes,
        bool IsSufficient);

    public sealed record ScanProgress(
        int ProcessedDays,
        int TotalDays,
        int? CurrentDay,
        int MultiFileFoldersFound);

    /// <summary>
    /// 年月の完了マーカーを取得する。存在しない場合は null を返す。
    /// </summary>
    public async Task<MoreCompactionStatus?> GetStatusAsync(int year, int month, CancellationToken ct)
    {
        string key = SendGridPathUtility.GetS3MoreCompactionStatusKey(year, month);
        try
        {
            byte[] content = await s3StorageService.GetObjectAsByteArrayAsync(key, ct);
            if (content.Length == 0)
            {
                return null;
            }
            return JsonSerializer.Deserialize(content, AppJsonSerializerContext.Default.MoreCompactionStatus);
        }
        catch (Exception ex)
        {
            logger.ZLogWarning(ex, $"Unable to read more-compaction status from {key}");
            return null;
        }
    }

    /// <summary>
    /// 指定年月の v3compaction/yyyy/MM/dd/HH フォルダを全走査し、
    /// Parquet ファイルが 2 つ以上あるフォルダを洗い出す。
    /// </summary>
    public async Task<ScanResult> ScanAsync(int year, int month, CancellationToken ct, IProgress<ScanProgress>? progress = null)
    {
        var monthPrefix = SendGridPathUtility.GetS3CompactionPrefix(year, month, null, null);
        IEnumerable<string> dayDirs = await s3StorageService.ListDirectoriesAsync(monthPrefix, ct);

        int[] days = dayDirs.Select(d => int.TryParse(d, out int v) ? v : 0)
            .Where(v => v > 0)
            .OrderBy(v => v)
            .ToArray();

        var allFolders = new List<HourFolder>();
        var multi = new List<HourFolder>();

        progress?.Report(new ScanProgress(0, days.Length, null, 0));

        for (int i = 0; i < days.Length; i++)
        {
            int day = days[i];
            ct.ThrowIfCancellationRequested();
            progress?.Report(new ScanProgress(i, days.Length, day, multi.Count));

            var dayPrefix = SendGridPathUtility.GetS3CompactionPrefix(year, month, day, null);
            IEnumerable<string> hourDirs = await s3StorageService.ListDirectoriesAsync(dayPrefix, ct);

            foreach (int hour in hourDirs.Select(h => int.TryParse(h, out int v) ? v : -1)
                         .Where(v => v >= 0)
                         .OrderBy(v => v))
            {
                ct.ThrowIfCancellationRequested();
                var hourPrefix = SendGridPathUtility.GetS3CompactionPrefix(year, month, day, hour);
                IReadOnlyCollection<S3ObjectEntry> entries = await s3StorageService.ListFilesWithSizeAsync(hourPrefix, ct);
                var parquetFiles = entries
                    .Where(e => e.Key.EndsWith(SendGridPathUtility.ParquetFileExtension, StringComparison.OrdinalIgnoreCase))
                    .OrderBy(e => e.Key, StringComparer.Ordinal)
                    .ToArray();

                var folder = new HourFolder(year, month, day, hour, hourPrefix, parquetFiles);
                allFolders.Add(folder);
                if (parquetFiles.Length >= 2)
                {
                    multi.Add(folder);
                }
            }
        }

        progress?.Report(new ScanProgress(days.Length, days.Length, null, multi.Count));
        return new ScanResult(year, month, allFolders, multi);
    }

    /// <summary>
    /// 年月単位の完了マーカーを保存する。
    /// 全フォルダが 1 parquet のみの場合に呼ぶ。
    /// </summary>
    public async Task<MoreCompactionStatus> WriteStatusAsync(int year, int month, int verifiedHourFolders, CancellationToken ct)
    {
        var status = new MoreCompactionStatus
        {
            Year = year,
            Month = month,
            CompletedAt = timeProvider.GetUtcNow(),
            VerifiedHourFolders = verifiedHourFolders,
        };
        await using var ms = new MemoryStream();
        await JsonSerializer.SerializeAsync(ms, status, AppJsonSerializerContext.Default.MoreCompactionStatus, ct);
        ms.Seek(0, SeekOrigin.Begin);
        string key = SendGridPathUtility.GetS3MoreCompactionStatusKey(year, month);
        bool uploaded = await s3StorageService.PutObjectAsync(ms, key, ct);
        if (!uploaded)
        {
            logger.ZLogError($"Failed to write MoreCompaction status: {key}");
            throw new InvalidOperationException($"Failed to write MoreCompaction status to '{key}'.");
        }
        logger.ZLogInformation($"MoreCompaction status written: {key}");
        return status;
    }

    /// <summary>
    /// 一時フォルダの空き容量が 指定フォルダ処理時の想定最大ディスク消費量を満たすか見積もる。
    /// </summary>
    public static DiskSpaceEstimate EstimateDiskSpace(long requiredBytes)
    {
        string tempPath = Path.GetTempPath();
        long available = 0L;
        try
        {
            string driveRoot = Path.GetPathRoot(tempPath) ?? tempPath;
            var driveInfo = new DriveInfo(driveRoot);
            if (driveInfo.IsReady)
            {
                available = driveInfo.AvailableFreeSpace;
            }
        }
        catch
        {
            // DriveInfo 取得失敗時は available=0 とし、不足扱いで警告する
        }

        bool sufficient = available > 0 && available >= requiredBytes;
        return new DiskSpaceEstimate(tempPath, requiredBytes, available, sufficient);
    }

    /// <summary>
    /// 指定フォルダを 1 ファイルへ統合する。
    /// 手順:
    ///   1. 既存の morecompaction.parquet があれば削除 (前回アップロード中断への対処)
    ///   2. フォルダ内 Parquet をストリーミングで読みながら 一時ファイルに 1 つの Parquet を作成
    ///   3. 一時ファイルを S3 へアップロード
    ///   4. 検証成功後に 元ファイル (morecompaction.parquet 以外) を削除
    /// </summary>
    public async Task<MoreCompactionFolderResult> ExecuteFolderAsync(HourFolder folder, CancellationToken ct)
    {
        logger.ZLogInformation($"MoreCompaction start: {folder.Prefix} files={folder.ParquetFiles.Count} totalBytes={folder.TotalBytes}");

        string outputKey = SendGridPathUtility.GetS3MoreCompactionParquetKey(folder.Year, folder.Month, folder.Day, folder.Hour);

        IReadOnlyList<S3ObjectEntry> sources = folder.ParquetFiles;
        if (sources.Count <= 1)
        {
            logger.ZLogInformation($"MoreCompaction skip (already <=1 file): {folder.Prefix}");
            return new MoreCompactionFolderResult(folder, Skipped: true, TotalEvents: 0, DeletedFiles: 0);
        }

        // (1) 既存の morecompaction.parquet を削除。中断後の残骸を確実に消す。
        await s3StorageService.DeleteObjectAsync(outputKey, ct);

        IReadOnlyList<S3ObjectEntry> readTargets = sources
            .Where(e => !e.Key.EndsWith("/" + SendGridPathUtility.MoreCompactionFileName, StringComparison.Ordinal))
            .ToArray();

        if (readTargets.Count == 0)
        {
            logger.ZLogInformation($"MoreCompaction no readable sources after excluding {SendGridPathUtility.MoreCompactionFileName}: {folder.Prefix}");
            return new MoreCompactionFolderResult(folder, Skipped: true, TotalEvents: 0, DeletedFiles: 0);
        }

        // (2) ストリーミングで 1 つの Parquet を一時ファイルへ書き出す。
        long totalEvents = 0;
        await using FileStream outputStream = DisposableTempFile.Open(nameof(MoreCompactionService) + "-output");
        bool hasData = await parquetService.ConvertToParquetStreamingAsync(
            EnumerateSourceEventsAsync(readTargets, count => Interlocked.Add(ref totalEvents, count), ct),
            outputStream,
            rowGroupSize: RowGroupSize,
            token: ct);

        if (!hasData)
        {
            logger.ZLogWarning($"MoreCompaction produced no events: {folder.Prefix}");
            return new MoreCompactionFolderResult(folder, Skipped: true, TotalEvents: 0, DeletedFiles: 0);
        }

        // (3) S3 へアップロード。
        outputStream.Seek(0, SeekOrigin.Begin);
        bool uploaded = await s3StorageService.PutObjectAsync(outputStream, outputKey, ct);
        if (!uploaded)
        {
            throw new InvalidOperationException($"Failed to upload merged parquet: {outputKey}");
        }

        // アップロード後 Parquet として読めるか検証。
        await VerifyUploadedParquetAsync(outputKey, ct);

        // (4) 元ファイル (出力キー自身を除く) を削除。
        int deleted = 0;
        foreach (S3ObjectEntry src in readTargets)
        {
            ct.ThrowIfCancellationRequested();
            if (string.Equals(src.Key, outputKey, StringComparison.Ordinal))
            {
                continue;
            }
            if (await s3StorageService.DeleteObjectAsync(src.Key, ct))
            {
                deleted++;
            }
        }

        logger.ZLogInformation($"MoreCompaction done: {folder.Prefix} events={totalEvents} deleted={deleted}");
        return new MoreCompactionFolderResult(folder, Skipped: false, TotalEvents: totalEvents, DeletedFiles: deleted);
    }

    private async IAsyncEnumerable<SendGridEvent> EnumerateSourceEventsAsync(
        IReadOnlyList<S3ObjectEntry> sources,
        Action<long> addedCount,
        [EnumeratorCancellation] CancellationToken ct)
    {
        foreach (S3ObjectEntry entry in sources)
        {
            ct.ThrowIfCancellationRequested();
            logger.ZLogInformation($"MoreCompaction reading {entry.Key} ({entry.Size} bytes)");

            // Parquet 読み込みにはシーク可能なストリームが必要なため 一時ファイルに落としてから読む。
            await using FileStream tempStream = DisposableTempFile.Open(nameof(MoreCompactionService) + "-src");
            using (HttpResponseMessage response = await s3StorageService.GetObjectAsync(entry.Key, ct))
            {
                if (!response.IsSuccessStatusCode)
                {
                    logger.ZLogWarning($"MoreCompaction failed to download {entry.Key} status={response.StatusCode}");
                    throw new InvalidOperationException(
                        $"MoreCompaction cannot continue because source download failed for {entry.Key} status={response.StatusCode}");
                }
                await using Stream body = await response.Content.ReadAsStreamAsync(ct);
                await body.CopyToAsync(tempStream, DisposableTempFile.BufferSize, ct);
            }
            tempStream.Seek(0, SeekOrigin.Begin);

            using ParquetReader reader = await ParquetReader.CreateAsync(tempStream, cancellationToken: ct);
            for (int rg = 0; rg < reader.RowGroupCount; rg++)
            {
                ct.ThrowIfCancellationRequested();
                using ParquetRowGroupReader rowGroupReader = reader.OpenRowGroupReader(rg);
                long rowsInGroup = 0;
                await foreach (SendGridEvent ev in parquetService.ReadRowGroupEventsAsync(rowGroupReader, reader, ct))
                {
                    rowsInGroup++;
                    yield return ev;
                }
                addedCount(rowsInGroup);
            }
        }
    }

    private async Task VerifyUploadedParquetAsync(string key, CancellationToken ct)
    {
        using HttpResponseMessage response = await s3StorageService.GetObjectAsync(key, ct);
        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException($"Verification failed: cannot fetch uploaded parquet {key} status={response.StatusCode}");
        }

        await using Stream body = await response.Content.ReadAsStreamAsync(ct);
        await using FileStream verifyStream = DisposableTempFile.Open(nameof(MoreCompactionService) + "-verify");
        await body.CopyToAsync(verifyStream, DisposableTempFile.BufferSize, ct);
        verifyStream.Seek(0, SeekOrigin.Begin);
        using ParquetReader reader = await ParquetReader.CreateAsync(verifyStream, cancellationToken: ct);
        logger.ZLogInformation($"MoreCompaction verified: {key} rowGroups={reader.RowGroupCount}");
    }
}

public sealed record MoreCompactionFolderResult(
    MoreCompactionService.HourFolder Folder,
    bool Skipped,
    long TotalEvents,
    int DeletedFiles);
