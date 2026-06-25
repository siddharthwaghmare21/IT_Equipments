using ITEquipment.Api.Data;
using ITEquipment.Api.Models;
using MySqlConnector;

namespace ITEquipment.Api.Endpoints;

public static class VendorEndpoints
{
    private static readonly HashSet<string> ValidComplianceStatuses = new(StringComparer.OrdinalIgnoreCase)
    {
        "Compliant",
        "Review Required",
        "Blocked"
    };

    public static RouteGroupBuilder MapVendorEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/vendors").WithTags("Vendors");

        group.MapGet("/", async (
            VendorRepository repository,
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
        .WithName("GetVendors");

        group.MapGet("/{vendorId:long}", async (
            long vendorId,
            VendorRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            try
            {
                var vendor = await repository.GetByIdAsync(vendorId, cancellationToken);
                return vendor is null ? Results.NotFound() : Results.Ok(vendor);
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
        .WithName("GetVendorById");

        group.MapPost("/", async (
            VendorCreateRequest request,
            VendorRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            var complianceStatus = string.IsNullOrWhiteSpace(request.ComplianceStatus)
                ? "Review Required"
                : request.ComplianceStatus.Trim();
            var validationError = Validate(request.VendorCode, request.VendorName, complianceStatus);
            if (validationError is not null)
            {
                return Results.BadRequest(new { message = validationError });
            }

            var normalizedRequest = request with { ComplianceStatus = NormalizeComplianceStatus(complianceStatus) };

            try
            {
                var vendor = await repository.CreateAsync(normalizedRequest, cancellationToken);
                return Results.Created($"/api/vendors/{vendor.VendorId}", vendor);
            }
            catch (MySqlException exception) when (exception.Number == 1062)
            {
                return Results.Conflict(new { message = "Vendor code already exists." });
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
        .WithName("CreateVendor");

        group.MapPut("/{vendorId:long}", async (
            long vendorId,
            VendorUpdateRequest request,
            VendorRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            var validationError = Validate(request.VendorCode, request.VendorName, request.ComplianceStatus);
            if (validationError is not null)
            {
                return Results.BadRequest(new { message = validationError });
            }

            var normalizedRequest = request with
            {
                ComplianceStatus = NormalizeComplianceStatus(request.ComplianceStatus)
            };

            try
            {
                var vendor = await repository.UpdateAsync(vendorId, normalizedRequest, cancellationToken);
                return vendor is null ? Results.NotFound() : Results.Ok(vendor);
            }
            catch (MySqlException exception) when (exception.Number == 1062)
            {
                return Results.Conflict(new { message = "Vendor code already exists." });
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
        .WithName("UpdateVendor");

        group.MapDelete("/{vendorId:long}", async (
            long vendorId,
            VendorRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            try
            {
                return await repository.DeactivateAsync(vendorId, cancellationToken)
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
        .WithName("DeactivateVendor");

        return group;
    }

    private static string? Validate(string vendorCode, string vendorName, string complianceStatus)
    {
        if (string.IsNullOrWhiteSpace(vendorCode))
        {
            return "Vendor code is required.";
        }

        if (string.IsNullOrWhiteSpace(vendorName))
        {
            return "Vendor name is required.";
        }

        if (vendorCode.Length > 50)
        {
            return "Vendor code must be 50 characters or fewer.";
        }

        if (vendorName.Length > 180)
        {
            return "Vendor name must be 180 characters or fewer.";
        }

        return ValidComplianceStatuses.Contains(complianceStatus)
            ? null
            : "Compliance status must be Compliant, Review Required, or Blocked.";
    }

    private static string NormalizeComplianceStatus(string complianceStatus)
    {
        return ValidComplianceStatuses.First(status =>
            status.Equals(complianceStatus, StringComparison.OrdinalIgnoreCase));
    }

    private static IResult DatabaseProblem(IHostEnvironment environment, MySqlException exception)
    {
        var detail = environment.IsDevelopment()
            ? $"Database connection failed: {exception.Message}"
            : "Database connection failed.";

        return Results.Problem(detail, statusCode: StatusCodes.Status503ServiceUnavailable);
    }
}
