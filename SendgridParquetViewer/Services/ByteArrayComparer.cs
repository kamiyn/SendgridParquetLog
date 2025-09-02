using System;
using System.Collections.Generic;

namespace SendgridParquetViewer.Services;

internal sealed class ByteArrayComparer : IComparer<byte[]>, IEqualityComparer<byte[]>
{
    public static readonly ByteArrayComparer Instance = new();

    private ByteArrayComparer() { }

    public int Compare(byte[]? x, byte[]? y)
    {
        if (ReferenceEquals(x, y)) return 0;
        if (x is null) return -1;
        if (y is null) return 1;

        ReadOnlySpan<byte> a = x;
        ReadOnlySpan<byte> b = y;
        int min = Math.Min(a.Length, b.Length);

        for (int i = 0; i < min; i++)
        {
            int diff = a[i] - b[i];
            if (diff != 0) return diff;
        }

        return a.Length - b.Length;
    }

    public bool Equals(byte[]? x, byte[]? y)
    {
        if (ReferenceEquals(x, y)) return true;
        if (x is null || y is null) return false;
        if (x.Length != y.Length) return false;
        return x.AsSpan().SequenceEqual(y);
    }

    public int GetHashCode(byte[]? obj)
    {
        if (obj is null) return 0;
        // 軽量なハッシュ（簡易版）。必要なら FNV-1a や SipHash に差し替え可。
        unchecked
        {
            int hash = 17;
            foreach (var b in obj)
            {
                hash = hash * 31 + b;
            }
            return hash;
        }
    }
}
