using ITEquipment.Api.Data;
using ITEquipment.Api.Models;
using MySqlConnector;

namespace ITEquipment.Api.Endpoints;

public static class DeliveryEndpoints
{
    private static readonly HashSet<string> ValidAcknowledgementStatuses = new(StringComparer.OrdinalIgnoreCase)
    {
        "Pending",
        "Acknowledged",
        "Rejected"
    };

    private static readonly HashSet<string> ValidDeliveryStatuses = new(StringComparer.OrdinalIgnoreCase)
    {
        "Pending",
        "Delivered",
        "Cancelled"
    };

    public static RouteGroupBuilder MapDeliveryEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/deliveries")
            .WithTags("Deliveries")
            .RequireAuthorization(ITEquipment.Api.Security.AppAuthorizationPolicies.RequireAssetWrite);

        group.MapGet("/", async (
            DeliveryRepository repository,
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
        .WithName("GetDeliveries");

        group.MapGet("/{deliveryId:long}", async (
            long deliveryId,
            DeliveryRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            if (deliveryId <= 0)
            {
                return Results.BadRequest(new { message = "Delivery id must be greater than zero." });
            }

            try
            {
                var delivery = await repository.GetByIdAsync(deliveryId, cancellationToken);
                return delivery is null ? Results.NotFound() : Results.Ok(delivery);
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
        .WithName("GetDeliveryById");

        group.MapPost("/", async (
            DeliveryCreateRequest request,
            DeliveryRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            var acknowledgementStatus = DefaultIfBlank(request.AcknowledgementStatus, "Pending");
            var deliveryStatus = DefaultIfBlank(request.DeliveryStatus, "Pending");
            var validationError = Validate(
                request.DeliveryCode,
                request.AssetId,
                request.DepartmentId,
                request.ReceiverName,
                request.DeliveredBy,
                request.Accessories,
                request.Remarks,
                acknowledgementStatus,
                deliveryStatus);
            if (validationError is not null)
            {
                return Results.BadRequest(new { message = validationError });
            }

            try
            {
                var delivery = await repository.CreateAsync(
                    request,
                    Normalize(acknowledgementStatus, ValidAcknowledgementStatuses),
                    Normalize(deliveryStatus, ValidDeliveryStatuses),
                    cancellationToken);
                return Results.Created($"/api/deliveries/{delivery.DeliveryId}", delivery);
            }
            catch (MySqlException exception) when (exception.Number == 1062)
            {
                return Results.Conflict(new { message = "Delivery code already exists." });
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
        .WithName("CreateDelivery");

        group.MapPut("/{deliveryId:long}", async (
            long deliveryId,
            DeliveryUpdateRequest request,
            DeliveryRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            if (deliveryId <= 0)
            {
                return Results.BadRequest(new { message = "Delivery id must be greater than zero." });
            }

            var validationError = Validate(
                request.DeliveryCode,
                request.AssetId,
                request.DepartmentId,
                request.ReceiverName,
                request.DeliveredBy,
                request.Accessories,
                request.Remarks,
                request.AcknowledgementStatus,
                request.DeliveryStatus);
            if (validationError is not null)
            {
                return Results.BadRequest(new { message = validationError });
            }

            try
            {
                var delivery = await repository.UpdateAsync(
                    deliveryId,
                    request,
                    Normalize(request.AcknowledgementStatus, ValidAcknowledgementStatuses),
                    Normalize(request.DeliveryStatus, ValidDeliveryStatuses),
                    cancellationToken);
                return delivery is null ? Results.NotFound() : Results.Ok(delivery);
            }
            catch (MySqlException exception) when (exception.Number == 1062)
            {
                return Results.Conflict(new { message = "Delivery code already exists." });
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
        .WithName("UpdateDelivery");

        group.MapDelete("/{deliveryId:long}", async (
            long deliveryId,
            DeliveryRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            if (deliveryId <= 0)
            {
                return Results.BadRequest(new { message = "Delivery id must be greater than zero." });
            }

            try
            {
                var delivery = await repository.CancelAsync(deliveryId, "Cancelled from API.", cancellationToken);
                return delivery is null ? Results.NotFound() : Results.Ok(delivery);
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
        .WithName("CancelDelivery");

        return group;
    }

    private static string? Validate(
        string deliveryCode,
        long assetId,
        long departmentId,
        string receiverName,
        long? deliveredBy,
        string? accessories,
        string? remarks,
        string acknowledgementStatus,
        string deliveryStatus)
    {
        if (string.IsNullOrWhiteSpace(deliveryCode))
        {
            return "Delivery code is required.";
        }

        if (deliveryCode.Trim().Length > 80)
        {
            return "Delivery code must be 80 characters or fewer.";
        }

        if (assetId <= 0)
        {
            return "Asset id must be greater than zero.";
        }

        if (departmentId <= 0)
        {
            return "Department id must be greater than zero.";
        }

        if (string.IsNullOrWhiteSpace(receiverName))
        {
            return "Receiver name is required.";
        }

        if (receiverName.Trim().Length > 150)
        {
            return "Receiver name must be 150 characters or fewer.";
        }

        if (deliveredBy <= 0)
        {
            return "Delivered-by user id must be greater than zero.";
        }

        if (HasValueLongerThan(accessories, 1000))
        {
            return "Accessories must be 1000 characters or fewer.";
        }

        if (HasValueLongerThan(remarks, 1000))
        {
            return "Remarks must be 1000 characters or fewer.";
        }

        if (!ValidAcknowledgementStatuses.Contains(acknowledgementStatus))
        {
            return "Acknowledgement status must be Pending, Acknowledged, or Rejected.";
        }

        return ValidDeliveryStatuses.Contains(deliveryStatus)
            ? null
            : "Delivery status must be Pending, Delivered, or Cancelled.";
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
