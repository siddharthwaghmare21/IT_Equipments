using System.Security.Claims;
using ITEquipment.Api.Data;
using ITEquipment.Api.Models;
using ITEquipment.Api.Security;
using MySqlConnector;

namespace ITEquipment.Api.Endpoints;

public static class ExportImportBackupEndpoints
{
    private static readonly HashSet<string> ExportTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "PDF",
        "Excel",
        "CSV"
    };

    private static readonly HashSet<string> BackupTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "Manual",
        "Scheduled"
    };

    private static readonly HashSet<string> BackupScopes = new(StringComparer.OrdinalIgnoreCase)
    {
        "Full Database",
        "Schema Only",
        "Data Only"
    };

    public static IEndpointRouteBuilder MapExportImportBackupEndpoints(this IEndpointRouteBuilder routes)
    {
        var exportGroup = routes.MapGroup("/api/export-jobs")
            .WithTags("Export Jobs")
            .RequireAuthorization(AppAuthorizationPolicies.RequireReportsRead);

        exportGroup.MapGet("/", async (
            int? limit,
            ExportImportBackupRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            try
            {
                return Results.Ok(await repository.GetExportJobsAsync(limit ?? 100, cancellationToken));
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
        .WithName("GetExportJobs");

        exportGroup.MapPost("/", async (
            ExportJobCreateRequest request,
            ClaimsPrincipal user,
            ExportImportBackupRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            var validationError = ValidateExport(request);
            if (validationError is not null)
            {
                return Results.BadRequest(new { message = validationError });
            }

            try
            {
                var job = await repository.CreateExportJobAsync(
                    request with
                    {
                        ExportType = Normalize(request.ExportType, ExportTypes),
                        ExportModule = request.ExportModule.Trim()
                    },
                    GetUserId(user),
                    cancellationToken);
                return Results.Created($"/api/export-jobs/{job.ExportJobId}", job);
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
        .WithName("CreateExportJob");

        var importGroup = routes.MapGroup("/api/import-jobs")
            .WithTags("Import Jobs")
            .RequireAuthorization(AppAuthorizationPolicies.RequireAssetWrite);

        importGroup.MapGet("/", async (
            int? limit,
            ExportImportBackupRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            try
            {
                return Results.Ok(await repository.GetImportJobsAsync(limit ?? 100, cancellationToken));
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
        .WithName("GetImportJobs");

        importGroup.MapPost("/", async (
            ImportJobCreateRequest request,
            ClaimsPrincipal user,
            ExportImportBackupRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            var validationError = ValidateImport(request);
            if (validationError is not null)
            {
                return Results.BadRequest(new { message = validationError });
            }

            try
            {
                var job = await repository.CreateImportJobAsync(
                    request with { ImportModule = request.ImportModule.Trim() },
                    GetUserId(user),
                    cancellationToken);
                return Results.Created($"/api/import-jobs/{job.ImportJobId}", job);
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
        .WithName("CreateImportJob");

        var backupGroup = routes.MapGroup("/api/backup-jobs")
            .WithTags("Backup Jobs")
            .RequireAuthorization(AppAuthorizationPolicies.RequireBackupAccess);

        backupGroup.MapGet("/", async (
            int? limit,
            ExportImportBackupRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            try
            {
                return Results.Ok(await repository.GetBackupJobsAsync(limit ?? 100, cancellationToken));
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
        .WithName("GetBackupJobs");

        backupGroup.MapPost("/", async (
            BackupJobCreateRequest request,
            ClaimsPrincipal user,
            ExportImportBackupRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            var validationError = ValidateBackup(request);
            if (validationError is not null)
            {
                return Results.BadRequest(new { message = validationError });
            }

            try
            {
                var job = await repository.CreateBackupJobAsync(
                    request with
                    {
                        BackupType = Normalize(request.BackupType, BackupTypes),
                        BackupScope = Normalize(request.BackupScope, BackupScopes)
                    },
                    GetUserId(user),
                    cancellationToken);
                return Results.Created($"/api/backup-jobs/{job.BackupJobId}", job);
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
        .WithName("CreateBackupJob");

        return routes;
    }

    private static string? ValidateExport(ExportJobCreateRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.ExportType) || !ExportTypes.Contains(request.ExportType))
        {
            return "Export type must be PDF, Excel or CSV.";
        }

        if (string.IsNullOrWhiteSpace(request.ExportModule) || request.ExportModule.Trim().Length > 100)
        {
            return "Export module is required and must be 100 characters or fewer.";
        }

        if (request.RowCount < 0)
        {
            return "Row count cannot be negative.";
        }

        return HasValueLongerThan(request.Remarks, 1000)
            ? "Remarks must be 1000 characters or fewer."
            : null;
    }

    private static string? ValidateImport(ImportJobCreateRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.ImportModule) || request.ImportModule.Trim().Length > 100)
        {
            return "Import module is required and must be 100 characters or fewer.";
        }

        if (HasValueLongerThan(request.SourceFileName, 255))
        {
            return "Source file name must be 255 characters or fewer.";
        }

        if (request.SourceFileSizeBytes < 0 || request.TotalRows < 0 ||
            request.ValidRows < 0 || request.InvalidRows < 0)
        {
            return "Import counts and file size cannot be negative.";
        }

        return HasValueLongerThan(request.Remarks, 1000)
            ? "Remarks must be 1000 characters or fewer."
            : null;
    }

    private static string? ValidateBackup(BackupJobCreateRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.BackupType) || !BackupTypes.Contains(request.BackupType))
        {
            return "Backup type must be Manual or Scheduled.";
        }

        if (string.IsNullOrWhiteSpace(request.BackupScope) || !BackupScopes.Contains(request.BackupScope))
        {
            return "Backup scope must be Full Database, Schema Only or Data Only.";
        }

        return HasValueLongerThan(request.Remarks, 1000)
            ? "Remarks must be 1000 characters or fewer."
            : null;
    }

    private static long? GetUserId(ClaimsPrincipal user)
    {
        var userIdValue = user.FindFirstValue(ClaimTypes.NameIdentifier) ??
            user.FindFirstValue("sub");
        return long.TryParse(userIdValue, out var userId) ? userId : null;
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
