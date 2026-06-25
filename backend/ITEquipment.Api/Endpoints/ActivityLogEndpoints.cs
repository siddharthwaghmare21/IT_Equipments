using ITEquipment.Api.Data;
using MySqlConnector;

namespace ITEquipment.Api.Endpoints;

public static class ActivityLogEndpoints
{
    public static RouteGroupBuilder MapActivityLogEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/activity-logs")
            .WithTags("Activity Logs")
            .RequireAuthorization(ITEquipment.Api.Security.AppAuthorizationPolicies.RequireAdminOrSuperAdmin);

        group.MapGet("/", async (
            int? limit,
            ActivityLogRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            try
            {
                return Results.Ok(await repository.GetRecentAsync(limit ?? 100, cancellationToken));
            }
            catch (InvalidOperationException exception)
            {
                return Results.Problem(exception.Message, statusCode: StatusCodes.Status503ServiceUnavailable);
            }
            catch (MySqlException exception)
            {
                var detail = environment.IsDevelopment()
                    ? $"Database connection failed: {exception.Message}"
                    : "Database connection failed.";

                return Results.Problem(detail, statusCode: StatusCodes.Status503ServiceUnavailable);
            }
        })
        .WithName("GetActivityLogs");

        return group;
    }
}
