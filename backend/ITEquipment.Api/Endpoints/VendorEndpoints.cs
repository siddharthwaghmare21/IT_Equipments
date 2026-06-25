using ITEquipment.Api.Data;
using ITEquipment.Api.Models;
using MySqlConnector;
using System.Net.Mail;

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
            if (vendorId <= 0)
            {
                return Results.BadRequest(new { message = "Vendor id must be greater than zero." });
            }

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
            var validationError = Validate(request, complianceStatus);
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
            if (vendorId <= 0)
            {
                return Results.BadRequest(new { message = "Vendor id must be greater than zero." });
            }

            var validationError = Validate(request);
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
            if (vendorId <= 0)
            {
                return Results.BadRequest(new { message = "Vendor id must be greater than zero." });
            }

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

    private static string? Validate(VendorCreateRequest request, string complianceStatus)
    {
        return Validate(
            request.VendorCode,
            request.VendorName,
            request.ContactPerson,
            request.ContactEmail,
            request.ContactPhone,
            request.GstNumber,
            request.PaymentTerms,
            request.ServiceCategory,
            complianceStatus);
    }

    private static string? Validate(VendorUpdateRequest request)
    {
        return Validate(
            request.VendorCode,
            request.VendorName,
            request.ContactPerson,
            request.ContactEmail,
            request.ContactPhone,
            request.GstNumber,
            request.PaymentTerms,
            request.ServiceCategory,
            request.ComplianceStatus);
    }

    private static string? Validate(
        string vendorCode,
        string vendorName,
        string? contactPerson,
        string? contactEmail,
        string? contactPhone,
        string? gstNumber,
        string? paymentTerms,
        string? serviceCategory,
        string complianceStatus)
    {
        if (string.IsNullOrWhiteSpace(vendorCode))
        {
            return "Vendor code is required.";
        }

        if (string.IsNullOrWhiteSpace(vendorName))
        {
            return "Vendor name is required.";
        }

        if (vendorCode.Trim().Length > 50)
        {
            return "Vendor code must be 50 characters or fewer.";
        }

        if (vendorName.Trim().Length > 180)
        {
            return "Vendor name must be 180 characters or fewer.";
        }

        if (HasValueLongerThan(contactPerson, 150))
        {
            return "Contact person must be 150 characters or fewer.";
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

        if (HasValueLongerThan(gstNumber, 50))
        {
            return "GST number must be 50 characters or fewer.";
        }

        if (HasValueLongerThan(paymentTerms, 150))
        {
            return "Payment terms must be 150 characters or fewer.";
        }

        if (HasValueLongerThan(serviceCategory, 120))
        {
            return "Service category must be 120 characters or fewer.";
        }

        if (string.IsNullOrWhiteSpace(complianceStatus))
        {
            return "Compliance status is required.";
        }

        return ValidComplianceStatuses.Contains(complianceStatus.Trim())
            ? null
            : "Compliance status must be Compliant, Review Required, or Blocked.";
    }

    private static string NormalizeComplianceStatus(string complianceStatus)
    {
        return ValidComplianceStatuses.First(status =>
            status.Equals(complianceStatus, StringComparison.OrdinalIgnoreCase));
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
