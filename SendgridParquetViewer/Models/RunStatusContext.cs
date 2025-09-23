namespace SendgridParquetViewer.Models;

/// <summary>
/// RunStatus に対する操作をまとめたもの
/// </summary>
/// <param name="RunStatus"></param>
/// <param name="NotifyRunStatus">値が変更されるたびに呼び出す軽量なメソッド</param>
/// <param name="SaveRunStatusAsyncFunc">永続的に保存する重たいメソッド</param>
internal record RunStatusContext(RunStatus RunStatus, Action<RunStatus> NotifyRunStatus, Func<RunStatus, CancellationToken, Task> SaveRunStatusAsyncFunc)
{
    private readonly Lock _lock = new();
    internal async Task SaveRunStatusAsync(CancellationToken ct) => await SaveRunStatusAsyncFunc.Invoke(RunStatus, ct);

    /// <summary>
    /// 1日分のコンパクションを開始したことを記録する
    /// </summary>
    public void StartADay(DateOnly targetDate, int totalFiles, DateTimeOffset now)
    {
        RunStatus.CurrentDay = targetDate;
        RunStatus.CurrentDayTotalFiles = totalFiles;
        RunStatus.CurrentDayProcessedFiles = 0;
        RunStatus.CurrentDayProcessedBytes = 0;
        RunStatus.LastUpdated = now;

        NotifyRunStatus(RunStatus);
    }

    /// <summary>
    /// 1日分のコンパクションが完了したことを記録する
    /// </summary>
    internal void CompletedADay(DateTimeOffset now)
    {
        RunStatus.CompletedDays += 1;
        RunStatus.CurrentDay = null;
        RunStatus.CurrentDayTotalFiles = null;
        RunStatus.CurrentDayProcessedFiles = null;
        RunStatus.CurrentDayProcessedBytes = null;
        RunStatus.LastUpdated = now;

        NotifyRunStatus(RunStatus);
    }

    internal void IncrementCurrentDayProcessedFiles(string parquetFile, long byteLength, DateTimeOffset now)
    {
        lock (_lock)
        {
            RunStatus.LastProcessedFile = parquetFile;

            int prevFiles = RunStatus.CurrentDayProcessedFiles ?? 0;
            RunStatus.CurrentDayProcessedFiles = prevFiles + 1; // Increment

            long prevBytes = RunStatus.CurrentDayProcessedBytes ?? 0;
            RunStatus.CurrentDayProcessedBytes = prevBytes + byteLength;
            RunStatus.LastUpdated = now;
        }

        NotifyRunStatus(RunStatus);
    }

    public void IncrementCurrentDayFailedFiles(string parquetFile, DateTimeOffset now)
    {
        lock (_lock)
        {
            RunStatus.FailedOriginalFiles.Add(parquetFile);
            RunStatus.LastUpdated = now;
        }

        NotifyRunStatus(RunStatus);
    }

    public void IncrementDeletedOriginalFile(DateTimeOffset now)
    {
        lock (_lock)
        {
            int prevFiles = RunStatus.DeletedOriginalFile;
            RunStatus.DeletedOriginalFile = prevFiles + 1; // Increment
            RunStatus.LastUpdated = now;
        }

        NotifyRunStatus(RunStatus);
    }

    public void CompletedAllDays(DateTimeOffset now)
    {
        RunStatus.EndTime = now;

        NotifyRunStatus(RunStatus);
    }

    public void AddVerifiedOutputFile(string outputFile, DateTimeOffset now)
    {
        lock (_lock)
        {
            RunStatus.LastOutputFile = outputFile;

            int prevFiles = RunStatus.OutputFilesCreated;
            RunStatus.OutputFilesCreated = prevFiles + 1; // Increment
            RunStatus.LastUpdated = now;
        }

        NotifyRunStatus(RunStatus);
    }

    public void AddFailedOutputFile(string outputFile, DateTimeOffset now)
    {
        lock (_lock)
        {
            RunStatus.FailedOutputFiles.Add(outputFile);
            RunStatus.LastUpdated = now;
        }

        NotifyRunStatus(RunStatus);
    }
}
