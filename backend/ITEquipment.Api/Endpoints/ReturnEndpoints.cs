using ITEquipment.Api.Data;
using ITEquipment.Api.Models;
using MySqlConnector;

namespace ITEquipment.Api.Endpoints;

public static class ReturnEndpoints
{
    private static readonly HashSet<string> ValidReturnConditions = new(StringComparer.OrdinalIgnoreCase)
    {
        "Good", "Working", "Needs Inspection", "Needs Repair", "Damaged", "Missing Accessories"
    };

    private static readonly HashSet<string> ValidAcknowledgementStatuses = new(StringComparer.OrdinalIgnoreCase)
    {
        "Pending", "Acknowledged", "Rejected"
    };

    private static readonly HashSet<string> ValidInspectionStatuses = new(StringComparer.OrdinalIgnoreCase)
    {
        "Pending", "Completed", "Damage Review"
    };

    private static readonly HashSet<string> ValidDamageDecisions = new(StringComparer.OrdinalIgnoreCase)
    {
        "Pending", "No Damage", "Repair Required", "Write-off Required"
    };

    private static readonly HashSet<string> ValidReturnStatuses = new(StringComparer.OrdinalIgnoreCase)
    {
        "Returned", "Damaged", "Pending Inspection", "Under Review", "Rejected"
    };

    public static RouteGroupBuilder MapReturnEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/returns")
            .WithTags("Returns")
            .RequireAuthorization(ITEquipment.Api.Security.AppAuthorizationPolicies.RequireAssetWrite);

        group.MapGet("/", async (ReturnRepository repository, IHostEnvironment environment, CancellationToken cancellationToken) =>
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
        .WithName("GetReturns");

        group.MapGet("/{returnId:long}", async (long returnId, ReturnRepository repository, IHostEnvironment environment, CancellationToken cancellationToken) =>
        {
            if (returnId <= 0)
            {
                return Results.BadRequest(new { message = "Return id must be greater than zero." });
            }

            try
            {
                var returnRecord = await repository.GetByIdAsync(returnId, cancellationToken);
                return returnRecord is null ? Results.NotFound() : Results.Ok(returnRecord);
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
        .WithName("GetReturnById");

        group.MapPost("/", async (ReturnCreateRequest request, ReturnRepository repository, IHostEnvironment environment, CancellationToken cancellationToken) =>
        {
            var returnCondition = DefaultIfBlank(request.ReturnCondition, "Good");
            var acknowledgementStatus = DefaultIfBlank(request.AcknowledgementStatus, "Pending");
            var inspectionStatus = DefaultIfBlank(request.InspectionStatus, "Pending");
            var damageDecision = DefaultIfBlank(request.DamageDecision, "Pending");
            var returnStatus = DefaultIfBlank(request.ReturnStatus, "Returned");

            var validationError = Validate(
                request.ReturnCode,
                request.DeliveryId,
                request.AssetId,
                request.DepartmentId,
                request.ReturnedByName,
                request.ReceivedBy,
                request.ReceivedLocation,
                request.InspectionBy,
                request.Remarks,
                returnCondition,
                acknowledgementStatus,
                inspectionStatus,
                damageDecision,
                returnStatus);
            if (validationError is not null)
            {
                return Results.BadRequest(new { message = validationError });
            }

            try
            {
                var returnRecord = await repository.CreateAsync(
                    request,
                    Normalize(returnCondition, ValidReturnConditions),
                    Normalize(acknowledgementStatus, ValidAcknowledgementStatuses),
                    Normalize(inspectionStatus, ValidInspectionStatuses),
                    Normalize(damageDecision, ValidDamageDecisions),
                    Normalize(returnStatus, ValidReturnStatuses),
                    cancellationToken);
                return Results.Created($"/api/returns/{returnRecord.ReturnId}", returnRecord);
            }
            catch (MySqlException exception) when (exception.Number == 1062)
            {
                return Results.Conflict(new { message = "Return code already exists." });
            }
            catch (MySqlException exception) when (exception.Number == 1452)
            {
                return Results.BadRequest(new { message = "Selected delivery, asset, department, or user does not exist." });
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
        .WithName("CreateReturn");

        group.MapPut("/{returnId:long}", async (long returnId, ReturnUpdateRequest request, ReturnRepository repository, IHostEnvironment environment, CancellationToken cancellationToken) =>
        {
            if (returnId <= 0)
            {
                return Results.BadRequest(new { message = "Return id must be greater than zero." });
            }

            var validationError = Validate(
                request.ReturnCode,
                request.DeliveryId,
                request.AssetId,
                request.DepartmentId,
                request.ReturnedByName,
                request.ReceivedBy,
                request.ReceivedLocation,
                request.InspectionBy,
                request.Remarks,
                request.ReturnCondition,
                request.AcknowledgementStatus,
                request.InspectionStatus,
                request.DamageDecision,
                request.ReturnStatus);
            if (validationError is not null)
            {
                return Results.BadRequest(new { message = validationError });
            }

            try
            {
                var returnRecord = await repository.UpdateAsync(
                    returnId,
                    request,
                    Normalize(request.ReturnCondition, ValidReturnConditions),
                    Normalize(request.AcknowledgementStatus, ValidAcknowledgementStatuses),
                    Normalize(request.InspectionStatus, ValidInspectionStatuses),
                    Normalize(request.DamageDecision, ValidDamageDecisions),
                    Normalize(request.ReturnStatus, ValidReturnStatuses),
                    cancellationToken);
                return returnRecord is null ? Results.NotFound() : Results.Ok(returnRecord);
            }
            catch (MySqlException exception) when (exception.Number == 1062)
            {
                return Results.Conflict(new { message = "Return code already exists." });
            }
            catch (MySqlException exception) when (exception.Number == 1452)
            {
                return Results.BadRequest(new { message = "Selected delivery, asset, department, or user does not exist." });
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
        .WithName("UpdateReturn");

        group.MapDelete("/{returnId:long}", async (long returnId, ReturnRepository repository, IHostEnvironment environment, CancellationToken cancellationToken) =>
        {
            if (returnId <= 0)
            {
                return Results.BadRequest(new { message = "Return id must be greater than zero." });
            }

            try
            {
                var returnRecord = await repository.RejectAsync(returnId, "Rejected from API.", cancellationToken);
                return returnRecord is null ? Results.NotFound() : Results.Ok(returnRecord);
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
        .WithName("RejectReturn");

        return group;
    }

    private static string? Validate(
        string returnCode,
        long? deliveryId,
        long assetId,
        long? departmentId,
        string returnedByName,
        long? receivedBy,
        string? receivedLocation,
        long? inspectionBy,
        string? remarks,
        string returnCondition,
        string acknowledgementStatus,
        string inspectionStatus,
        string damageDecision,
        string returnStatus)
    {
        if (string.IsNullOrWhiteSpace(returnCode)) return "Return code is required.";
        if (returnCode.Trim().Length > 80) return "Return code must be 80 characters or fewer.";
        if (deliveryId <= 0) return "Delivery id must be greater than zero.";
        if (assetId <= 0) return "Asset id must be greater than zero.";
        if (departmentId <= 0) return "Department id must be greater than zero.";
        if (string.IsNullOrWhiteSpace(returnedByName)) return "Returned-by name is required.";
        if (returnedByName.Trim().Length > 150) return "Returned-by name must be 150 characters or fewer.";
        if (receivedBy <= 0) return "Received-by user id must be greater than zero.";
        if (inspectionBy <= 0) return "Inspection-by user id must be greater than zero.";
        if (HasValueLongerThan(receivedLocation, 200)) return "Received location must be 200 characters or fewer.";
        if (HasValueLongerThan(remarks, 1000)) return "Remarks must be 1000 characters or fewer.";
        if (!ValidReturnConditions.Contains(returnCondition)) return "Return condition is invalid.";
        if (!ValidAcknowledgementStatuses.Contains(acknowledgementStatus)) return "Acknowledgement status is invalid.";
        if (!ValidInspectionStatuses.Contains(inspectionStatus)) return "Inspection status is invalid.";
        if (!ValidDamageDecisions.Contains(damageDecision)) return "Damage decision is invalid.";
        return ValidReturnStatuses.Contains(returnStatus) ? null : "Return status is invalid.";
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
