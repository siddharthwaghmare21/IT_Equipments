using ITEquipment.Api.Data;
using ITEquipment.Api.Models;
using MySqlConnector;

namespace ITEquipment.Api.Endpoints;

public static class TransferEndpoints
{
    private static readonly HashSet<string> ValidTransferTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "Department Transfer",
        "IT Collection",
        "Reassignment",
        "Repair Return",
        "Temporary Handover"
    };

    private static readonly HashSet<string> ValidConditions = new(StringComparer.OrdinalIgnoreCase)
    {
        "Good",
        "Working",
        "Needs Inspection",
        "Needs Repair",
        "Damaged"
    };

    private static readonly HashSet<string> ValidAcknowledgements = new(StringComparer.OrdinalIgnoreCase)
    {
        "Pending",
        "Acknowledged",
        "Rejected"
    };

    private static readonly HashSet<string> ValidTransferStatuses = new(StringComparer.OrdinalIgnoreCase)
    {
        "Pending",
        "Collected by IT",
        "Reassigned",
        "Completed",
        "Cancelled"
    };

    public static RouteGroupBuilder MapTransferEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/transfers")
            .WithTags("Transfers")
            .RequireAuthorization(ITEquipment.Api.Security.AppAuthorizationPolicies.RequireAssetWrite);

        group.MapGet("/", async (
            TransferRepository repository,
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
        .WithName("GetTransfers");

        group.MapGet("/{transferId:long}", async (
            long transferId,
            TransferRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            if (transferId <= 0)
            {
                return Results.BadRequest(new { message = "Transfer id must be greater than zero." });
            }

            try
            {
                var transfer = await repository.GetByIdAsync(transferId, cancellationToken);
                return transfer is null ? Results.NotFound() : Results.Ok(transfer);
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
        .WithName("GetTransferById");

        group.MapPost("/", async (
            TransferCreateRequest request,
            TransferRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            var transferType = DefaultIfBlank(request.TransferType, "Department Transfer");
            var conditionAtTransfer = DefaultIfBlank(request.ConditionAtTransfer, "Good");
            var handoverAcknowledgement = DefaultIfBlank(request.HandoverAcknowledgement, "Pending");
            var newAcknowledgement = DefaultIfBlank(request.NewAcknowledgement, "Pending");
            var transferStatus = DefaultIfBlank(request.TransferStatus, "Pending");

            var validationError = Validate(
                request.TransferCode,
                transferType,
                request.AssetId,
                request.FromDepartmentId,
                request.ToDepartmentId,
                request.CurrentReceiverName,
                request.NewReceiverName,
                request.TransferReason,
                request.Accessories,
                conditionAtTransfer,
                request.CollectionDate,
                request.CollectedBy,
                request.IssueDate,
                handoverAcknowledgement,
                newAcknowledgement,
                transferStatus,
                request.Remarks);
            if (validationError is not null)
            {
                return Results.BadRequest(new { message = validationError });
            }

            try
            {
                var transfer = await repository.CreateAsync(
                    request,
                    Normalize(transferType, ValidTransferTypes),
                    Normalize(conditionAtTransfer, ValidConditions),
                    Normalize(handoverAcknowledgement, ValidAcknowledgements),
                    Normalize(newAcknowledgement, ValidAcknowledgements),
                    Normalize(transferStatus, ValidTransferStatuses),
                    cancellationToken);
                return Results.Created($"/api/transfers/{transfer.TransferId}", transfer);
            }
            catch (MySqlException exception) when (exception.Number == 1062)
            {
                return Results.Conflict(new { message = "Transfer code already exists." });
            }
            catch (MySqlException exception) when (exception.Number == 1452)
            {
                return Results.BadRequest(new { message = "Selected asset, department, or user does not exist." });
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
        .WithName("CreateTransfer");

        group.MapPut("/{transferId:long}", async (
            long transferId,
            TransferUpdateRequest request,
            TransferRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            if (transferId <= 0)
            {
                return Results.BadRequest(new { message = "Transfer id must be greater than zero." });
            }

            var validationError = Validate(
                request.TransferCode,
                request.TransferType,
                request.AssetId,
                request.FromDepartmentId,
                request.ToDepartmentId,
                request.CurrentReceiverName,
                request.NewReceiverName,
                request.TransferReason,
                request.Accessories,
                request.ConditionAtTransfer,
                request.CollectionDate,
                request.CollectedBy,
                request.IssueDate,
                request.HandoverAcknowledgement,
                request.NewAcknowledgement,
                request.TransferStatus,
                request.Remarks);
            if (validationError is not null)
            {
                return Results.BadRequest(new { message = validationError });
            }

            try
            {
                var transfer = await repository.UpdateAsync(
                    transferId,
                    request,
                    Normalize(request.TransferType, ValidTransferTypes),
                    Normalize(request.ConditionAtTransfer, ValidConditions),
                    Normalize(request.HandoverAcknowledgement, ValidAcknowledgements),
                    Normalize(request.NewAcknowledgement, ValidAcknowledgements),
                    Normalize(request.TransferStatus, ValidTransferStatuses),
                    cancellationToken);
                return transfer is null ? Results.NotFound() : Results.Ok(transfer);
            }
            catch (MySqlException exception) when (exception.Number == 1062)
            {
                return Results.Conflict(new { message = "Transfer code already exists." });
            }
            catch (MySqlException exception) when (exception.Number == 1452)
            {
                return Results.BadRequest(new { message = "Selected asset, department, or user does not exist." });
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
        .WithName("UpdateTransfer");

        group.MapDelete("/{transferId:long}", async (
            long transferId,
            TransferRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            if (transferId <= 0)
            {
                return Results.BadRequest(new { message = "Transfer id must be greater than zero." });
            }

            try
            {
                var transfer = await repository.CancelAsync(transferId, "Cancelled from API.", cancellationToken);
                return transfer is null ? Results.NotFound() : Results.Ok(transfer);
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
        .WithName("CancelTransfer");

        return group;
    }

    private static string? Validate(
        string transferCode,
        string transferType,
        long assetId,
        long? fromDepartmentId,
        long? toDepartmentId,
        string? currentReceiverName,
        string? newReceiverName,
        string? transferReason,
        string? accessories,
        string conditionAtTransfer,
        DateOnly? collectionDate,
        long? collectedBy,
        DateOnly? issueDate,
        string handoverAcknowledgement,
        string newAcknowledgement,
        string transferStatus,
        string? remarks)
    {
        if (string.IsNullOrWhiteSpace(transferCode))
        {
            return "Transfer code is required.";
        }

        if (transferCode.Trim().Length > 80)
        {
            return "Transfer code must be 80 characters or fewer.";
        }

        if (!ValidTransferTypes.Contains(transferType))
        {
            return "Transfer type is invalid.";
        }

        if (assetId <= 0)
        {
            return "Asset id must be greater than zero.";
        }

        if (fromDepartmentId <= 0 || toDepartmentId <= 0)
        {
            return "Department id must be greater than zero.";
        }

        if (transferType.Equals("Department Transfer", StringComparison.OrdinalIgnoreCase) && !toDepartmentId.HasValue)
        {
            return "To department is required for department transfer.";
        }

        if (transferStatus.Equals("Reassigned", StringComparison.OrdinalIgnoreCase) && !toDepartmentId.HasValue)
        {
            return "To department is required for reassignment.";
        }

        if (HasValueLongerThan(currentReceiverName, 150))
        {
            return "Current receiver name must be 150 characters or fewer.";
        }

        if (HasValueLongerThan(newReceiverName, 150))
        {
            return "New receiver name must be 150 characters or fewer.";
        }

        if (HasValueLongerThan(transferReason, 150))
        {
            return "Transfer reason must be 150 characters or fewer.";
        }

        if (HasValueLongerThan(accessories, 1000))
        {
            return "Accessories must be 1000 characters or fewer.";
        }

        if (!ValidConditions.Contains(conditionAtTransfer))
        {
            return "Condition at transfer is invalid.";
        }

        if (collectedBy <= 0)
        {
            return "Collected-by user id must be greater than zero.";
        }

        if (issueDate.HasValue && collectionDate.HasValue && issueDate.Value < collectionDate.Value)
        {
            return "Issue date cannot be before collection date.";
        }

        if (!ValidAcknowledgements.Contains(handoverAcknowledgement))
        {
            return "Handover acknowledgement is invalid.";
        }

        if (!ValidAcknowledgements.Contains(newAcknowledgement))
        {
            return "New acknowledgement is invalid.";
        }

        if (HasValueLongerThan(remarks, 1000))
        {
            return "Remarks must be 1000 characters or fewer.";
        }

        return ValidTransferStatuses.Contains(transferStatus) ? null : "Transfer status is invalid.";
    }

    private static string DefaultIfBlank(string? value, string defaultValue)
    {
        return string.IsNullOrWhiteSpace(value) ? defaultValue : value.Trim();
    }

    private static string Normalize(string value, HashSet<string> validValues)
    {
        return validValues.First(validValue =>
            validValue.Equals(value, StringComparison.OrdinalIgnoreCase));
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
