using ITEquipment.Api.Data;
using MySqlConnector;

namespace ITEquipment.Api.Endpoints;

public static class RoleEndpoints
{
    public static RouteGroupBuilder MapRoleEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/roles").WithTags("Roles");

        group.MapGet("/", async (
            RoleRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            try
            {
                var roles = await repository.GetAllAsync(cancellationToken);
                return Results.Ok(roles);
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
        .WithName("GetRoles");

        group.MapGet("/{roleId:long}", async (
            long roleId,
            RoleRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            try
            {
                var role = await repository.GetByIdAsync(roleId, cancellationToken);
                return role is null ? Results.NotFound() : Results.Ok(role);
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
        .WithName("GetRoleById");

        return group;
    }
}
