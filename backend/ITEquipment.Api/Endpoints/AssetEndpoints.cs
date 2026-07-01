using ITEquipment.Api.Data;
using ITEquipment.Api.Models;
using MySqlConnector;

namespace ITEquipment.Api.Endpoints;

public static class AssetEndpoints
{
    private static readonly HashSet<string> ValidConditions = new(StringComparer.OrdinalIgnoreCase)
    {
        "New",
        "Good",
        "Working",
        "Needs Repair",
        "Damaged",
        "Retired"
    };

    private static readonly HashSet<string> ValidLifecycleStatuses = new(StringComparer.OrdinalIgnoreCase)
    {
        "In Stock",
        "In Use",
        "Under Maintenance",
        "Returned",
        "Archived",
        "Scrapped"
    };

    private static readonly HashSet<string> ValidAssetStatuses = new(StringComparer.OrdinalIgnoreCase)
    {
        "Available",
        "Delivered",
        "Maintenance",
        "Damaged",
        "Archived",
        "Scrapped"
    };

    public static RouteGroupBuilder MapAssetEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/assets")
            .WithTags("Assets")
            .RequireAuthorization(ITEquipment.Api.Security.AppAuthorizationPolicies.RequireReportsRead);

        group.MapGet("/", async (
            AssetRepository repository,
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
        .WithName("GetAssets");

        group.MapGet("/{assetId:long}", async (
            long assetId,
            AssetRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            if (assetId <= 0)
            {
                return Results.BadRequest(new { message = "Asset id must be greater than zero." });
            }

            try
            {
                var asset = await repository.GetByIdAsync(assetId, cancellationToken);
                return asset is null ? Results.NotFound() : Results.Ok(asset);
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
        .WithName("GetAssetById");

        group.MapGet("/{assetId:long}/history", async (
            long assetId,
            AssetRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            if (assetId <= 0)
            {
                return Results.BadRequest(new { message = "Asset id must be greater than zero." });
            }

            try
            {
                var asset = await repository.GetByIdAsync(assetId, cancellationToken);
                if (asset is null)
                {
                    return Results.NotFound();
                }

                return Results.Ok(await repository.GetHistoryAsync(assetId, cancellationToken));
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
        .WithName("GetAssetHistory");

        group.MapPost("/", async (
            AssetCreateRequest request,
            AssetRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            var assetCondition = string.IsNullOrWhiteSpace(request.AssetCondition) ? "New" : request.AssetCondition.Trim();
            var lifecycleStatus = string.IsNullOrWhiteSpace(request.LifecycleStatus) ? "In Stock" : request.LifecycleStatus.Trim();
            var assetStatus = string.IsNullOrWhiteSpace(request.AssetStatus) ? "Available" : request.AssetStatus.Trim();
            var validationError = Validate(request, assetCondition, lifecycleStatus, assetStatus);
            if (validationError is not null)
            {
                return Results.BadRequest(new { message = validationError });
            }

            var normalizedRequest = request with
            {
                AssetCondition = Normalize(assetCondition, ValidConditions),
                LifecycleStatus = Normalize(lifecycleStatus, ValidLifecycleStatuses),
                AssetStatus = Normalize(assetStatus, ValidAssetStatuses)
            };

            try
            {
                var asset = await repository.CreateAsync(normalizedRequest, cancellationToken);
                return Results.Created($"/api/assets/{asset.AssetId}", asset);
            }
            catch (MySqlException exception) when (exception.Number == 1062)
            {
                return Results.Conflict(new { message = "Asset tag or serial number already exists." });
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
        .WithName("CreateAsset");

        group.MapPut("/{assetId:long}", async (
            long assetId,
            AssetUpdateRequest request,
            AssetRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            if (assetId <= 0)
            {
                return Results.BadRequest(new { message = "Asset id must be greater than zero." });
            }

            var validationError = Validate(request);
            if (validationError is not null)
            {
                return Results.BadRequest(new { message = validationError });
            }

            var normalizedRequest = request with
            {
                AssetCondition = Normalize(request.AssetCondition, ValidConditions),
                LifecycleStatus = Normalize(request.LifecycleStatus, ValidLifecycleStatuses),
                AssetStatus = Normalize(request.AssetStatus, ValidAssetStatuses)
            };

            try
            {
                var asset = await repository.UpdateAsync(assetId, normalizedRequest, cancellationToken);
                return asset is null ? Results.NotFound() : Results.Ok(asset);
            }
            catch (MySqlException exception) when (exception.Number == 1062)
            {
                return Results.Conflict(new { message = "Asset tag or serial number already exists." });
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
        .WithName("UpdateAsset");

        group.MapDelete("/{assetId:long}", async (
            long assetId,
            AssetRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            if (assetId <= 0)
            {
                return Results.BadRequest(new { message = "Asset id must be greater than zero." });
            }

            try
            {
                var asset = await repository.ArchiveAsync(assetId, null, cancellationToken);
                return asset is null ? Results.NotFound() : Results.Ok(asset);
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
        .WithName("ArchiveAsset");

        group.MapPost("/{assetId:long}/archive", async (
            long assetId,
            AssetArchiveRequest request,
            AssetRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            if (assetId <= 0)
            {
                return Results.BadRequest(new { message = "Asset id must be greater than zero." });
            }

            if (HasValueLongerThan(request.Remarks, 1000))
            {
                return Results.BadRequest(new { message = "Archive remarks must be 1000 characters or fewer." });
            }

            try
            {
                var asset = await repository.ArchiveAsync(assetId, request.Remarks, cancellationToken);
                return asset is null ? Results.NotFound() : Results.Ok(asset);
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
        .WithName("ArchiveAssetWithRemarks");

        return group;
    }

    private static string? Validate(AssetCreateRequest request, string assetCondition, string lifecycleStatus, string assetStatus)
    {
        return Validate(
            request.AssetTag,
            request.AssetName,
            request.Category,
            request.Brand,
            request.Model,
            request.SerialNumber,
            request.WorkOrderRef,
            request.InvoiceNumber,
            request.PurchaseDate,
            request.WarrantyExpiry,
            request.CustodianDepartmentId,
            request.CurrentDepartmentId,
            request.CurrentReceiverName,
            request.Location,
            assetCondition,
            lifecycleStatus,
            assetStatus,
            request.QrCode);
    }

    private static string? Validate(AssetUpdateRequest request)
    {
        return Validate(
            request.AssetTag,
            request.AssetName,
            request.Category,
            request.Brand,
            request.Model,
            request.SerialNumber,
            request.WorkOrderRef,
            request.InvoiceNumber,
            request.PurchaseDate,
            request.WarrantyExpiry,
            request.CustodianDepartmentId,
            request.CurrentDepartmentId,
            request.CurrentReceiverName,
            request.Location,
            request.AssetCondition,
            request.LifecycleStatus,
            request.AssetStatus,
            request.QrCode);
    }

    private static string? Validate(
        string assetTag,
        string assetName,
        string category,
        string? brand,
        string? model,
        string serialNumber,
        string? workOrderRef,
        string? invoiceNumber,
        DateOnly? purchaseDate,
        DateOnly? warrantyExpiry,
        long? custodianDepartmentId,
        long? currentDepartmentId,
        string? currentReceiverName,
        string? location,
        string assetCondition,
        string lifecycleStatus,
        string assetStatus,
        string? qrCode)
    {
        if (string.IsNullOrWhiteSpace(assetTag))
        {
            return "Asset tag is required.";
        }

        if (string.IsNullOrWhiteSpace(assetName))
        {
            return "Asset name is required.";
        }

        if (string.IsNullOrWhiteSpace(category))
        {
            return "Category is required.";
        }

        if (string.IsNullOrWhiteSpace(serialNumber))
        {
            return "Serial number is required.";
        }

        if (assetTag.Trim().Length > 80)
        {
            return "Asset tag must be 80 characters or fewer.";
        }

        if (assetName.Trim().Length > 180)
        {
            return "Asset name must be 180 characters or fewer.";
        }

        if (category.Trim().Length > 100)
        {
            return "Category must be 100 characters or fewer.";
        }

        if (HasValueLongerThan(brand, 100))
        {
            return "Brand must be 100 characters or fewer.";
        }

        if (HasValueLongerThan(model, 120))
        {
            return "Model must be 120 characters or fewer.";
        }

        if (serialNumber.Trim().Length > 150)
        {
            return "Serial number must be 150 characters or fewer.";
        }

        if (HasValueLongerThan(workOrderRef, 80))
        {
            return "Work order reference must be 80 characters or fewer.";
        }

        if (HasValueLongerThan(invoiceNumber, 100))
        {
            return "Invoice number must be 100 characters or fewer.";
        }

        if (purchaseDate.HasValue && warrantyExpiry.HasValue && warrantyExpiry.Value < purchaseDate.Value)
        {
            return "Warranty expiry cannot be before purchase date.";
        }

        if (custodianDepartmentId <= 0 || currentDepartmentId <= 0)
        {
            return "Department id must be greater than zero.";
        }

        if (HasValueLongerThan(currentReceiverName, 150))
        {
            return "Current receiver name must be 150 characters or fewer.";
        }

        if (HasValueLongerThan(location, 200))
        {
            return "Location must be 200 characters or fewer.";
        }

        if (!ValidConditions.Contains(assetCondition))
        {
            return "Asset condition is invalid.";
        }

        if (!ValidLifecycleStatuses.Contains(lifecycleStatus))
        {
            return "Lifecycle status is invalid.";
        }

        if (!ValidAssetStatuses.Contains(assetStatus))
        {
            return "Asset status is invalid.";
        }

        return HasValueLongerThan(qrCode, 150)
            ? "QR code must be 150 characters or fewer."
            : null;
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

