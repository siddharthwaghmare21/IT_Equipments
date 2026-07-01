using ITEquipment.Api.Data;
using ITEquipment.Api.Models;
using MySqlConnector;
using System.Net.Mail;

namespace ITEquipment.Api.Endpoints;

public static class DepartmentEndpoints
{
    public static RouteGroupBuilder MapDepartmentEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/departments")
            .WithTags("Departments")
            .RequireAuthorization(ITEquipment.Api.Security.AppAuthorizationPolicies.RequireReportsRead);

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
            if (departmentId <= 0)
            {
                return Results.BadRequest(new { message = "Department id must be greater than zero." });
            }

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
            var validationError = Validate(request);
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
        .RequireAuthorization(ITEquipment.Api.Security.AppAuthorizationPolicies.RequireAssetWrite)
        .WithName("CreateDepartment");

        group.MapPut("/{departmentId:long}", async (
            long departmentId,
            DepartmentUpdateRequest request,
            DepartmentRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            if (departmentId <= 0)
            {
                return Results.BadRequest(new { message = "Department id must be greater than zero." });
            }

            var validationError = Validate(request);
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
        .RequireAuthorization(ITEquipment.Api.Security.AppAuthorizationPolicies.RequireAssetWrite)
        .WithName("UpdateDepartment");

        group.MapDelete("/{departmentId:long}", async (
            long departmentId,
            DepartmentRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            if (departmentId <= 0)
            {
                return Results.BadRequest(new { message = "Department id must be greater than zero." });
            }

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
        .RequireAuthorization(ITEquipment.Api.Security.AppAuthorizationPolicies.RequireAssetWrite)
        .WithName("DeactivateDepartment");

        return group;
    }

    private static string? Validate(DepartmentCreateRequest request)
    {
        return Validate(
            request.DepartmentCode,
            request.DepartmentName,
            request.DepartmentHead,
            request.ContactEmail,
            request.ContactPhone,
            request.Location);
    }

    private static string? Validate(DepartmentUpdateRequest request)
    {
        return Validate(
            request.DepartmentCode,
            request.DepartmentName,
            request.DepartmentHead,
            request.ContactEmail,
            request.ContactPhone,
            request.Location);
    }

    private static string? Validate(
        string departmentCode,
        string departmentName,
        string? departmentHead,
        string? contactEmail,
        string? contactPhone,
        string? location)
    {
        if (string.IsNullOrWhiteSpace(departmentCode))
        {
            return "Department code is required.";
        }

        if (string.IsNullOrWhiteSpace(departmentName))
        {
            return "Department name is required.";
        }

        if (departmentCode.Trim().Length > 50)
        {
            return "Department code must be 50 characters or fewer.";
        }

        if (departmentName.Trim().Length > 150)
        {
            return "Department name must be 150 characters or fewer.";
        }

        if (HasValueLongerThan(departmentHead, 150))
        {
            return "Department head must be 150 characters or fewer.";
        }

        if (HasValueLongerThan(contactEmail, 150))
        {
            return "Contact email must be 150 characters or fewer.";
        }

        if (!IsValidEmail(contactEmail))
        {
            return "Contact email is invalid.";
        }

        if (HasValueLongerThan(contactPhone, 30))
        {
            return "Contact phone must be 30 characters or fewer.";
        }

        return HasValueLongerThan(location, 200)
            ? "Location must be 200 characters or fewer."
            : null;
    }

    private static bool HasValueLongerThan(string? value, int maxLength)
    {
        return !string.IsNullOrWhiteSpace(value) && value.Trim().Length > maxLength;
    }

    private static bool IsValidEmail(string? email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return true;
        }

        try
        {
            _ = new MailAddress(email.Trim());
            return true;
        }
        catch (FormatException)
        {
            return false;
        }
    }

    private static IResult DatabaseProblem(IHostEnvironment environment, MySqlException exception)
    {
        var detail = environment.IsDevelopment()
            ? $"Database connection failed: {exception.Message}"
            : "Database connection failed.";

        return Results.Problem(detail, statusCode: StatusCodes.Status503ServiceUnavailable);
    }
}

