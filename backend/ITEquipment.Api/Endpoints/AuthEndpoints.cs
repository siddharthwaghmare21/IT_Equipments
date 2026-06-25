using ITEquipment.Api.Data;
using ITEquipment.Api.Models;
using ITEquipment.Api.Services;
using Microsoft.AspNetCore.Mvc;
using MySqlConnector;

namespace ITEquipment.Api.Endpoints;

public static class AuthEndpoints
{
    public static RouteGroupBuilder MapAuthEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/auth").WithTags("Authentication");

        group.MapPost("/bootstrap-super-admin", async (
            SuperAdminBootstrapRequest request,
            [FromHeader(Name = "X-Setup-Key")] string? setupKey,
            IConfiguration configuration,
            AuthRepository repository,
            PasswordHashService passwordHashService,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            var configuredSetupKey = configuration["Bootstrap:SetupKey"];
            if (string.IsNullOrWhiteSpace(configuredSetupKey))
            {
                return Results.Problem(
                    "Bootstrap setup key is not configured.",
                    statusCode: StatusCodes.Status503ServiceUnavailable);
            }

            if (!string.Equals(setupKey, configuredSetupKey, StringComparison.Ordinal))
            {
                return Results.Unauthorized();
            }

            var validationError = ValidateBootstrapRequest(request);
            if (validationError is not null)
            {
                return Results.BadRequest(new { message = validationError });
            }

            try
            {
                if (await repository.HasActiveSuperAdminAsync(cancellationToken))
                {
                    return Results.Conflict(new { message = "Active Super Admin already exists." });
                }

                var passwordHash = passwordHashService.HashPassword(request.Password);
                var user = await repository.CreateSuperAdminAsync(request, passwordHash, cancellationToken);
                return Results.Created($"/api/users/{user.UserId}", user);
            }
            catch (MySqlException exception) when (exception.Number == 1062)
            {
                return Results.Conflict(new { message = "Email already exists." });
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
                var detail = environment.IsDevelopment()
                    ? $"Database connection failed: {exception.Message}"
                    : "Database connection failed.";

                return Results.Problem(detail, statusCode: StatusCodes.Status503ServiceUnavailable);
            }
        })
        .WithName("BootstrapSuperAdmin");

        return group;
    }

    private static string? ValidateBootstrapRequest(SuperAdminBootstrapRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FullName))
        {
            return "Full name is required.";
        }

        if (request.FullName.Length > 150)
        {
            return "Full name must be 150 characters or fewer.";
        }

        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return "Email is required.";
        }

        if (request.Email.Length > 150 || !request.Email.Contains('@', StringComparison.Ordinal))
        {
            return "Valid email is required.";
        }

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 8)
        {
            return "Password must be at least 8 characters.";
        }

        return null;
    }
}
