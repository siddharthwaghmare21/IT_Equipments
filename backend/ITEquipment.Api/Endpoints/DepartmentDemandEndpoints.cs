using ITEquipment.Api.Data;
using ITEquipment.Api.Models;
using MySqlConnector;

namespace ITEquipment.Api.Endpoints;

public static class DepartmentDemandEndpoints
{
    public static RouteGroupBuilder MapDepartmentDemandEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/department-demands")
            .WithTags("Department Demands")
            .RequireAuthorization(ITEquipment.Api.Security.AppAuthorizationPolicies.RequireReportsRead);

        group.MapGet("/", async (
            DepartmentDemandRepository repository,
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
        .WithName("GetDepartmentDemands");

        group.MapGet("/{departmentId:long}", async (
            long departmentId,
            DepartmentDemandRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            if (departmentId <= 0)
            {
                return Results.BadRequest(new { message = "Department id must be greater than zero." });
            }

            try
            {
                var demand = await repository.GetByDepartmentIdAsync(departmentId, cancellationToken);
                return demand is null ? Results.NotFound() : Results.Ok(demand);
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
        .WithName("GetDepartmentDemandByDepartment");

        group.MapPost("/", async (
            DepartmentDemandUpsertRequest request,
            DepartmentDemandRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            var validationError = Validate(request);
            if (validationError is not null)
            {
                return Results.BadRequest(new { message = validationError });
            }

            try
            {
                var demand = await repository.UpsertAsync(request, cancellationToken);
                return Results.Ok(demand);
            }
            catch (MySqlException exception) when (exception.Number == 1452)
            {
                return Results.BadRequest(new { message = "Selected department does not exist." });
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
        .RequireAuthorization(ITEquipment.Api.Security.AppAuthorizationPolicies.RequireAssetWrite)
        .WithName("UpsertDepartmentDemand");

        group.MapDelete("/{departmentId:long}", async (
            long departmentId,
            DepartmentDemandRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            if (departmentId <= 0)
            {
                return Results.BadRequest(new { message = "Department id must be greater than zero." });
            }

            try
            {
                return await repository.DeleteByDepartmentIdAsync(departmentId, cancellationToken)
                    ? Results.NoContent()
                    : Results.NotFound();
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
        .RequireAuthorization(ITEquipment.Api.Security.AppAuthorizationPolicies.RequireAssetWrite)
        .WithName("DeleteDepartmentDemand");

        return group;
    }

    private static string? Validate(DepartmentDemandUpsertRequest request)
    {
        if (request.DepartmentId <= 0)
        {
            return "Department id must be greater than zero.";
        }

        if (request.DemandCount < 0)
        {
            return "Demand count cannot be negative.";
        }

        if (request.Source?.Trim().Length > 100)
        {
            return "Source must be 100 characters or fewer.";
        }

        return request.Remarks?.Trim().Length > 500
            ? "Remarks must be 500 characters or fewer."
            : null;
    }

    private static IResult DatabaseProblem(IHostEnvironment environment, MySqlException exception)
    {
        var detail = environment.IsDevelopment()
            ? $"Database connection failed: {exception.Message}"
            : "Database connection failed.";

        return Results.Problem(detail, statusCode: StatusCodes.Status503ServiceUnavailable);
    }
}
