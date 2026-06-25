using ITEquipment.Api.Data;
using ITEquipment.Api.Models;
using MySqlConnector;

namespace ITEquipment.Api.Endpoints;

public static class AssetDocumentEndpoints
{
    private const long MaxPlannedFileSizeBytes = 10 * 1024 * 1024;

    private static readonly HashSet<string> ValidDocumentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "Invoice",
        "Warranty Card",
        "Acknowledgement",
        "Photo",
        "Other"
    };

    public static RouteGroupBuilder MapAssetDocumentEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/assets")
            .WithTags("Asset Documents")
            .RequireAuthorization(ITEquipment.Api.Security.AppAuthorizationPolicies.RequireAssetWrite);

        group.MapGet("/document-storage-plan", () =>
        {
            return Results.Ok(new
            {
                storageStatus = "Planned",
                currentApiScope = "Document metadata only. Binary file upload will be connected after storage policy is finalized.",
                acceptedDocumentTypes = ValidDocumentTypes.OrderBy(documentType => documentType),
                plannedMaxFileSizeBytes = MaxPlannedFileSizeBytes,
                plannedStorageOptions = new[]
                {
                    "Local development folder with database metadata",
                    "Online object storage with private signed URLs",
                    "Antivirus/file validation before final production use"
                }
            });
        })
        .WithName("GetAssetDocumentStoragePlan");

        group.MapGet("/{assetId:long}/documents", async (
            long assetId,
            AssetRepository assetRepository,
            AssetDocumentRepository documentRepository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            if (assetId <= 0)
            {
                return Results.BadRequest(new { message = "Asset id must be greater than zero." });
            }

            try
            {
                var asset = await assetRepository.GetByIdAsync(assetId, cancellationToken);
                if (asset is null)
                {
                    return Results.NotFound(new { message = "Asset not found." });
                }

                return Results.Ok(await documentRepository.GetByAssetIdAsync(assetId, cancellationToken));
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
        .WithName("GetAssetDocuments");

        group.MapPost("/{assetId:long}/documents", async (
            long assetId,
            AssetDocumentCreateRequest request,
            AssetDocumentRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            if (assetId <= 0)
            {
                return Results.BadRequest(new { message = "Asset id must be greater than zero." });
            }

            var documentType = string.IsNullOrWhiteSpace(request.DocumentType)
                ? "Other"
                : request.DocumentType.Trim();
            var validationError = Validate(request, documentType);
            if (validationError is not null)
            {
                return Results.BadRequest(new { message = validationError });
            }

            var normalizedDocumentType = NormalizeDocumentType(documentType);

            try
            {
                var document = await repository.CreateAsync(assetId, request, normalizedDocumentType, cancellationToken);
                return Results.Created($"/api/assets/{assetId}/documents/{document.DocumentId}", document);
            }
            catch (MySqlException exception) when (exception.Number == 1452)
            {
                return Results.BadRequest(new { message = "Selected asset or uploaded-by user does not exist." });
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
        .WithName("CreateAssetDocumentMetadata");

        group.MapDelete("/{assetId:long}/documents/{documentId:long}", async (
            long assetId,
            long documentId,
            AssetDocumentRepository repository,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            if (assetId <= 0 || documentId <= 0)
            {
                return Results.BadRequest(new { message = "Asset id and document id must be greater than zero." });
            }

            try
            {
                return await repository.DeleteAsync(assetId, documentId, cancellationToken)
                    ? Results.NoContent()
                    : Results.NotFound();
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
        .WithName("DeleteAssetDocumentMetadata");

        return group;
    }

    private static string? Validate(AssetDocumentCreateRequest request, string documentType)
    {
        if (!ValidDocumentTypes.Contains(documentType))
        {
            return "Document type must be Invoice, Warranty Card, Acknowledgement, Photo, or Other.";
        }

        if (string.IsNullOrWhiteSpace(request.FileName))
        {
            return "File name is required.";
        }

        if (request.FileName.Trim().Length > 255)
        {
            return "File name must be 255 characters or fewer.";
        }

        if (HasValueLongerThan(request.FilePath, 500))
        {
            return "File path must be 500 characters or fewer.";
        }

        if (request.FileSizeBytes <= 0)
        {
            return "File size must be greater than zero.";
        }

        if (request.FileSizeBytes > MaxPlannedFileSizeBytes)
        {
            return "File size must be 10 MB or smaller.";
        }

        if (HasValueLongerThan(request.MimeType, 120))
        {
            return "MIME type must be 120 characters or fewer.";
        }

        return request.UploadedBy <= 0
            ? "Uploaded-by user id must be greater than zero."
            : null;
    }

    private static string NormalizeDocumentType(string documentType)
    {
        return ValidDocumentTypes.First(validType =>
            validType.Equals(documentType, StringComparison.OrdinalIgnoreCase));
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
