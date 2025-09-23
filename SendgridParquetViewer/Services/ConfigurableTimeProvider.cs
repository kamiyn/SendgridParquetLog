namespace SendgridParquetViewer.Services;

using Microsoft.Extensions.Options;
public class TimeProviderOptions
{
    public TimeSpan Offset { get; set; } = TimeSpan.Zero;
}

public class ConfigurableTimeProvider : TimeProvider
{
    private readonly TimeProvider _systemTimeProvider = TimeProvider.System;
    private readonly TimeSpan _offset;

    // DIコンテナから IOptions<TimeProviderOptions> を受け取る
    public ConfigurableTimeProvider(IOptions<TimeProviderOptions> options)
    {
        _offset = options.Value.Offset;
    }

    // 設定されたオフセット値を使って時刻をずらす
    public override DateTimeOffset GetUtcNow()
    {
        return _systemTimeProvider.GetUtcNow().Add(_offset);
    }

    // 他の機能は実際のTimeProviderに委譲する
    public override TimeZoneInfo LocalTimeZone => _systemTimeProvider.LocalTimeZone;

    public override ITimer CreateTimer(TimerCallback callback, object? state, TimeSpan dueTime, TimeSpan period)
    {
        return _systemTimeProvider.CreateTimer(callback, state, dueTime, period);
    }

    public override long GetTimestamp()
    {
        return _systemTimeProvider.GetTimestamp();
    }

    public override long TimestampFrequency => _systemTimeProvider.TimestampFrequency;
}
