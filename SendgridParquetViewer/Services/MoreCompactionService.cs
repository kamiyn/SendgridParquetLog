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

        public long MaxFileBytes => ParquetFiles.Count == 0 ? 0L : ParquetFiles.Max(f => f.Size);

        /// <summary>
        /// ExecuteFolderAsync 実行中に一時フォルダで同時に存在しうるバイト数の安全側見積もり。
        /// 下記 3 つが同時に乗ることを想定:
        ///   (a) マージ出力 tempfile ≒ TotalBytes
        ///   (b) Verify 用に再ダウンロードした tempfile ≒ TotalBytes (output は解放前なので並存)
        ///   (c) ソース tempfile 1 本 ≒ MaxFileBytes (実装上は verify と並存しないが保守的に加算)
        /// </summary>
        public long EstimatedPeakTempBytes => TotalBytes * 2 + MaxFileBytes;
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
        /// MoreCompaction は 1 フォルダずつ処理するため、ピーク消費量が最大のフォルダ 1 つぶん。
        /// </summary>
        public long MaxTempBytesPerFolder =>
            MultiFileFolders.Count == 0 ? 0L : MultiFileFolders.Max(f => f.EstimatedPeakTempBytes);
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
        // キャンセルは呼び出し元に伝搬させる (不要な警告ログも出さない)。
        catch (OperationCanceledException) when (ct.IsCancellationRequested) { throw; }
        catch (Exception ex)
        {
            logger.ZLogWarning(ex, $"Unable to read more-compaction status from {key}");
            return null;
        }
    }

    /// <summary>
    /// 指定年月 (または 年月日) の v3compaction/yyyy/MM/dd/HH フォルダを走査し、
    /// Parquet ファイルが 2 つ以上あるフォルダを洗い出す。
    /// day が指定された場合はその 1 日だけが対象。
    ///
    /// 実装は prefix (月 or 日) 配下を 1 回の再帰 LIST で取得し、キー文字列から
    /// yyyy/MM/dd/HH を分解してグループ化する。ディレクトリ単位に LIST を
    /// 繰り返すよりも HTTP 往復回数が激減する。
    /// </summary>
    public async Task<ScanResult> ScanAsync(int year, int month, CancellationToken ct, IProgress<ScanProgress>? progress = null, int? day = null)
    {
        // 月モード: v3compaction/yyyy/MM  /  日モード: v3compaction/yyyy/MM/dd
        string prefix = SendGridPathUtility.GetS3CompactionPrefix(year, month, day, null);

        progress?.Report(new ScanProgress(0, 0, null, 0));

        IReadOnlyCollection<S3ObjectEntry> entries = await s3StorageService.ListParquetFilesWithSizeAsync(prefix, ct);
        ct.ThrowIfCancellationRequested();

        // (yyyy, MM, dd, HH) にグループ化。キー分解に失敗したもの (不正パスなど) はスキップ。
        // 拡張子フィルタは ListParquetFilesWithSizeAsync 側で担保される。
        var grouped = new Dictionary<(int Year, int Month, int Day, int Hour), List<S3ObjectEntry>>();
        foreach (S3ObjectEntry entry in entries)
        {
            if (!TryParseCompactionKey(entry.Key, out int y, out int m, out int d, out int h))
            {
                continue;
            }
            if (y != year || m != month || (day is { } dd && d != dd))
            {
                // prefix の想定から外れるキーは無視 (防御的)
                continue;
            }
            var groupKey = (y, m, d, h);
            if (!grouped.TryGetValue(groupKey, out var list))
            {
                list = new List<S3ObjectEntry>();
                grouped[groupKey] = list;
            }
            list.Add(entry);
        }

        var allFolders = new List<HourFolder>(grouped.Count);
        var multi = new List<HourFolder>();
        foreach (var groupKey in grouped.Keys.OrderBy(k => k.Day).ThenBy(k => k.Hour))
        {
            List<S3ObjectEntry> bucket = grouped[groupKey];
            S3ObjectEntry[] parquetFiles = bucket
                .OrderBy(e => e.Key, StringComparer.Ordinal)
                .ToArray();
            string hourPrefix = SendGridPathUtility.GetS3CompactionPrefix(groupKey.Year, groupKey.Month, groupKey.Day, groupKey.Hour);
            var folder = new HourFolder(groupKey.Year, groupKey.Month, groupKey.Day, groupKey.Hour, hourPrefix, parquetFiles);
            allFolders.Add(folder);
            if (parquetFiles.Length >= 2)
            {
                multi.Add(folder);
            }
        }

        int distinctDays = allFolders.Select(f => f.Day).Distinct().Count();
        progress?.Report(new ScanProgress(distinctDays, distinctDays, null, multi.Count));
        return new ScanResult(year, month, allFolders, multi);
    }

    /// <summary>
    /// `v3compaction/yyyy/MM/dd/HH/<name>` 形式の S3 キーを年月日時に分解する。
    /// 先頭 5 セグメント (prefix + yyyy + MM + dd + HH) をすべて int パースできた場合のみ true。
    /// </summary>
    private static bool TryParseCompactionKey(string key, out int year, out int month, out int day, out int hour)
    {
        year = month = day = hour = 0;
        string[] parts = key.Split('/');
        // 期待形式: ["v3compaction", "yyyy", "MM", "dd", "HH", "filename"] -> parts.Length >= 6
        if (parts.Length < 6)
        {
            return false;
        }
        return int.TryParse(parts[1], out year)
            && int.TryParse(parts[2], out month)
            && int.TryParse(parts[3], out day)
            && int.TryParse(parts[4], out hour);
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
    /// 指定フォルダを 1 ファイルへ統合する。出力名は folder-unique な
    /// morecompaction{yyyy}{MM}{dd}{HH}.parquet (<see cref="SendGridPathUtility.GetMoreCompactionFileName"/>)。
    /// 再実行で冪等になるよう、既存の出力キーがあれば検証のみ行う:
    ///   A. 出力キーが既に存在する (前回アップロード完了後に 元ソース削除の途中で中断したケース):
    ///      検証に成功したら 残ソースの削除だけを実施する。
    ///      (残ソースは欠けている可能性があるため再マージしない。再マージで outputKey を
    ///       消して サブセットで書き直すと データ損失になる。)
    ///   B. 出力キーが無い (初回または アップロード前に中断したケース):
    ///      1. フォルダ内 Parquet をストリーミングで読みながら 一時ファイルに 1 つの Parquet を作成
    ///      2. 一時ファイルを S3 へアップロード
    ///      3. 検証
    ///      4. 元ファイル削除
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

        bool existingOutputInScan = sources.Any(e => string.Equals(e.Key, outputKey, StringComparison.Ordinal));
        IReadOnlyList<S3ObjectEntry> leftoverSources = sources
            .Where(e => !string.Equals(e.Key, outputKey, StringComparison.Ordinal))
            .ToArray();

        // スキャンから実行までに別セッション等で outputKey が作られているかもしれないので、
        // 実行時点でも outputKey の存在を S3 に問い合わせ直して保守的に確認する。
        // (スキャン結果だけに依存すると TOCTOU で 完成済み merged を上書きし、
        // 元ソースが部分削除されているタイミングだと データ欠損 parquet で塗り替える恐れがある。)
        // AnyFileExistsAsync は prefix 末尾に '/' を補って ListObjectsV2 する実装で
        // 完全キーの存在確認には使えないため、HEAD で問い合わせる ObjectExistsAsync を使う。
        bool existingOutputLive = await s3StorageService.ObjectExistsAsync(outputKey, ct);
        bool existingOutputPresent = existingOutputInScan || existingOutputLive;

        // (A) 前回実行がアップロード成功後に元ソース削除の途中で中断したケース、または
        // スキャン後に別実行者がアップロードしたケース。
        // outputKey が読めることを確認した上で、残ソースの削除のみ行う。
        // ここで outputKey を削除 → 残ソースから再マージ、としてしまうと、
        // 元ソースが部分削除されている場合に完成済み merged データを失う恐れがある。
        // outputKey の検証で例外が出た場合はそのまま throw して 人手の確認を促す
        // (破損している outputKey を勝手に削除して 中身未知のソースから書き直すのは危険)。
        if (existingOutputPresent)
        {
            logger.ZLogInformation($"MoreCompaction existing output found; verify and cleanup only: {outputKey}");
            await VerifyUploadedParquetAsync(outputKey, ct);

            int cleaned = 0;
            foreach (S3ObjectEntry src in leftoverSources)
            {
                ct.ThrowIfCancellationRequested();
                if (!await s3StorageService.DeleteObjectAsync(src.Key, ct))
                {
                    throw new InvalidOperationException($"Failed to delete source after resumed cleanup: {src.Key}");
                }
                cleaned++;
            }
            logger.ZLogInformation($"MoreCompaction resumed cleanup: {folder.Prefix} deleted={cleaned}");
            return new MoreCompactionFolderResult(folder, Skipped: false, TotalEvents: 0, DeletedFiles: cleaned);
        }

        // (B) 通常ケース: outputKey が無いので マージして新規作成する。

        if (leftoverSources.Count == 0)
        {
            logger.ZLogInformation($"MoreCompaction no readable sources: {folder.Prefix}");
            return new MoreCompactionFolderResult(folder, Skipped: true, TotalEvents: 0, DeletedFiles: 0);
        }

        // (1) ストリーミングで 1 つの Parquet を一時ファイルへ書き出す。
        long totalEvents = 0;
        await using FileStream outputStream = DisposableTempFile.Open(nameof(MoreCompactionService) + "-output");
        bool hasData = await parquetService.ConvertToParquetStreamingAsync(
            EnumerateSourceEventsAsync(leftoverSources, count => Interlocked.Add(ref totalEvents, count), ct),
            outputStream,
            rowGroupSize: RowGroupSize,
            token: ct);

        if (!hasData)
        {
            logger.ZLogWarning($"MoreCompaction produced no events: {folder.Prefix}");
            return new MoreCompactionFolderResult(folder, Skipped: true, TotalEvents: 0, DeletedFiles: 0);
        }

        // (2) S3 へアップロード。PUT は atomic なので 既存が無い前提のこの分岐では上書き競合は起きない。
        outputStream.Seek(0, SeekOrigin.Begin);
        bool uploaded = await s3StorageService.PutObjectAsync(outputStream, outputKey, ct);
        if (!uploaded)
        {
            throw new InvalidOperationException($"Failed to upload merged parquet: {outputKey}");
        }

        // (3) アップロード後 Parquet として読めるか検証。
        await VerifyUploadedParquetAsync(outputKey, ct);

        // (4) 元ファイルを削除。outputKey は leftoverSources に含まれない (上で除外済み) ので 誤削除されない。
        // 1 件でも失敗すると フォルダ内に古いソースが残り「1 parquet 保証」が崩れるため、その時点で例外にする。
        int deleted = 0;
        foreach (S3ObjectEntry src in leftoverSources)
        {
            ct.ThrowIfCancellationRequested();
            if (!await s3StorageService.DeleteObjectAsync(src.Key, ct))
            {
                throw new InvalidOperationException($"Failed to delete source after merge: {src.Key}");
            }
            deleted++;
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
