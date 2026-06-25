using ITEquipment.Api.Data;
using ITEquipment.Api.Models;
using MySqlConnector;

namespace ITEquipment.Api.Endpoints;

public static class ApprovalEndpoints
{
    public static RouteGroupBuilder MapApprovalEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/approvals").WithTags("Approvals");

        group.MapGet("/user-access/pending", async (
            ApprovalRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            try
            {
                return Results.Ok(await repository.GetPendingUserAccessRequestsAsync(cancellationToken));
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
        .WithName("GetPendingUserAccessApprovals");

        group.MapPost("/user-access/{approvalRequestId:long}/approve", async (
            long approvalRequestId,
            ApprovalDecisionRequest request,
            ApprovalRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            var validationError = ValidateDecisionRequest(request);
            if (validationError is not null)
            {
                return Results.BadRequest(new { message = validationError });
            }

            try
            {
                var response = await repository.ApproveUserAccessAsync(approvalRequestId, request, cancellationToken);
                return response is null ? Results.NotFound() : Results.Ok(response);
            }
            catch (MySqlException exception) when (exception.Number == 1452)
            {
                return Results.BadRequest(new { message = "Approver user does not exist." });
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
        .WithName("ApproveUserAccess");

        group.MapPost("/user-access/{approvalRequestId:long}/reject", async (
            long approvalRequestId,
            ApprovalDecisionRequest request,
            ApprovalRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            var validationError = ValidateDecisionRequest(request);
            if (validationError is not null)
            {
                return Results.BadRequest(new { message = validationError });
            }

            try
            {
                var response = await repository.RejectUserAccessAsync(approvalRequestId, request, cancellationToken);
                return response is null ? Results.NotFound() : Results.Ok(response);
            }
            catch (MySqlException exception) when (exception.Number == 1452)
            {
                return Results.BadRequest(new { message = "Approver user does not exist." });
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
        .WithName("RejectUserAccess");

        return group;
    }

    private static string? ValidateDecisionRequest(ApprovalDecisionRequest request)
    {
        return request.ApprovedByUserId <= 0 ? "Approver user is required." : null;
    }

    private static IResult DatabaseProblem(IHostEnvironment environment, MySqlException exception)
    {
        var detail = environment.IsDevelopment()
            ? $"Database connection failed: {exception.Message}"
            : "Database connection failed.";

        return Results.Problem(detail, statusCode: StatusCodes.Status503ServiceUnavailable);
    }
}
