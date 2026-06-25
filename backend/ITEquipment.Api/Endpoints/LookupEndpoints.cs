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
            IHostEnvironment environment,
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
            catch (MySqlException exception)
            {
                var detail = environment.IsDevelopment()
                    ? $"Database connection failed: {exception.Message}"
                    : "Database connection failed.";
                return Results.Problem(detail, statusCode: StatusCodes.Status503ServiceUnavailable);
            }
        })
        .WithName("GetDepartments");

        group.MapGet("/roles", async (
            LookupRepository repository,
            IHostEnvironment environment,
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
            catch (MySqlException exception)
            {
                var detail = environment.IsDevelopment()
                    ? $"Database connection failed: {exception.Message}"
                    : "Database connection failed.";
                return Results.Problem(detail, statusCode: StatusCodes.Status503ServiceUnavailable);
            }
        })
        .WithName("GetRoles");

        return group;
    }
}
