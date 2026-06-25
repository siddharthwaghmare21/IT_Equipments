using ITEquipment.Api.Data;
using ITEquipment.Api.Models;
using MySqlConnector;

namespace ITEquipment.Api.Endpoints;

public static class WorkOrderEndpoints
{
    private static readonly HashSet<string> ValidApprovalStatuses = new(StringComparer.OrdinalIgnoreCase)
    {
        "Pending",
        "Approved",
        "Rejected"
    };

    private static readonly HashSet<string> ValidPaymentStatuses = new(StringComparer.OrdinalIgnoreCase)
    {
        "Pending",
        "Partial",
        "Paid",
        "Not Required"
    };

    private static readonly HashSet<string> ValidReceivedStatuses = new(StringComparer.OrdinalIgnoreCase)
    {
        "Pending",
        "Partially Received",
        "Fully Received"
    };

    private static readonly HashSet<string> ValidInvoiceStatuses = new(StringComparer.OrdinalIgnoreCase)
    {
        "Pending",
        "Uploaded",
        "Not Required"
    };

    private static readonly HashSet<string> ValidWorkOrderStatuses = new(StringComparer.OrdinalIgnoreCase)
    {
        "Draft",
        "Ordered",
        "Received",
        "Cancelled"
    };

    public static RouteGroupBuilder MapWorkOrderEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/work-orders")
            .WithTags("Work Orders")
            .RequireAuthorization(ITEquipment.Api.Security.AppAuthorizationPolicies.RequireAssetWrite);

        group.MapGet("/", async (
            WorkOrderRepository repository,
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
        .WithName("GetWorkOrders");

        group.MapGet("/{workOrderId:long}", async (
            long workOrderId,
            WorkOrderRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            if (workOrderId <= 0)
            {
                return Results.BadRequest(new { message = "Work Order id must be greater than zero." });
            }

            try
            {
                var workOrder = await repository.GetByIdAsync(workOrderId, cancellationToken);
                return workOrder is null ? Results.NotFound() : Results.Ok(workOrder);
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
        .WithName("GetWorkOrderById");

        group.MapPost("/", async (
            WorkOrderCreateRequest request,
            WorkOrderRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            var approvalStatus = DefaultIfBlank(request.ApprovalStatus, "Pending");
            var paymentStatus = DefaultIfBlank(request.PaymentStatus, "Pending");
            var receivedStatus = DefaultIfBlank(request.ReceivedStatus, "Pending");
            var invoiceStatus = DefaultIfBlank(request.InvoiceStatus, "Pending");
            var workOrderStatus = DefaultIfBlank(request.WorkOrderStatus, "Draft");

            var validationError = Validate(
                request.WorkOrderNumber,
                request.VendorId,
                request.InvoiceNumber,
                request.WorkOrderDate,
                request.ExpectedDeliveryDate,
                request.ReceivedDate,
                request.ApprovedBy,
                request.ApprovedAt,
                request.Remarks,
                request.Items,
                approvalStatus,
                paymentStatus,
                receivedStatus,
                invoiceStatus,
                workOrderStatus);
            if (validationError is not null)
            {
                return Results.BadRequest(new { message = validationError });
            }

            try
            {
                var workOrder = await repository.CreateAsync(
                    request,
                    Normalize(approvalStatus, ValidApprovalStatuses),
                    Normalize(paymentStatus, ValidPaymentStatuses),
                    Normalize(receivedStatus, ValidReceivedStatuses),
                    Normalize(invoiceStatus, ValidInvoiceStatuses),
                    Normalize(workOrderStatus, ValidWorkOrderStatuses),
                    cancellationToken);
                return Results.Created($"/api/work-orders/{workOrder.WorkOrderId}", workOrder);
            }
            catch (MySqlException exception) when (exception.Number == 1062)
            {
                return Results.Conflict(new { message = "Work Order number already exists." });
            }
            catch (MySqlException exception) when (exception.Number == 1452)
            {
                return Results.BadRequest(new { message = "Selected vendor, approver, or creator does not exist." });
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
        .WithName("CreateWorkOrder");

        group.MapPut("/{workOrderId:long}", async (
            long workOrderId,
            WorkOrderUpdateRequest request,
            WorkOrderRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            if (workOrderId <= 0)
            {
                return Results.BadRequest(new { message = "Work Order id must be greater than zero." });
            }

            var validationError = Validate(
                request.WorkOrderNumber,
                request.VendorId,
                request.InvoiceNumber,
                request.WorkOrderDate,
                request.ExpectedDeliveryDate,
                request.ReceivedDate,
                request.ApprovedBy,
                request.ApprovedAt,
                request.Remarks,
                request.Items,
                request.ApprovalStatus,
                request.PaymentStatus,
                request.ReceivedStatus,
                request.InvoiceStatus,
                request.WorkOrderStatus);
            if (validationError is not null)
            {
                return Results.BadRequest(new { message = validationError });
            }

            try
            {
                var workOrder = await repository.UpdateAsync(
                    workOrderId,
                    request,
                    Normalize(request.ApprovalStatus, ValidApprovalStatuses),
                    Normalize(request.PaymentStatus, ValidPaymentStatuses),
                    Normalize(request.ReceivedStatus, ValidReceivedStatuses),
                    Normalize(request.InvoiceStatus, ValidInvoiceStatuses),
                    Normalize(request.WorkOrderStatus, ValidWorkOrderStatuses),
                    cancellationToken);
                return workOrder is null ? Results.NotFound() : Results.Ok(workOrder);
            }
            catch (MySqlException exception) when (exception.Number == 1062)
            {
                return Results.Conflict(new { message = "Work Order number already exists." });
            }
            catch (MySqlException exception) when (exception.Number == 1452)
            {
                return Results.BadRequest(new { message = "Selected vendor, approver, or updater does not exist." });
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
        .WithName("UpdateWorkOrder");

        group.MapDelete("/{workOrderId:long}", async (
            long workOrderId,
            WorkOrderRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            if (workOrderId <= 0)
            {
                return Results.BadRequest(new { message = "Work Order id must be greater than zero." });
            }

            try
            {
                var workOrder = await repository.CancelAsync(workOrderId, "Cancelled from API.", cancellationToken);
                return workOrder is null ? Results.NotFound() : Results.Ok(workOrder);
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
        .WithName("CancelWorkOrder");

        return group;
    }

    private static string? Validate(
        string workOrderNumber,
        long vendorId,
        string? invoiceNumber,
        DateOnly workOrderDate,
        DateOnly? expectedDeliveryDate,
        DateOnly? receivedDate,
        long? approvedBy,
        DateTimeOffset? approvedAt,
        string? remarks,
        IReadOnlyList<WorkOrderItemRequest> items,
        string approvalStatus,
        string paymentStatus,
        string receivedStatus,
        string invoiceStatus,
        string workOrderStatus)
    {
        if (string.IsNullOrWhiteSpace(workOrderNumber))
        {
            return "Work Order number is required.";
        }

        if (workOrderNumber.Trim().Length > 80)
        {
            return "Work Order number must be 80 characters or fewer.";
        }

        if (vendorId <= 0)
        {
            return "Vendor id must be greater than zero.";
        }

        if (HasValueLongerThan(invoiceNumber, 100))
        {
            return "Invoice number must be 100 characters or fewer.";
        }

        if (expectedDeliveryDate.HasValue && expectedDeliveryDate.Value < workOrderDate)
        {
            return "Expected delivery date cannot be before Work Order date.";
        }

        if (receivedDate.HasValue && receivedDate.Value < workOrderDate)
        {
            return "Received date cannot be before Work Order date.";
        }

        if (approvedBy <= 0)
        {
            return "Approved-by user id must be greater than zero.";
        }

        if (approvedAt.HasValue && !approvedBy.HasValue)
        {
            return "Approved-by user is required when approved date is provided.";
        }

        if (HasValueLongerThan(remarks, 1000))
        {
            return "Remarks must be 1000 characters or fewer.";
        }

        if (items.Count == 0)
        {
            return "At least one Work Order item is required.";
        }

        var itemValidationError = ValidateItems(items);
        if (itemValidationError is not null)
        {
            return itemValidationError;
        }

        if (!ValidApprovalStatuses.Contains(approvalStatus))
        {
            return "Approval status must be Pending, Approved, or Rejected.";
        }

        if (!ValidPaymentStatuses.Contains(paymentStatus))
        {
            return "Payment status must be Pending, Partial, Paid, or Not Required.";
        }

        if (!ValidReceivedStatuses.Contains(receivedStatus))
        {
            return "Received status must be Pending, Partially Received, or Fully Received.";
        }

        if (!ValidInvoiceStatuses.Contains(invoiceStatus))
        {
            return "Invoice status must be Pending, Uploaded, or Not Required.";
        }

        return ValidWorkOrderStatuses.Contains(workOrderStatus)
            ? null
            : "Work Order status must be Draft, Ordered, Received, or Cancelled.";
    }

    private static string? ValidateItems(IReadOnlyList<WorkOrderItemRequest> items)
    {
        for (var index = 0; index < items.Count; index++)
        {
            var item = items[index];
            var itemNumber = index + 1;

            if (string.IsNullOrWhiteSpace(item.ItemName))
            {
                return $"Item {itemNumber}: item name is required.";
            }

            if (item.ItemName.Trim().Length > 180)
            {
                return $"Item {itemNumber}: item name must be 180 characters or fewer.";
            }

            if (string.IsNullOrWhiteSpace(item.Category))
            {
                return $"Item {itemNumber}: category is required.";
            }

            if (item.Category.Trim().Length > 100)
            {
                return $"Item {itemNumber}: category must be 100 characters or fewer.";
            }

            if (item.Quantity <= 0)
            {
                return $"Item {itemNumber}: quantity must be greater than zero.";
            }

            if (item.UnitPrice < 0)
            {
                return $"Item {itemNumber}: unit price cannot be negative.";
            }

            if (HasValueLongerThan(item.Warranty, 120))
            {
                return $"Item {itemNumber}: warranty must be 120 characters or fewer.";
            }
        }

        return null;
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
