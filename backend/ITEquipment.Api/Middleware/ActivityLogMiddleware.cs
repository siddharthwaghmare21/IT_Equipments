using ITEquipment.Api.Data;
using System.Security.Claims;
using MySqlConnector;

namespace ITEquipment.Api.Middleware;

public sealed class ActivityLogMiddleware(RequestDelegate next, ILogger<ActivityLogMiddleware> logger)
{
    private static readonly HashSet<string> LoggedMethods = new(StringComparer.OrdinalIgnoreCase)
    {
        HttpMethods.Post,
        HttpMethods.Put,
        HttpMethods.Delete,
        HttpMethods.Patch
    };

    public async Task InvokeAsync(HttpContext context, ActivityLogRepository repository)
    {
        await next(context);

        if (!ShouldLog(context))
        {
            return;
        }

        try
        {
            var moduleName = GetModuleName(context.Request.Path);
            var actionName = GetActionName(context.Request.Method, context.Request.Path);
            var entityId = GetEntityId(context);
            var userId = GetUserId(context);
            var status = context.Response.StatusCode >= 200 && context.Response.StatusCode <= 399
                ? "Success"
                : "Failed";

            await repository.CreateAsync(
                userId,
                moduleName,
                actionName,
                moduleName,
                entityId,
                $"{context.Request.Method} {context.Request.Path} completed with HTTP {context.Response.StatusCode}.",
                context.Connection.RemoteIpAddress?.ToString(),
                context.Request.Headers.UserAgent.ToString(),
                status,
                context.RequestAborted);
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (MySqlException exception)
        {
            logger.LogWarning(exception, "Activity log write failed for {Method} {Path}.", context.Request.Method, context.Request.Path);
        }
        catch (InvalidOperationException exception)
        {
            logger.LogWarning(exception, "Activity log write failed because database configuration is not ready.");
        }
    }

    private static bool ShouldLog(HttpContext context)
    {
        return context.Request.Path.StartsWithSegments("/api") &&
            !context.Request.Path.StartsWithSegments("/api/health") &&
            LoggedMethods.Contains(context.Request.Method);
    }

    private static string GetModuleName(PathString path)
    {
        var segments = path.Value?.Split('/', StringSplitOptions.RemoveEmptyEntries) ?? [];
        if (segments.Length < 2)
        {
            return "System";
        }

        return ToTitleCase(segments[1]);
    }

    private static string GetActionName(string method, PathString path)
    {
        var suffix = path.Value?.Contains("/archive", StringComparison.OrdinalIgnoreCase) == true
            ? "Archive"
            : method.ToUpperInvariant() switch
            {
                "POST" => "Create",
                "PUT" => "Update",
                "PATCH" => "Update",
                "DELETE" => "Delete",
                _ => method.ToUpperInvariant()
            };

        return suffix;
    }

    private static long? GetEntityId(HttpContext context)
    {
        foreach (var routeValue in context.Request.RouteValues)
        {
            if (!routeValue.Key.EndsWith("Id", StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            if (long.TryParse(Convert.ToString(routeValue.Value), out var entityId))
            {
                return entityId;
            }
        }

        return null;
    }

    private static long? GetUserId(HttpContext context)
    {
        var claimValue = context.User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? context.User.FindFirstValue("sub");

        if (long.TryParse(claimValue, out var tokenUserId) && tokenUserId > 0)
        {
            return tokenUserId;
        }

        return long.TryParse(context.Request.Headers["X-User-Id"], out var userId) && userId > 0
            ? userId
            : null;
    }

    private static string ToTitleCase(string value)
    {
        return string.Join(
            ' ',
            value.Split('-', StringSplitOptions.RemoveEmptyEntries)
                .Select(segment => string.Concat(segment[..1].ToUpperInvariant(), segment[1..])));
    }
}
