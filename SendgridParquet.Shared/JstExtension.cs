using System;

namespace SendgridParquet.Shared;

public static class JstExtension
{
    private static readonly TimeSpan s_jstOffset = TimeSpan.FromHours(9);

    public static DateTimeOffset JstUnixTimeSeconds(long u) => DateTimeOffset.FromUnixTimeSeconds(u).ToOffset(s_jstOffset);

    public static DateTimeOffset ToJst(this DateTimeOffset dt) => dt.ToOffset(s_jstOffset);
}
