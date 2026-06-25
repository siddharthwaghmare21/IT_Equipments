using ITEquipment.Api.Data;
using ITEquipment.Api.Models;
using MySqlConnector;

namespace ITEquipment.Api.Endpoints;

public static class MaintenanceEndpoints
{
    private static readonly HashSet<string> ValidPriorities = new(StringComparer.OrdinalIgnoreCase)
    {
        "Low", "Medium", "High", "Critical"
    };

    private static readonly HashSet<string> ValidApprovalStatuses = new(StringComparer.OrdinalIgnoreCase)
    {
        "Pending", "Approved", "Rejected"
    };

    private static readonly HashSet<string> ValidMaintenanceStatuses = new(StringComparer.OrdinalIgnoreCase)
    {
        "Pending", "In Progress", "Completed", "Cancelled"
    };

    public static RouteGroupBuilder MapMaintenanceEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/maintenance")
            .WithTags("Maintenance")
            .RequireAuthorization(ITEquipment.Api.Security.AppAuthorizationPolicies.RequireAssetWrite);

        group.MapGet("/", async (MaintenanceRepository repository, IHostEnvironment environment, CancellationToken cancellationToken) =>
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
        .WithName("GetMaintenanceRecords");

        group.MapGet("/{maintenanceId:long}", async (long maintenanceId, MaintenanceRepository repository, IHostEnvironment environment, CancellationToken cancellationToken) =>
        {
            if (maintenanceId <= 0)
            {
                return Results.BadRequest(new { message = "Maintenance id must be greater than zero." });
            }

            try
            {
                var record = await repository.GetByIdAsync(maintenanceId, cancellationToken);
                return record is null ? Results.NotFound() : Results.Ok(record);
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
        .WithName("GetMaintenanceRecordById");

        group.MapPost("/", async (MaintenanceCreateRequest request, MaintenanceRepository repository, IHostEnvironment environment, CancellationToken cancellationToken) =>
        {
            var priority = DefaultIfBlank(request.Priority, "Medium");
            var approvalStatus = DefaultIfBlank(request.ApprovalStatus, "Pending");
            var maintenanceStatus = DefaultIfBlank(request.MaintenanceStatus, "Pending");

            var validationError = Validate(
                request.MaintenanceCode,
                request.AssetId,
                request.IssueType,
                request.ReportedByName,
                request.VendorId,
                request.ServiceType,
                priority,
                request.ServiceDate,
                request.ExpectedCompletionDate,
                request.CompletionDate,
                request.DowntimeHours ?? 0,
                approvalStatus,
                request.MaintenanceCost ?? 0,
                maintenanceStatus,
                request.Remarks);
            if (validationError is not null)
            {
                return Results.BadRequest(new { message = validationError });
            }

            try
            {
                var record = await repository.CreateAsync(
                    request,
                    Normalize(priority, ValidPriorities),
                    Normalize(approvalStatus, ValidApprovalStatuses),
                    Normalize(maintenanceStatus, ValidMaintenanceStatuses),
                    cancellationToken);
                return Results.Created($"/api/maintenance/{record.MaintenanceId}", record);
            }
            catch (MySqlException exception) when (exception.Number == 1062)
            {
                return Results.Conflict(new { message = "Maintenance code already exists." });
            }
            catch (MySqlException exception) when (exception.Number == 1452)
            {
                return Results.BadRequest(new { message = "Selected asset, vendor, or user does not exist." });
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
        .WithName("CreateMaintenanceRecord");

        group.MapPut("/{maintenanceId:long}", async (long maintenanceId, MaintenanceUpdateRequest request, MaintenanceRepository repository, IHostEnvironment environment, CancellationToken cancellationToken) =>
        {
            if (maintenanceId <= 0)
            {
                return Results.BadRequest(new { message = "Maintenance id must be greater than zero." });
            }

            var validationError = Validate(
                request.MaintenanceCode,
                request.AssetId,
                request.IssueType,
                request.ReportedByName,
                request.VendorId,
                request.ServiceType,
                request.Priority,
                request.ServiceDate,
                request.ExpectedCompletionDate,
                request.CompletionDate,
                request.DowntimeHours,
                request.ApprovalStatus,
                request.MaintenanceCost,
                request.MaintenanceStatus,
                request.Remarks);
            if (validationError is not null)
            {
                return Results.BadRequest(new { message = validationError });
            }

            try
            {
                var record = await repository.UpdateAsync(
                    maintenanceId,
                    request,
                    Normalize(request.Priority, ValidPriorities),
                    Normalize(request.ApprovalStatus, ValidApprovalStatuses),
                    Normalize(request.MaintenanceStatus, ValidMaintenanceStatuses),
                    cancellationToken);
                return record is null ? Results.NotFound() : Results.Ok(record);
            }
            catch (MySqlException exception) when (exception.Number == 1062)
            {
                return Results.Conflict(new { message = "Maintenance code already exists." });
            }
            catch (MySqlException exception) when (exception.Number == 1452)
            {
                return Results.BadRequest(new { message = "Selected asset, vendor, or user does not exist." });
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
        .WithName("UpdateMaintenanceRecord");

        group.MapDelete("/{maintenanceId:long}", async (long maintenanceId, MaintenanceRepository repository, IHostEnvironment environment, CancellationToken cancellationToken) =>
        {
            if (maintenanceId <= 0)
            {
                return Results.BadRequest(new { message = "Maintenance id must be greater than zero." });
            }

            try
            {
                var record = await repository.CancelAsync(maintenanceId, "Cancelled from API.", cancellationToken);
                return record is null ? Results.NotFound() : Results.Ok(record);
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
        .WithName("CancelMaintenanceRecord");

        return group;
    }

    private static string? Validate(
        string maintenanceCode,
        long assetId,
        string issueType,
        string? reportedByName,
        long? vendorId,
        string? serviceType,
        string priority,
        DateOnly? serviceDate,
        DateOnly? expectedCompletionDate,
        DateOnly? completionDate,
        decimal downtimeHours,
        string approvalStatus,
        decimal maintenanceCost,
        string maintenanceStatus,
        string? remarks)
    {
        if (string.IsNullOrWhiteSpace(maintenanceCode)) return "Maintenance code is required.";
        if (maintenanceCode.Trim().Length > 80) return "Maintenance code must be 80 characters or fewer.";
        if (assetId <= 0) return "Asset id must be greater than zero.";
        if (string.IsNullOrWhiteSpace(issueType)) return "Issue type is required.";
        if (issueType.Trim().Length > 150) return "Issue type must be 150 characters or fewer.";
        if (HasValueLongerThan(reportedByName, 150)) return "Reported-by name must be 150 characters or fewer.";
        if (vendorId <= 0) return "Vendor id must be greater than zero.";
        if (HasValueLongerThan(serviceType, 150)) return "Service type must be 150 characters or fewer.";
        if (expectedCompletionDate.HasValue && serviceDate.HasValue && expectedCompletionDate.Value < serviceDate.Value) return "Expected completion date cannot be before service date.";
        if (completionDate.HasValue && serviceDate.HasValue && completionDate.Value < serviceDate.Value) return "Completion date cannot be before service date.";
        if (downtimeHours < 0) return "Downtime hours cannot be negative.";
        if (maintenanceCost < 0) return "Maintenance cost cannot be negative.";
        if (HasValueLongerThan(remarks, 1000)) return "Remarks must be 1000 characters or fewer.";
        if (!ValidPriorities.Contains(priority)) return "Priority is invalid.";
        if (!ValidApprovalStatuses.Contains(approvalStatus)) return "Approval status is invalid.";
        return ValidMaintenanceStatuses.Contains(maintenanceStatus) ? null : "Maintenance status is invalid.";
    }

    private static string DefaultIfBlank(string? value, string defaultValue)
    {
        return string.IsNullOrWhiteSpace(value) ? defaultValue : value.Trim();
    }

    private static string Normalize(string value, HashSet<string> validValues)
    {
        return validValues.First(validValue => validValue.Equals(value, StringComparison.OrdinalIgnoreCase));
    }

    private static bool HasValueLongerThan(string? value, int maxLength)
    {
        return !string.IsNullOrWhiteSpace(value) && value.Trim().Length > maxLength;
    }

    private static IResult DatabaseProblem(IHostEnvironment environment, MySqlException exception)
    {
        var detail = environment.IsDevelopment()
            ? $"Database connection failed: {exception.Message}"
            : "Database connection failed.";

        return Results.Problem(detail, statusCode: StatusCodes.Status503ServiceUnavailable);
    }
}
