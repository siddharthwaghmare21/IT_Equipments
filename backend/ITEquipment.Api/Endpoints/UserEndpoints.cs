using ITEquipment.Api.Data;
using ITEquipment.Api.Models;
using ITEquipment.Api.Security;
using MySqlConnector;

namespace ITEquipment.Api.Endpoints;

public static class UserEndpoints
{
    private static readonly HashSet<string> ValidRoleCodes = new(StringComparer.OrdinalIgnoreCase)
    {
        AppRoles.Admin,
        AppRoles.Employee,
        AppRoles.Viewer
    };

    private static readonly HashSet<string> ValidStatuses = new(StringComparer.OrdinalIgnoreCase)
    {
        "Pending",
        "Active",
        "Rejected",
        "Suspended",
        "Inactive"
    };

    public static RouteGroupBuilder MapUserEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/users")
            .WithTags("Users")
            .RequireAuthorization(AppAuthorizationPolicies.RequireAdminOrSuperAdmin);

        group.MapGet("/", async (
            UserRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            try
            {
                return Results.Ok(await repository.GetAllAsync(cancellationToken));
            }
            catch (InvalidOperationException exception)
            {
                return Results.Problem(exception.Message, statusCode: StatusCodes.Status503ServiceUnavailable);
            }
            catch (MySqlException exception)
            {
                return DatabaseProblem(environment, exception);
            }
        })
        .WithName("GetUsers");

        group.MapPatch("/{userId:long}/role", async (
            long userId,
            UserUpdateRoleRequest request,
            UserRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            if (string.IsNullOrWhiteSpace(request.RoleCode) || !ValidRoleCodes.Contains(request.RoleCode))
            {
                return Results.BadRequest(new { message = "Role must be ADMIN, EMPLOYEE or VIEWER." });
            }

            try
            {
                var user = await repository.UpdateRoleAsync(userId, request.RoleCode, cancellationToken);
                return user is null ? Results.NotFound() : Results.Ok(user);
            }
            catch (InvalidOperationException exception)
            {
                return Results.Problem(exception.Message, statusCode: StatusCodes.Status503ServiceUnavailable);
            }
            catch (UnauthorizedAccessException exception)
            {
                return Results.Json(new { message = exception.Message }, statusCode: StatusCodes.Status403Forbidden);
            }
            catch (MySqlException exception)
            {
                return DatabaseProblem(environment, exception);
            }
        })
        .WithName("UpdateUserRole");

        group.MapPatch("/{userId:long}/status", async (
            long userId,
            UserUpdateStatusRequest request,
            UserRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            if (string.IsNullOrWhiteSpace(request.AccountStatus) || !ValidStatuses.Contains(request.AccountStatus))
            {
                return Results.BadRequest(new { message = "Account status is invalid." });
            }

            try
            {
                var user = await repository.UpdateStatusAsync(userId, request.AccountStatus, cancellationToken);
                return user is null ? Results.NotFound() : Results.Ok(user);
            }
            catch (InvalidOperationException exception)
            {
                return Results.Problem(exception.Message, statusCode: StatusCodes.Status503ServiceUnavailable);
            }
            catch (UnauthorizedAccessException exception)
            {
                return Results.Json(new { message = exception.Message }, statusCode: StatusCodes.Status403Forbidden);
            }
            catch (MySqlException exception)
            {
                return DatabaseProblem(environment, exception);
            }
        })
        .WithName("UpdateUserStatus");

        return group;
    }

    private static IResult DatabaseProblem(IHostEnvironment environment, MySqlException exception)
    {
        var detail = environment.IsDevelopment()
            ? $"Database connection failed: {exception.Message}"
            : "Database connection failed.";

        return Results.Problem(detail, statusCode: StatusCodes.Status503ServiceUnavailable);
    }
}
