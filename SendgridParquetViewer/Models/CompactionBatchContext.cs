using System.Collections.Concurrent;

namespace SendgridParquetViewer.Models;

/// <summary>
/// RunStatusContext に対する通知
/// </summary>
internal class CompactionBatchContext(RunStatusContext runStatusContext, DateOnly targetDate, IReadOnlyCollection<string> candidateParquetFiles)
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

    public void AddProcessedFile(string parquetFile, int parquetDataLength, DateTimeOffset now)
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
}
