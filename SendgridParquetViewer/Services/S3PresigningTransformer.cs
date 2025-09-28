using SendgridParquet.Shared;

using SendgridParquetViewer.Authorization;

using Yarp.ReverseProxy.Configuration;
using Yarp.ReverseProxy.Transforms;
using Yarp.ReverseProxy.Transforms.Builder;

namespace SendgridParquetViewer.Services;

/// <summary>
/// Generates S3 pre-signed URLs on the fly so YARP can proxy private objects.
/// </summary>
public sealed class S3PresigningTransformer(S3StorageService storageService) : ITransformProvider
{
    private const string RouteId = "s3-route";
    private const string ClusterId = "s3-cluster";

    /// <summary>
    /// Proxy として利用するパスのプレフィックス
    /// S3 の BUCKETNAME と同じになっているとURLをコピーして作業しやすい
    /// </summary>
    private const string PathPrefix = "/sendgrid-events";
    
    public void ValidateRoute(TransformRouteValidationContext context)
    {
    }

    public void ValidateCluster(TransformClusterValidationContext context)
    {
    }

    public void Apply(TransformBuilderContext context)
    {
        if (!string.Equals(context.Route.RouteId, RouteId, StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        context.AddRequestTransform(transformContext =>
        {
            switch (transformContext.ProxyRequest.Method.Method.ToLowerInvariant())
            {
                // content に対する 署名が必要になるため、PUT/POST はサポートしない
                case "put":
                case "post":
                    throw new NotSupportedException("PUT/POST is not supported");
            }

            string s3ObjectKey = GetS3ObjectKey(transformContext.HttpContext.Request);
            transformContext.ProxyRequest.RequestUri = storageService.GetObjectUri(s3ObjectKey);
            storageService.AddAwsSignatureHeaders(transformContext.ProxyRequest, null);

            transformContext.ProxyRequest.Headers.Host = null;
            return ValueTask.CompletedTask;
        });
    }

    /// <summary>
    /// リクエストの Path に含まれる "/bucket/" 以降の部分を S3 Object Key として抽出する
    /// </summary>
    private static string GetS3ObjectKey(HttpRequest request)
    {
        var path = $"{request.PathBase.Value}{request.Path.Value}{request.QueryString.Value}";
        var bucketIndex = path.IndexOf('/', 1 /* 最初のスラッシュをスキップ */);
        if (bucketIndex < 0)
        {
            throw new ArgumentException("path must includes bucket name");
        }

        return path.Substring(bucketIndex + 1 /* ヒットしたスラッシュもスキップ */);
    }

    public static IReadOnlyList<RouteConfig> BuildRoutes() =>
    [
        new()
        {
            RouteId = RouteId,
            ClusterId = ClusterId,
            Match = new RouteMatch { Path = $"{PathPrefix}/{{**s3Key}}" },
            AuthorizationPolicy = AuthorizationPolicies.ViewerRole
        }
    ];

    public static IReadOnlyList<ClusterConfig> BuildClusters() =>
    [
        new()
        {
            ClusterId = ClusterId,
            Destinations = new Dictionary<string, DestinationConfig>
            {
                ["s3"] = new()
                {
                    // Placeholder; S3PresigningTransformer assigns the actual URL
                    Address = "https://placeholder.invalid/"
                }
            }
        }
    ];
}
