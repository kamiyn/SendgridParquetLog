using System.Runtime.CompilerServices;
using System.Text.Json;

using Parquet;
using Parquet.Data;
using Parquet.Schema;

using SendgridParquet.Shared;

using SendgridParquetViewer.Models;

namespace SendgridParquetViewer.Services;

public class CompactionService(
    ILogger<CompactionService> logger,
    TimeProvider timeProvider,
    S3StorageService s3StorageService
)
{
    private static readonly JsonSerializerOptions JsonOptions = new() { WriteIndented = true };
    private static readonly TimeSpan LockDuration = TimeSpan.FromMinutes(30);
    private static readonly TimeSpan MaxRunningDuration = TimeSpan.FromDays(3);
    private static readonly string InstanceId = $"{Environment.MachineName}_{Guid.NewGuid():N}";

    public async Task<RunStatus?> GetRunStatusAsync(CancellationToken cancellationToken = default)
    {
        var now = timeProvider.GetUtcNow();
        var (runJsonPath, _) = SendGridPathUtility.GetS3CompactionRunFile();
        try
        {
            var jsonContent = await s3StorageService.GetObjectAsByteArrayAsync(runJsonPath, now, cancellationToken);
            if (!jsonContent.Any())
            {
                return null;
            }

            return JsonSerializer.Deserialize<RunStatus>(jsonContent);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Unable to read run status from {RunJsonPath}", runJsonPath);
            return null;
        }
    }

    public async Task<CompactionStartResult> StartCompactionAsync(CancellationToken cancellationToken = default)
    {
        var now = timeProvider.GetUtcNow();
        var lockId = Guid.NewGuid().ToString();

        var lockAcquired = await TryAcquireLockAsync(lockId, cancellationToken);
        if (!lockAcquired)
        {
            return new CompactionStartResult
            {
                CanStart = false,
                Reason = "Unable to acquire distributed lock for compaction process"
            };
        }

        try
        {
            RunStatus? currentStatus = await GetRunStatusAsync(cancellationToken);
            if (currentStatus is { EndTime: null })
            {
                var daysSinceStart = (now - currentStatus.StartTime);
                if (daysSinceStart <= MaxRunningDuration)
                {
                    return new CompactionStartResult
                    {
                        CanStart = false,
                        Reason = $"Compaction is already running (started {currentStatus.StartTime:s})"
                    };
                }
            }

            var yesterday = now.AddDays(-1);
            var olderThan = new DateOnly(yesterday.Year, yesterday.Month, yesterday.Day);
            var targetDays = await GetCompactionTargetAsync(olderThan, cancellationToken);
            var runStatusNew = new RunStatus
            {
                LockId = lockId,
                StartTime = now,
                EndTime = null,
                TargetDays = targetDays.Select(x => x.dateOnly).ToArray(),
                TargetPathPrefixes = targetDays.Select(x => x.pathPrefix).ToArray(),
            };

            // Save initial status
            await SaveRunStatusAsync(runStatusNew, cancellationToken);

            // Start background processing
            var ctsForExecuteCompactionAsync = new CancellationTokenSource();
            _ = Task.Run(() => ExecuteCompactionAsync(runStatusNew, ctsForExecuteCompactionAsync.Token), ctsForExecuteCompactionAsync.Token);

            return new CompactionStartResult
            {
                CanStart = true,
                StartTime = now,
                Reason = "Compaction started successfully"
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error during compaction start");
            await ReleaseLockAsync(lockId, cancellationToken);
            throw;
        }
    }

    /// <summary>
    /// Compaction対象の日付とパスの一覧を取得する
    /// </summary>
    /// <param name="olderThan">この時刻よりも前の日付のみを対象とする</param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    private async Task<IList<(DateOnly dateOnly, string pathPrefix)>> GetCompactionTargetAsync(DateOnly olderThan,
        CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow();
        var targetDays = new List<(DateOnly dateOnly, string pathPrefix)>();
        try
        {
            var yearDir = await s3StorageService.ListDirectoriesAsync(
                SendGridPathUtility.GetS3NonCompactionPrefix(null, null, null), now, cancellationToken);

            foreach (int year in yearDir.Select(d => int.TryParse(d, out int v) ? v : 0).Where(year => year > 0))
            {
                var yearPath = SendGridPathUtility.GetS3NonCompactionPrefix(year, null, null);
                var monthDirs = await s3StorageService.ListDirectoriesAsync(yearPath, now, cancellationToken);

                foreach (var month in monthDirs.Select(d => int.TryParse(d, out int v) ? v : 0).Where(month => month > 0))
                {
                    var monthPath = SendGridPathUtility.GetS3NonCompactionPrefix(year, month, null);
                    var dayDirs = await s3StorageService.ListDirectoriesAsync(monthPath, now, cancellationToken);

                    foreach (var day in dayDirs.Select(d => int.TryParse(d, out int v) ? v : 0).Where(day => day > 0))
                    {
                        var dayPath = SendGridPathUtility.GetS3NonCompactionPrefix(year, month, day);
                        DateOnly dateOnly = new(year, month, day);
                        if (dateOnly < olderThan)
                        {
                            targetDays.Add((dateOnly, dayPath));
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving target dates for compaction");
        }

        return targetDays;
    }

    private async Task SaveRunStatusAsync(RunStatus status, CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow();
        var (runJsonPath, _) = SendGridPathUtility.GetS3CompactionRunFile();
        await using var ms = new MemoryStream();
        await JsonSerializer.SerializeAsync(ms, status, JsonOptions, cancellationToken);
        await s3StorageService.PutObjectAsync(ms, runJsonPath, now, cancellationToken);
    }

    private async Task<bool> TryAcquireLockAsync(string lockId, CancellationToken cancellationToken)
    {
        var (_, lockPath) = SendGridPathUtility.GetS3CompactionRunFile();
        var now = timeProvider.GetUtcNow();

        // Try to get existing lock
        var existingLockJson = await s3StorageService.GetObjectAsByteArrayAsync(lockPath, now, cancellationToken);

        if (existingLockJson.Any())
        {
            var existingLock = JsonSerializer.Deserialize<LockInfo>(existingLockJson);
            if (existingLock != null && existingLock.ExpiresAt > now)
            {
                logger.LogInformation("Lock is held by {OwnerId} until {ExpiresAt}",
                    existingLock.OwnerId, existingLock.ExpiresAt);
                return false;
            }
        }

        // Create new lock
        var lockInfo = new LockInfo
        {
            LockId = lockId,
            OwnerId = InstanceId,
            AcquiredAt = now,
            ExpiresAt = now.Add(LockDuration),
            HostName = Environment.MachineName
        };

        var lockJson = JsonSerializer.SerializeToUtf8Bytes(lockInfo, JsonOptions);

        // Use conditional put with ETag to ensure atomic operation
        var success = await s3StorageService.PutObjectWithConditionAsync(
            lockPath, lockJson, existingLockJson, now, cancellationToken);

        if (success)
        {
            logger.LogInformation("Lock acquired successfully. Lock ID: {LockId}, Expires at: {ExpiresAt}",
                lockId, lockInfo.ExpiresAt);
        }

        return success;
    }

    private async Task ReleaseLockAsync(string lockId, CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow();
        var (_, lockPath) = SendGridPathUtility.GetS3CompactionRunFile();
        var existingLockJson = await s3StorageService.GetObjectAsByteArrayAsync(lockPath, now, cancellationToken);

        if (existingLockJson.Any())
        {
            var existingLock = JsonSerializer.Deserialize<LockInfo>(existingLockJson);
            if (existingLock?.LockId == lockId)
            {
                await s3StorageService.DeleteObjectAsync(lockPath, now, cancellationToken);
                logger.LogInformation("Lock released successfully. Lock ID: {LockId}", lockId);
            }
        }
    }

    private async Task ExecuteCompactionAsync(RunStatus runStatus, CancellationToken token)
    {
        logger.LogInformation("Compaction process started at {StartTime} with {TargetDaysCount} target dates",
            runStatus.StartTime, runStatus.TargetDays.Count);

        try
        {
            foreach ((DateOnly dateOnly, string pathPrefix) in runStatus.TargetDays.Zip(runStatus.TargetPathPrefixes))
            {
                logger.LogInformation("Starting compaction for date {Date} at path {Path}", dateOnly, pathPrefix);
                try
                {
                    await ExecuteCompactionOneDayAsync(dateOnly, pathPrefix, token);
                    logger.LogInformation("Completed compaction for date {Date} at path {Path}", dateOnly, pathPrefix);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error during compaction for date {Date} at path {Path}", dateOnly, pathPrefix);
                    // Continue with other dates
                }
            }
        }
        finally
        {
            await ReleaseLockAsync(runStatus.LockId, CancellationToken.None);
        }

        runStatus.EndTime = timeProvider.GetUtcNow();
        await SaveRunStatusAsync(runStatus, CancellationToken.None);
        logger.LogInformation("Compaction process completed at {EndTime}", runStatus.EndTime);
    }

    private async Task ExecuteCompactionOneDayAsync(DateOnly targetDate, string pathPrefix, CancellationToken token)
    {
        logger.LogInformation("Starting compaction for {DateOnly} at path {PathPrefix}", targetDate, pathPrefix);

        var now = timeProvider.GetUtcNow();
        var allObjects = await s3StorageService.ListFilesAsync(pathPrefix, now, token);
        var targetParquetFiles = allObjects
            .Where(key => key.EndsWith(SendGridPathUtility.ParquetFileExtension, StringComparison.OrdinalIgnoreCase))
            .ToArray();

        if (!targetParquetFiles.Any())
        {
            logger.LogInformation("No parquet files found at {PathPrefix}", pathPrefix);
            return;
        }

        logger.LogInformation("Found {Count} parquet files to compact", targetParquetFiles.Count());

        // Read all events from parquet files
        var allEvents = new List<SendGridEvent>();
        foreach (string parquetFile in targetParquetFiles)
        {
            try
            {
                logger.LogInformation("Reading Parquet file: {ParquetFile}", parquetFile);
                byte[] parquetData = await s3StorageService.GetObjectAsByteArrayAsync(parquetFile, now, token);
                if (parquetData.Any())
                {
                    await using var ms = new MemoryStream(parquetData);
                    using ParquetReader parquetReader = await ParquetReader.CreateAsync(ms, cancellationToken: token);
                    for (int rowGroupIndex = 0; rowGroupIndex < parquetReader.RowGroupCount; rowGroupIndex++)
                    {
                        using ParquetRowGroupReader rowGroupReader = parquetReader.OpenRowGroupReader(rowGroupIndex);
                        await foreach (SendGridEvent e in ReadRowGroupEventsAsync(rowGroupReader, parquetReader, token))
                        {
                            allEvents.Add(e);
                        }
                    }
                    //validFiles.Add(parquetFile); // valid でなくても 書き込み完了後にファイルを削除する
                    logger.LogInformation("Successfully read {EventCount} events from {ParquetFile}", allEvents.Count, parquetFile);
                }
                else
                {
                    logger.LogWarning("Empty parquet file: {ParquetFile}", parquetFile);
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to read parquet file: {ParquetFile}", parquetFile);
                // 読めなくても処理を続け 無効なファイルとして後で削除する
            }
        }

        logger.LogInformation("Total events loaded: {TotalEvents}", allEvents.Count);

        var outputFiles = new List<string>(24);

        // Create compacted parquet file for each hour that has data
        foreach (var hourGroup in allEvents
                     .GroupBy(e => JstExtension.JstUnixTimeSeconds(e.Timestamp).Hour))
        {
            int hour = hourGroup.Key;
            var hourEvents = hourGroup.ToArray(); // GroupBy の結果なので必ず1件以上ある
            try
            {
                logger.LogInformation("Creating compacted file for hour {Hour} with {EventCount} events", hour, hourEvents.Count());

                await using Stream? outputStream = await CreateCompactedParquetAsync(hourEvents);
                if (outputStream == null)
                {
                    logger.LogWarning("Failed to create parquet data for hour {Hour}", hour);
                    continue;
                }

                string outputFileName = SendGridPathUtility.GetParquetCompactionFileName(targetDate, hour, outputStream);
                outputStream.Seek(0, SeekOrigin.Begin);
                await s3StorageService.PutObjectAsync(outputStream, outputFileName, now, token);
                outputFiles.Add(outputFileName);

                logger.LogInformation("Created compacted file: {OutputFileName} for hour {Hour}", outputFileName, hour);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to create compacted file for hour {Hour}", hour);
                throw;
            }
        }

        // Verify all output files are readable as parquet
        foreach (string outputFile in outputFiles)
        {
            try
            {
                byte[] verifyData = await s3StorageService.GetObjectAsByteArrayAsync(outputFile, now, token);
                using var verifyMs = new MemoryStream(verifyData);
                using ParquetReader verifyReader = await ParquetReader.CreateAsync(verifyMs, cancellationToken: token);
                logger.LogInformation("Verified compacted file: {OutputFile} (RowGroups: {RowGroupCount})",
                    outputFile, verifyReader.RowGroupCount);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to verify compacted file: {OutputFile}", outputFile);
                throw;
            }
        }

        // Delete original files after successful verification
        foreach (string originalFile in targetParquetFiles)
        {
            await s3StorageService.DeleteObjectAsync(originalFile, now, token);
        }

        logger.LogInformation("Completed compaction for {DateOnly}: created {OutputCount} files, processed {TotalEvents} events",
            targetDate, outputFiles.Count, allEvents.Count);
    }

    private async IAsyncEnumerable<SendGridEvent> ReadRowGroupEventsAsync(ParquetRowGroupReader rowGroupReader,
        ParquetReader parquetReader,
        [EnumeratorCancellation] CancellationToken token)
    {
        ParquetSchema schema = parquetReader.Schema;
        // Read all columns from the row group
        var emailColumn = await rowGroupReader.ReadColumnAsync(schema.GetDataFields().First(f => f.Name == SendGridWebHookFields.Email), token);
        var timestampColumn = await rowGroupReader.ReadColumnAsync(schema.GetDataFields().First(f => f.Name == SendGridWebHookFields.Timestamp), token);
        var eventColumn = await rowGroupReader.ReadColumnAsync(schema.GetDataFields().First(f => f.Name == SendGridWebHookFields.Event), token);

        // Get optional columns
        var categoryColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.Category);
        var sgEventIdColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.SgEventId);
        var sgMessageIdColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.SgMessageId);
        var sgTemplateIdColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.SgTemplateId);
        var smtpIdColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.SmtpIdParquetColumn);
        var userAgentColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.UserAgent);
        var ipColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.Ip);
        var urlColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.Url);
        var reasonColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.Reason);
        var statusColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.Status);
        var responseColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.Response);
        var tlsColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.Tls);
        var attemptColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.Attempt);
        var typeColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.Type);
        var bounceClassificationColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.BounceClassification);
        var asmGroupIdColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.AsmGroupId);
        var uniqueArgsColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.UniqueArgs);
        var marketingCampaignIdColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.MarketingCampaignId);
        var marketingCampaignNameColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.MarketingCampaignName);
        var poolNameColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.PoolNameParquetColumn);
        var poolIdColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.PoolIdParquetColumn);
        var sendAtColumn = await TryReadColumnAsync(rowGroupReader, schema, SendGridWebHookFields.SendAt);

        int rowCount = emailColumn.Data.Length;
        for (int idx = 0; idx < rowCount; idx++)
        {
            yield return new SendGridEvent
            {
                Email = emailColumn.Data.GetValue(idx)?.ToString() ?? string.Empty,
                Timestamp = ConvertToNullableLong(timestampColumn.Data.GetValue(idx)) ?? 0,
                Event = eventColumn.Data.GetValue(idx)?.ToString() ?? string.Empty,
                Category = categoryColumn?.Data.GetValue(idx)?.ToString(),
                SgEventId = sgEventIdColumn?.Data.GetValue(idx)?.ToString(),
                SgMessageId = sgMessageIdColumn?.Data.GetValue(idx)?.ToString(),
                SgTemplateId = sgTemplateIdColumn?.Data.GetValue(idx)?.ToString(),
                SmtpId = smtpIdColumn?.Data.GetValue(idx)?.ToString(),
                UserAgent = userAgentColumn?.Data.GetValue(idx)?.ToString(),
                Ip = ipColumn?.Data.GetValue(idx)?.ToString(),
                Url = urlColumn?.Data.GetValue(idx)?.ToString(),
                Reason = reasonColumn?.Data.GetValue(idx)?.ToString(),
                Status = statusColumn?.Data.GetValue(idx)?.ToString(),
                Response = responseColumn?.Data.GetValue(idx)?.ToString(),
                Tls = ConvertToNullableInt(tlsColumn?.Data.GetValue(idx)),
                Attempt = attemptColumn?.Data.GetValue(idx)?.ToString(),
                Type = typeColumn?.Data.GetValue(idx)?.ToString(),
                BounceClassification = bounceClassificationColumn?.Data.GetValue(idx)?.ToString(),
                AsmGroupId = ConvertToNullableInt(asmGroupIdColumn?.Data.GetValue(idx)),
                UniqueArgs = uniqueArgsColumn?.Data.GetValue(idx)?.ToString(),
                MarketingCampaignId = ConvertToNullableInt(marketingCampaignIdColumn?.Data.GetValue(idx)),
                MarketingCampaignName = marketingCampaignNameColumn?.Data.GetValue(idx)?.ToString(),
                PoolName = poolNameColumn?.Data.GetValue(idx)?.ToString(),
                PoolId = ConvertToNullableInt(poolIdColumn?.Data.GetValue(idx)),
                SendAt = ConvertToNullableLong(sendAtColumn?.Data.GetValue(idx))
            };
        }
    }

    private async Task<DataColumn?> TryReadColumnAsync(ParquetRowGroupReader rowGroupReader, ParquetSchema schema, string fieldName)
    {
        try
        {
            DataField? field = schema.GetDataFields().FirstOrDefault(f => f.Name == fieldName);
            return field == null ? null : await rowGroupReader.ReadColumnAsync(field);
        }
        catch
        {
            return null;
        }
    }

    private static int? ConvertToNullableInt(object? value) =>
        value switch
        {
            int i => i,
            long l => (int)l,
            _ => null
        };

    private static long? ConvertToNullableLong(object? value) =>
        value switch
        {
            int i => i,
            long l => (int)l,
            _ => null
        };

    // Paired field definition and processing function for Viewer SendGridEvent model
    private record FieldProcessor(DataField Field, Func<IEnumerable<SendGridEvent>, DataColumn> ProcessorFunc);

    private static readonly FieldProcessor[] FieldProcessors = CreateFieldProcessors();

    private static FieldProcessor[] CreateFieldProcessors()
    {
        var emailField = new DataField(SendGridWebHookFields.Email, typeof(string));
        var timestampField = new DataField(SendGridWebHookFields.Timestamp, typeof(long));
        var eventField = new DataField(SendGridWebHookFields.Event, typeof(string));
        var categoryField = new DataField(SendGridWebHookFields.Category, typeof(string));
        var sgEventIdField = new DataField(SendGridWebHookFields.SgEventId, typeof(string));
        var sgMessageIdField = new DataField(SendGridWebHookFields.SgMessageId, typeof(string));
        var sgTemplateIdField = new DataField(SendGridWebHookFields.SgTemplateId, typeof(string));
        var smtpIdField = new DataField(SendGridWebHookFields.SmtpIdParquetColumn, typeof(string));
        var userAgentField = new DataField(SendGridWebHookFields.UserAgent, typeof(string));
        var ipField = new DataField(SendGridWebHookFields.Ip, typeof(string));
        var urlField = new DataField(SendGridWebHookFields.Url, typeof(string));
        var reasonField = new DataField(SendGridWebHookFields.Reason, typeof(string));
        var statusField = new DataField(SendGridWebHookFields.Status, typeof(string));
        var responseField = new DataField(SendGridWebHookFields.Response, typeof(string));
        var tlsField = new DataField(SendGridWebHookFields.Tls, typeof(int?));
        var attemptField = new DataField(SendGridWebHookFields.Attempt, typeof(string));
        var typeField = new DataField(SendGridWebHookFields.Type, typeof(string));
        var bounceClassificationField = new DataField(SendGridWebHookFields.BounceClassification, typeof(string));
        var asmGroupIdField = new DataField(SendGridWebHookFields.AsmGroupId, typeof(int?));
        var uniqueArgsField = new DataField(SendGridWebHookFields.UniqueArgs, typeof(string));
        var marketingCampaignIdField = new DataField(SendGridWebHookFields.MarketingCampaignId, typeof(int?));
        var marketingCampaignNameField = new DataField(SendGridWebHookFields.MarketingCampaignName, typeof(string));
        var poolNameField = new DataField(SendGridWebHookFields.PoolNameParquetColumn, typeof(string));
        var poolIdField = new DataField(SendGridWebHookFields.PoolIdParquetColumn, typeof(int?));
        var sendAtField = new DataField(SendGridWebHookFields.SendAt, typeof(long?));

        return
        [
            new FieldProcessor(emailField,
                events => new DataColumn(emailField,
                    events.Select(e => e.Email ?? string.Empty).ToArray())),

            new FieldProcessor(timestampField,
                events => new DataColumn(timestampField,
                    events.Select(e => e.Timestamp).ToArray())),

            new FieldProcessor(eventField,
                events => new DataColumn(eventField,
                    events.Select(e => e.Event ?? string.Empty).ToArray())),

            new FieldProcessor(categoryField,
                events => new DataColumn(categoryField,
                    events.Select(e => e.Category ?? string.Empty).ToArray())),

            new FieldProcessor(sgEventIdField,
                events => new DataColumn(sgEventIdField,
                    events.Select(e => e.SgEventId ?? string.Empty).ToArray())),

            new FieldProcessor(sgMessageIdField,
                events => new DataColumn(sgMessageIdField,
                    events.Select(e => e.SgMessageId ?? string.Empty).ToArray())),

            new FieldProcessor(sgTemplateIdField,
                events => new DataColumn(sgTemplateIdField,
                    events.Select(e => e.SgTemplateId ?? string.Empty).ToArray())),

            new FieldProcessor(smtpIdField,
                events => new DataColumn(smtpIdField,
                    events.Select(e => e.SmtpId ?? string.Empty).ToArray())),

            new FieldProcessor(userAgentField,
                events => new DataColumn(userAgentField,
                    events.Select(e => e.UserAgent ?? string.Empty).ToArray())),

            new FieldProcessor(ipField,
                events => new DataColumn(ipField,
                    events.Select(e => e.Ip ?? string.Empty).ToArray())),

            new FieldProcessor(urlField,
                events => new DataColumn(urlField,
                    events.Select(e => e.Url ?? string.Empty).ToArray())),

            new FieldProcessor(reasonField,
                events => new DataColumn(reasonField,
                    events.Select(e => e.Reason ?? string.Empty).ToArray())),

            new FieldProcessor(statusField,
                events => new DataColumn(statusField,
                    events.Select(e => e.Status ?? string.Empty).ToArray())),

            new FieldProcessor(responseField,
                events => new DataColumn(responseField,
                    events.Select(e => e.Response ?? string.Empty).ToArray())),

            new FieldProcessor(tlsField,
                events => new DataColumn(tlsField,
                    events.Select(e => e.Tls).ToArray())),

            new FieldProcessor(attemptField,
                events => new DataColumn(attemptField,
                    events.Select(e => e.Attempt ?? string.Empty).ToArray())),

            new FieldProcessor(typeField,
                events => new DataColumn(typeField,
                    events.Select(e => e.Type ?? string.Empty).ToArray())),

            new FieldProcessor(bounceClassificationField,
                events => new DataColumn(bounceClassificationField,
                    events.Select(e => e.BounceClassification ?? string.Empty).ToArray())),

            new FieldProcessor(asmGroupIdField,
                events => new DataColumn(asmGroupIdField,
                    events.Select(e => e.AsmGroupId).ToArray())),

            new FieldProcessor(uniqueArgsField,
                events => new DataColumn(uniqueArgsField,
                    events.Select(e => e.UniqueArgs ?? string.Empty).ToArray())),

            new FieldProcessor(marketingCampaignIdField,
                events => new DataColumn(marketingCampaignIdField,
                    events.Select(e => e.MarketingCampaignId).ToArray())),

            new FieldProcessor(marketingCampaignNameField,
                events => new DataColumn(marketingCampaignNameField,
                    events.Select(e => e.MarketingCampaignName ?? string.Empty).ToArray())),

            new FieldProcessor(poolNameField,
                events => new DataColumn(poolNameField,
                    events.Select(e => e.PoolName ?? string.Empty).ToArray())),

            new FieldProcessor(poolIdField,
                events => new DataColumn(poolIdField,
                    events.Select(e => e.PoolId).ToArray())),

            new FieldProcessor(sendAtField,
                events => new DataColumn(sendAtField,
                    events.Select(e => e.SendAt).ToArray()))
        ];
    }

    private async Task<Stream?> CreateCompactedParquetAsync(ICollection<SendGridEvent> events)
    {
        if (!events.Any())
        {
            return null;
        }
        var stream = new MemoryStream();
        // Extract fields from FieldProcessors
        Field[] fields = FieldProcessors.Select(fp => fp.Field).ToArray<Field>();
        await using var writer = await ParquetWriter.CreateAsync(new ParquetSchema(fields), stream);
        using var groupWriter = writer.CreateRowGroup();
        foreach (var processor in FieldProcessors)
        {
            var dataColumn = processor.ProcessorFunc(events);
            await groupWriter.WriteColumnAsync(dataColumn);
        }
        return stream;
    }
}
