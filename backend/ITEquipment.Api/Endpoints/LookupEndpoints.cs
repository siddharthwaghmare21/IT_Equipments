using ITEquipment.Api.Data;
using MySqlConnector;

namespace ITEquipment.Api.Endpoints;

public static class LookupEndpoints
{
    public static RouteGroupBuilder MapLookupEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api").WithTags("Lookups");

        group.MapGet("/departments", async (
            LookupRepository repository,
            CancellationToken cancellationToken) =>
        {
            try
            {
                var departments = await repository.GetDepartmentsAsync(cancellationToken);
                return Results.Ok(departments);
            }
            catch (InvalidOperationException exception)
            {
                return Results.Problem(exception.Message, statusCode: StatusCodes.Status503ServiceUnavailable);
            }
            catch (MySqlException)
            {
                return Results.Problem("Database connection failed.", statusCode: StatusCodes.Status503ServiceUnavailable);
            }
        })
        .WithName("GetDepartments");

        group.MapGet("/roles", async (
            LookupRepository repository,
            CancellationToken cancellationToken) =>
        {
            try
            {
                var roles = await repository.GetRolesAsync(cancellationToken);
                return Results.Ok(roles);
            }
            catch (InvalidOperationException exception)
            {
                return Results.Problem(exception.Message, statusCode: StatusCodes.Status503ServiceUnavailable);
            }
            catch (MySqlException)
            {
                return Results.Problem("Database connection failed.", statusCode: StatusCodes.Status503ServiceUnavailable);
            }
        })
        .WithName("GetRoles");

        return group;
    }
}
