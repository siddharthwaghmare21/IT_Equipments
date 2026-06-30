using ITEquipment.Api.Data;
using ITEquipment.Api.Security;
using MySqlConnector;

namespace ITEquipment.Api.Endpoints;

public static class ReportEndpoints
{
    public static RouteGroupBuilder MapReportEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/reports")
            .WithTags("Reports")
            .RequireAuthorization(AppAuthorizationPolicies.RequireReportsRead);

        group.MapGet("/", (ReportRepository repository) =>
            Results.Ok(new { reportTypes = repository.GetAvailableReportTypes() }))
            .WithName("GetAvailableReports");

        group.MapGet("/{reportType}", async (
            string reportType,
            ReportRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            try
            {
                var report = await repository.GetReportAsync(reportType, cancellationToken);
                return report is null
                    ? Results.NotFound(new { message = "Report type does not exist." })
                    : Results.Ok(report);
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
        .WithName("GetReportData");

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
