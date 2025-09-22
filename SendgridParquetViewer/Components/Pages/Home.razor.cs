using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.Extensions.Options;
using Microsoft.JSInterop;
using SendgridParquet.Shared;
using SendgridParquetViewer.Configuration;
using SendgridParquetViewer.Models;

namespace SendgridParquetViewer.Components.Pages;

public partial class Home
{
    private IJSObjectReference? _duckDbInterop;
    private DotNetObjectReference<Home>? _dotNetRef;
    private ElementReference _resultsHost;
    private bool _isDownloading;
    private bool _isLoading;
    private bool _manifestLoaded;
    private string? _errorMessage;
    
    private int _currentYear;
    private int _currentMonth;
    private DateTime? CurrentMonthDate { get; set; }
    private int? _selectedDay;
    
    private HashSet<int> _downloadedDays = new();
    private HashSet<int> _availableDays = new();
    private DateTime?[][] _calendarWeeks = [];
    private ParquetMonthManifest? _monthManifest;
    private Dictionary<int, string[]> _dayFileUrls = new();
    
    private SendGridEventParquet[] _sendGridEvents = [];
    private bool _hasSearched;
    
    private string _selectedEmail = string.Empty;
    private string _selectedEventType = SendGridEventTypes.Delivered;
    private string _selectedSgTemplateId = string.Empty;
    
    private SendGridEventParquet? _selectedEvent;
    private bool ShowEventDetailsDialog => _selectedEvent != null;
    
    private static readonly TimeSpan DuckDbQueryTimeout = TimeSpan.FromMinutes(5);
    
    protected override void OnInitialized()
    {
    _dotNetRef = DotNetObjectReference.Create(this);
    var today = TimeProvider.GetLocalNow().DateTime;
    _currentYear = today.Year;
    _currentMonth = today.Month;
    CurrentMonthDate = new DateTime(today.Year, today.Month, 1);
    }
    
    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
    if (firstRender)
    {
    await EnsureDuckDbModuleAsync();
    await EnsureMonthDataAsync();
    }
    }
    
    private async Task EnsureDuckDbModuleAsync()
    {
    if (_duckDbInterop != null)
    {
    return;
    }
    
    try
    {
    var modulePath = BuildModuleImportPath();
    _duckDbInterop = await JsRuntime.InvokeAsync<IJSObjectReference>("import", modulePath);
    await _duckDbInterop.InvokeVoidAsync("initialize", DuckDbOptions.Value);
    }
    catch (Exception ex)
    {
    Logger.LogError(ex, "Failed to initialize duckdb interop module");
    _errorMessage = $"DuckDB 初期化に失敗しました: {ex.Message}";
    }
    }
    
    private async Task ChangeMonthAsync(int delta)
    {
    var target = new DateTime(_currentYear, _currentMonth, 1).AddMonths(delta);
    await SetMonthAsync(target.Year, target.Month);
    }
    
    private async Task OnMonthPickerAfterChanged()
    {
    if (!CurrentMonthDate.HasValue)
    {
    return;
    }
    
    var selected = CurrentMonthDate.Value;
    var target = new DateTime(selected.Year, selected.Month, 1);
    await SetMonthAsync(target.Year, target.Month);
    }
    
    private async Task SetMonthAsync(int year, int month)
    {
    if (year == _currentYear && month == _currentMonth)
    {
    return;
    }
    
    _currentYear = year;
    _currentMonth = month;
    CurrentMonthDate = new DateTime(year, month, 1);
    _selectedDay = null;
    _sendGridEvents = [];
    _hasSearched = false;
    _downloadedDays.Clear();
    _availableDays.Clear();
    _calendarWeeks = [];
    _errorMessage = null;
    _monthManifest = null;
    _dayFileUrls.Clear();
    await ClearRenderedResultsAsync();
    await EnsureMonthDataAsync();
    }
    
    private async Task EnsureMonthDataAsync()
    {
    _isDownloading = true;
    _errorMessage = null;
    StateHasChanged();
    
    try
    {
    var manifest = await BuildCompactionManifestAsync(_currentYear, _currentMonth, CancellationToken.None);
    _monthManifest = manifest;
    var dayManifests = manifest.Days;
    _availableDays = dayManifests.Select(d => d.Day).ToHashSet();
    _dayFileUrls = dayManifests.Count == 0
    ? new Dictionary<int, string[]>(0)
    : dayManifests.ToDictionary(
    d => d.Day,
    d => d.Files
    .Select(f => BuildCompactionDownloadUrl(_currentYear, _currentMonth, d.Day, f.Hour, Path.GetFileNameWithoutExtension(f.Key)))
    .Where(url => !string.IsNullOrEmpty(url))
    .ToArray());
    _downloadedDays.IntersectWith(_availableDays);
    RebuildCalendar();
    _manifestLoaded = true;
    }
    catch (Exception ex)
    {
    Logger.LogError(ex, "Failed to prepare month data");
    _errorMessage = $"月データの取得に失敗しました: {ex.Message}";
    _monthManifest = null;
    _availableDays.Clear();
    _dayFileUrls.Clear();
    _downloadedDays.Clear();
    _calendarWeeks = [];
    _manifestLoaded = false;
    }
    finally
    {
    _isDownloading = false;
    StateHasChanged();
    }
    }
    
    private async Task<ParquetMonthManifest> BuildCompactionManifestAsync(int year, int month, CancellationToken cancellationToken)
    {
    var prefix = SendGridPathUtility.GetS3CompactionPrefix(year, month, null, null);
    var keys = await S3StorageService.ListFilesAsync(prefix, cancellationToken);
    var entriesByDay = new Dictionary<int, List<ParquetFileManifest>>();
    
    foreach (string key in keys)
    {
    if (string.IsNullOrWhiteSpace(key))
    {
    continue;
    }
    
    if (!key.EndsWith(SendGridPathUtility.ParquetFileExtension, StringComparison.OrdinalIgnoreCase))
    {
    continue;
    }
    
    if (!TryParseCompactionKey(key, out int parsedYear, out int parsedMonth, out int parsedDay, out int parsedHour))
    {
    continue;
    }
    
    if (parsedYear != year || parsedMonth != month)
    {
    continue;
    }
    
    if (!entriesByDay.TryGetValue(parsedDay, out var entries))
    {
    entries = new List<ParquetFileManifest>();
    entriesByDay[parsedDay] = entries;
    }
    
    entries.Add(new ParquetFileManifest(
    Key: key,
    Day: parsedDay,
    Hour: parsedHour,
    SizeBytes: null,
    LastModified: null,
    Sha256Hash: null,
    ETag: null));
    }
    
    if (entriesByDay.Count == 0)
    {
    return new ParquetMonthManifest(year, month, Array.Empty<ParquetDayManifest>());
    }
    
    var dayManifests = entriesByDay
    .OrderBy(static pair => pair.Key)
    .Select(pair =>
    {
    var files = pair.Value
    .OrderBy(file => file.Hour)
    .ThenBy(file => file.Key, StringComparer.Ordinal)
    .ToArray();
    return new ParquetDayManifest(pair.Key, files);
    })
    .ToArray();
    
    return new ParquetMonthManifest(year, month, dayManifests);
    }
    
    private static string BuildCompactionDownloadUrl(int year, int month, int day, int hour, string? hash)
    {
    if (string.IsNullOrWhiteSpace(hash))
    {
    return string.Empty;
    }
    
    return $"/api/parquet/compaction/{year:D4}/{month:D2}/{day:D2}/{hour:D2}/{hash}{SendGridPathUtility.ParquetFileExtension}";
    }
    
    private static bool TryParseCompactionKey(string key, out int year, out int month, out int day, out int hour)
    {
    year = 0;
    month = 0;
    day = 0;
    hour = 0;
    
    if (string.IsNullOrWhiteSpace(key))
    {
    return false;
    }
    
    var segments = key.Split('/', StringSplitOptions.RemoveEmptyEntries);
    if (segments.Length < 6)
    {
    return false;
    }
    
    if (!string.Equals(segments[0], "v3compaction", StringComparison.Ordinal))
    {
    return false;
    }
    
    if (!TryParseInt(segments[1], 4, out year) ||
        !TryParseInt(segments[2], 2, out month) ||
        !TryParseInt(segments[3], 2, out day) ||
        !TryParseInt(segments[4], 2, out hour))
    {
    year = month = day = hour = 0;
    return false;
    }
    
    return true;
    }
    
    private static bool TryParseInt(string value, int expectedLength, out int result)
    {
    if (value.Length != expectedLength)
    {
    result = 0;
    return false;
    }
    
    return int.TryParse(value, NumberStyles.None, CultureInfo.InvariantCulture, out result);
    }
    
    private void RebuildCalendar()
    {
    var firstDay = new DateTime(_currentYear, _currentMonth, 1);
    int daysInMonth = DateTime.DaysInMonth(_currentYear, _currentMonth);
    const int maxWeeks = 6; // 1か月には最大6週間
    
    var weeks = new DateTime?[maxWeeks][];
    var currentWeek = new DateTime?[7];
    int weekCount = 0;
    int dayOfWeekIndex = 0;
    int offset = (int)firstDay.DayOfWeek;
    
    for (int i = 0; i < offset; i++)
    {
    currentWeek[dayOfWeekIndex++] = null;
    }
    
    for (int day = 1; day <= daysInMonth; day++)
    {
    currentWeek[dayOfWeekIndex++] = new DateTime(_currentYear, _currentMonth, day);
    if (dayOfWeekIndex == 7)
    {
    weeks[weekCount++] = currentWeek;
    currentWeek = new DateTime?[7];
    dayOfWeekIndex = 0;
    }
    }
    
    if (dayOfWeekIndex > 0)
    {
    for (int i = dayOfWeekIndex; i < 7; i++)
    {
    currentWeek[i] = null;
    }
    weeks[weekCount++] = currentWeek;
    }
    
    _calendarWeeks = weekCount == 0
    ? []
    : weeks[..weekCount].ToArray();
    _manifestLoaded = true;
    }
    
    private static string GetCalendarButtonClass(bool hasData, bool available, bool selected)
    {
    var statusClass = hasData ? "downloaded" : available ? "available" : "no-data";
    return selected ? $"calendar-button {statusClass} selected" : $"calendar-button {statusClass}";
    }
    
    private async Task OnDaySelectedAsync(int day)
    {
    if (!_availableDays.Contains(day) || _isLoading)
    {
    return;
    }
    
    _selectedDay = day;
    await LoadEventsAsync();
    }
    
    private async Task SearchAsync()
    {
    if (!_selectedDay.HasValue)
    {
    _errorMessage = "日付を選択してください。";
    return;
    }
    
    await LoadEventsAsync();
    }
    
    private async Task LoadEventsAsync()
    {
    if (_duckDbInterop is null || !_selectedDay.HasValue)
    {
    return;
    }
    
    _isLoading = true;
    _errorMessage = null;
    _sendGridEvents = [];
    StateHasChanged();
    
    try
    {
    var day = _selectedDay.Value;
    if (!_dayFileUrls.TryGetValue(day, out var fileUrls) || fileUrls.Length == 0)
    {
    await ClearRenderedResultsAsync();
    _sendGridEvents = Array.Empty<SendGridEventParquet>();
    _hasSearched = true;
    return;
    }
    
    var request = new
    {
    fileUrls,
    email = NormalizeFilterValue(_selectedEmail),
    eventType = NormalizeExactValue(_selectedEventType),
    sgTemplateId = NormalizeExactValue(_selectedSgTemplateId),
    limit = 1000,
    selectColumns = SendGridEventParquet.SelectColumns
    };
    
    using var timeoutCts = new CancellationTokenSource(DuckDbQueryTimeout);
    var options = _dotNetRef is null ? null : new { dotNetHelper = _dotNetRef };
    var result = await _duckDbInterop.InvokeAsync<JsonElement?>(
    "queryEvents",
    timeoutCts.Token,
    DuckDbOptions.Value,
    request,
    _resultsHost,
    options);
    _sendGridEvents = ConvertToSendGridEvents(result);
    _hasSearched = true;
    _downloadedDays.Add(day);
    }
    catch (TaskCanceledException tcx)
    {
    Logger.LogWarning(tcx, "DuckDB query timed out");
    _errorMessage = "検索がタイムアウトしました。条件を絞り込んで再試行してください。";
    await ClearRenderedResultsAsync();
    }
    catch (JSException jsEx)
    {
    Logger.LogError(jsEx, "Query via duckdb interop failed");
    _errorMessage = $"検索中にエラーが発生しました: {jsEx.Message}";
    await ClearRenderedResultsAsync();
    }
    catch (Exception ex)
    {
    Logger.LogError(ex, "Query failed");
    _errorMessage = $"検索中にエラーが発生しました: {ex.Message}";
    await ClearRenderedResultsAsync();
    }
    finally
    {
    _isLoading = false;
    StateHasChanged();
    }
    }
    
    private void OnInputChange()
    {
    _hasSearched = false;
    _errorMessage = null;
    }
    
    private void OnEventTypeChange()
    {
    OnInputChange();
    }
    
    private void CloseEventDetailsDialog()
    {
    _selectedEvent = null;
    StateHasChanged();
    }
    
    [JSInvokable]
    public Task ShowEventDetailsFromJs(int rowIndex)
    {
    if (rowIndex < 0 || rowIndex >= _sendGridEvents.Length)
    {
    return Task.CompletedTask;
    }
    
    var selected = _sendGridEvents[rowIndex];
    return InvokeAsync(() =>
    {
    _selectedEvent = selected;
    StateHasChanged();
    });
    }
    
    DateTimeOffset ToJst(long u) => JstExtension.JstUnixTimeSeconds(u);
    
    public async ValueTask DisposeAsync()
    {
    if (_duckDbInterop is not null)
    {
    try
    {
    await _duckDbInterop.InvokeVoidAsync("dispose");
    }
    catch (Exception ex)
    {
    Logger.LogWarning(ex, "Failed to dispose duckdb module");
    }
    
    try
    {
    await _duckDbInterop.DisposeAsync();
    }
    catch (Exception ex)
    {
    Logger.LogWarning(ex, "Failed to release duckdb interop reference");
    }
    }
    
    _dotNetRef?.Dispose();
    _dotNetRef = null;
    }
    
    private string BuildModuleImportPath()
    {
    var options = DuckDbOptions.Value;
    var moduleLoader = options.ModuleLoader.Trim();
    if (Uri.TryCreate(moduleLoader, UriKind.Absolute, out var absoluteLoader))
    {
    return absoluteLoader.ToString();
    }
    
    var basePath = options.BundleBasePath.Trim();
    if (Uri.TryCreate(basePath, UriKind.Absolute, out var absoluteBase))
    {
    var combined = new Uri(absoluteBase, moduleLoader);
    return combined.ToString();
    }
    
    basePath = basePath.TrimEnd('/');
    if (!basePath.StartsWith('/'))
    {
    basePath = $"/{basePath}";
    }
    
    moduleLoader = moduleLoader.TrimStart('/');
    return $"{basePath}/{moduleLoader}";
    }
}
