using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;

using SendgridParquet.Shared;

using SendgridParquetViewer.Authorization;

using Yarp.ReverseProxy.Configuration;
using Yarp.ReverseProxy.Transforms;
using Yarp.ReverseProxy.Transforms.Builder;

namespace SendgridParquetViewer.Services;

/// <summary>
/// Generates S3 pre-signed URLs on the fly so YARP can proxy private objects.
/// </summary>
public sealed class S3PresigningTransformer : ITransformProvider
{
    internal const string RouteId = "s3-route";
    internal const string ClusterId = "s3-cluster";

    private static readonly PathString RoutePrefix = new("/s3files");
    private static readonly TimeSpan DefaultLifetime = TimeSpan.FromMinutes(5);
    private readonly S3StorageService _storageService;

    public S3PresigningTransformer(S3StorageService storageService)
    {
        _storageService = storageService;
    }

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
            string objectKey = ResolveObjectKey(transformContext.Path);
            var presignedUrl = _storageService.CreatePreSignedGetUrl(
                objectKey,
                DefaultLifetime,
                EnumerateQuery(transformContext.HttpContext.Request.Query));

            transformContext.ProxyRequest.RequestUri = new Uri(presignedUrl);
            transformContext.ProxyRequest.Headers.Host = null;

            return ValueTask.CompletedTask;
        });
    }

    private static IEnumerable<KeyValuePair<string, string?>> EnumerateQuery(IQueryCollection query)
    {
        return query.SelectMany(
            static pair => pair.Value.Select(value => new KeyValuePair<string, string?>(pair.Key, value)));
    }

    private static string ResolveObjectKey(PathString path)
    {
        if (path.HasValue && path.StartsWithSegments(RoutePrefix, out var suffix))
        {
            return suffix.Value?.TrimStart('/') ?? string.Empty;
        }

        return path.Value?.TrimStart('/') ?? string.Empty;
    }

    public static IReadOnlyList<RouteConfig> BuildRoutes()
    {
        RouteConfig[] routes =
        {
            new RouteConfig
            {
                RouteId = RouteId,
                ClusterId = ClusterId,
                Match = new RouteMatch { Path = "/s3files/{**s3Key}" },
                AuthorizationPolicy = AuthorizationPolicies.ViewerRole
            }
        };

        return routes;
    }

    public static IReadOnlyList<ClusterConfig> BuildClusters()
    {
        ClusterConfig[] clusters =
        {
            new ClusterConfig
            {
                ClusterId = ClusterId,
                Destinations = new Dictionary<string, DestinationConfig>
                {
                    ["s3"] = new DestinationConfig
                    {
                        // Placeholder; S3PresigningTransformer assigns the actual pre-signed URL per request.
                        Address = "https://placeholder.invalid/"
                    }
                }
            }
        };

        return clusters;
    }
}
