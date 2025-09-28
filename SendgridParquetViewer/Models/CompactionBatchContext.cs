using System.Collections.Concurrent;

using ZLogger;

namespace SendgridParquetViewer.Models;

/// <summary>
/// RunStatusContext に対する通知
/// </summary>
internal class CompactionBatchContext(RunStatusContext runStatusContext, DateOnly targetDate, int batchCount, IReadOnlyCollection<string> candidateParquetFiles) : IDisposable
{
    public DateOnly TargetDate { get; } = targetDate;
    public IReadOnlyCollection<string> CandidateParquetFiles { get; } = candidateParquetFiles;

    /// <summary>
    /// 読み込み済みのファイル (バッチ単位)
    /// </summary>
    private readonly ConcurrentQueue<string> _processingFiles = new();

    private long _processedBytes;

    internal IReadOnlyCollection<string> GetProcessedFiles() => _processingFiles.ToArray();

    /// <summary>
    /// 読み込み済みのバイト数 (バッチ単位)
    /// </summary>
    internal long ProcessedBytes => _processedBytes;

    public void AddProcessedFile(string parquetFile, long parquetDataLength, DateTimeOffset now)
    {
        _processingFiles.Enqueue(parquetFile);
        Interlocked.Add(ref _processedBytes, parquetDataLength);
        runStatusContext.IncrementCurrentDayProcessedFiles(parquetFile, parquetDataLength, now);
    }

    /// <summary>
    /// 読み込み失敗したファイル
    /// </summary>
    private readonly ConcurrentQueue<string> _failedReadingParquetFiles = new();

    internal int FailedReadingParquetFilesCount => _failedReadingParquetFiles.Count;
    //internal IReadOnlyCollection<string> FailedReadingParquetFiles() => _failedReadingParquetFiles.ToArray();

    public void AddFailedReadingParquetFiles(string parquetFile, DateTimeOffset now)
    {
        _failedReadingParquetFiles.Enqueue(parquetFile);
        runStatusContext.IncrementCurrentDayFailedFiles(parquetFile, now);
    }

    /// <summary>
    /// オリジナルのストレージから削除済みのファイル
    /// </summary>
    private readonly ConcurrentQueue<string> _deletedOriginalFiles = new();

    public void AddDeletedOriginalFile(string originalFile, DateTimeOffset now)
    {
        _deletedOriginalFiles.Enqueue(originalFile);
        runStatusContext.IncrementDeletedOriginalFile(now);
    }

    public IReadOnlyCollection<string> GetDeletedOriginalFiles() => _deletedOriginalFiles.ToArray();

    public void AddVerifiedOutputFile(string outputFile, DateTimeOffset now)
    {
        // _verifiedOutputFile.Enqueue(outputFile) // バッチ単位での管理は不要
        runStatusContext.AddVerifiedOutputFile(outputFile, now);
    }

    private readonly ConcurrentQueue<string> _failedOutputFile = new();
    internal int FailedOutputFileCount => _failedOutputFile.Count;

    public void AddFailedOutputFile(string outputFile, DateTimeOffset now)
    {
        _failedOutputFile.Enqueue(outputFile);
        runStatusContext.AddFailedOutputFile(outputFile, now);
    }

    private string GetTempFolderForRawFiles() =>
        Path.Combine(Path.GetTempPath(), $"raw{TargetDate:yyyyMMdd}_{batchCount}");

    /// <summary>
    /// 空になった対象状態の一時フォルダを作成する バッチごとに異なるフォルダ
    /// </summary>
    internal DirectoryInfo CreateTempFolderForRawFiles(ILogger logger)
    {
        CleanUpDailyTargetFolder(this, logger);
        string dailyTargetFolder = GetTempFolderForRawFiles();
        Directory.CreateDirectory(dailyTargetFolder);
        logger.ZLogInformation($"Created temporary folder: {dailyTargetFolder}");
        return new DirectoryInfo(dailyTargetFolder);
    }

    private static void CleanUpDailyTargetFolder(CompactionBatchContext ctx, ILogger? logger)
    {
        string dailyTargetFolder = ctx.GetTempFolderForRawFiles();
        if (Directory.Exists(dailyTargetFolder))
        {
            string tempFolder = Path.Combine(Path.GetTempPath(), $"compaction_temp_{Guid.NewGuid():N}");
            try
            {
                // Move してから削除する
                Directory.Move(dailyTargetFolder, tempFolder);
                Directory.Delete(tempFolder, recursive: true);
                logger?.ZLogInformation($"Cleared temporary folder: {dailyTargetFolder}");
            }
            catch (Exception ex)
            {
                logger?.ZLogError(ex, $"Failed to clear temporary folder: {dailyTargetFolder}, {tempFolder}");
            }
        }
    }

    public void Dispose()
    {
        CleanUpDailyTargetFolder(this, null);
    }
}
