using ITEquipment.Api.Data;
using ITEquipment.Api.Models;
using MySqlConnector;

namespace ITEquipment.Api.Endpoints;

public static class DepartmentEndpoints
{
    public static RouteGroupBuilder MapDepartmentEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/departments").WithTags("Departments");

        group.MapGet("/", async (
            DepartmentRepository repository,
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
        .WithName("GetDepartments");

        group.MapGet("/{departmentId:long}", async (
            long departmentId,
            DepartmentRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            try
            {
                var department = await repository.GetByIdAsync(departmentId, cancellationToken);
                return department is null ? Results.NotFound() : Results.Ok(department);
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
        .WithName("GetDepartmentById");

        group.MapPost("/", async (
            DepartmentCreateRequest request,
            DepartmentRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            var validationError = Validate(request.DepartmentCode, request.DepartmentName);
            if (validationError is not null)
            {
                return Results.BadRequest(new { message = validationError });
            }

            try
            {
                var department = await repository.CreateAsync(request, cancellationToken);
                return Results.Created($"/api/departments/{department.DepartmentId}", department);
            }
            catch (MySqlException exception) when (exception.Number == 1062)
            {
                return Results.Conflict(new { message = "Department code or name already exists." });
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
        .WithName("CreateDepartment");

        group.MapPut("/{departmentId:long}", async (
            long departmentId,
            DepartmentUpdateRequest request,
            DepartmentRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            var validationError = Validate(request.DepartmentCode, request.DepartmentName);
            if (validationError is not null)
            {
                return Results.BadRequest(new { message = validationError });
            }

            try
            {
                var department = await repository.UpdateAsync(departmentId, request, cancellationToken);
                return department is null ? Results.NotFound() : Results.Ok(department);
            }
            catch (MySqlException exception) when (exception.Number == 1062)
            {
                return Results.Conflict(new { message = "Department code or name already exists." });
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
        .WithName("UpdateDepartment");

        group.MapDelete("/{departmentId:long}", async (
            long departmentId,
            DepartmentRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            try
            {
                return await repository.DeactivateAsync(departmentId, cancellationToken)
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
        .WithName("DeactivateDepartment");

        return group;
    }

    private static string? Validate(string departmentCode, string departmentName)
    {
        if (string.IsNullOrWhiteSpace(departmentCode))
        {
            return "Department code is required.";
        }

        if (string.IsNullOrWhiteSpace(departmentName))
        {
            return "Department name is required.";
        }

        if (departmentCode.Length > 50)
        {
            return "Department code must be 50 characters or fewer.";
        }

        return departmentName.Length > 150
            ? "Department name must be 150 characters or fewer."
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
