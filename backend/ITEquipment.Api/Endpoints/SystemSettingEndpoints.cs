using ITEquipment.Api.Data;
using ITEquipment.Api.Models;
using ITEquipment.Api.Security;
using MySqlConnector;

namespace ITEquipment.Api.Endpoints;

public static class SystemSettingEndpoints
{
    public static RouteGroupBuilder MapSystemSettingEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/settings")
            .WithTags("Settings");

        group.MapGet("/public", async (
            SystemSettingRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            try
            {
                return Results.Ok(await repository.GetPublicAsync(cancellationToken));
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
        .WithName("GetPublicSettings");

        group.MapGet("/report-branding", async (
            SystemSettingRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            try
            {
                return Results.Ok(await repository.GetReportBrandingAsync(cancellationToken));
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
        .WithName("GetReportBrandingSettings");

        group.MapPut("/report-branding", async (
            IReadOnlyList<SystemSettingUpdateRequest> request,
            SystemSettingRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            if (request.Count == 0)
            {
                return Results.BadRequest(new { message = "At least one setting is required." });
            }

            try
            {
                return Results.Ok(await repository.UpdateReportBrandingAsync(request, cancellationToken));
            }
            catch (InvalidOperationException exception)
            {
                return Results.BadRequest(new { message = exception.Message });
            }
            catch (MySqlException exception)
            {
                return DatabaseProblem(environment, exception);
            }
        })
        .RequireAuthorization(AppAuthorizationPolicies.RequireAdminOrSuperAdmin)
        .WithName("UpdateReportBrandingSettings");

        return group;
    }

    private static IResult DatabaseProblem(IHostEnvironment environment, MySqlException exception)
    {
        var detail = environment.IsDevelopment()
            ? $"Database connection failed: {exception.Message}"
            : "Database connection failed.";

        return Results.Problem(detail, statusCode: StatusCodes.Status503ServiceUnavailable);
    }
}
