using ITEquipment.Api.Data;
using ITEquipment.Api.Models;
using ITEquipment.Api.Services;
using Microsoft.AspNetCore.Mvc;
using MySqlConnector;

namespace ITEquipment.Api.Endpoints;

public static class AuthEndpoints
{
    private static readonly HashSet<string> AllowedSignupRoleCodes = new(StringComparer.OrdinalIgnoreCase)
    {
        "ADMIN",
        "EMPLOYEE",
        "VIEWER"
    };

    private static readonly HashSet<string> AllowedOtpPurposes = new(StringComparer.OrdinalIgnoreCase)
    {
        "Signup Verification",
        "Login Verification",
        "Password Reset"
    };

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

        group.MapPost("/login", async (
            LoginRequest request,
            AuthRepository repository,
            PasswordHashService passwordHashService,
            JwtTokenService jwtTokenService,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            var validationError = ValidateLoginRequest(request);
            if (validationError is not null)
            {
                return Results.BadRequest(new { message = validationError });
            }

            try
            {
                var loginUser = await repository.GetLoginUserByEmailAsync(request.Email, cancellationToken);
                if (loginUser is null || !passwordHashService.VerifyPassword(request.Password, loginUser.PasswordHash))
                {
                    return Results.Unauthorized();
                }

                if (!string.Equals(loginUser.User.AccountStatus, "Active", StringComparison.OrdinalIgnoreCase))
                {
                    return Results.StatusCode(StatusCodes.Status403Forbidden);
                }

                if (!loginUser.User.EmailVerified)
                {
                    return Results.BadRequest(new { message = "Email is not verified." });
                }

                var updatedUser = await repository.MarkLoginSuccessAsync(loginUser.User.UserId, cancellationToken)
                    ?? loginUser.User;

                var token = jwtTokenService.CreateToken(updatedUser);
                return Results.Ok(new LoginResponse(updatedUser, "Login successful.", token));
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
        .WithName("Login");

        group.MapPost("/signup-request", async (
            SignupRequest request,
            AuthRepository repository,
            PasswordHashService passwordHashService,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            var validationError = ValidateSignupRequest(request);
            if (validationError is not null)
            {
                return Results.BadRequest(new { message = validationError });
            }

            try
            {
                var passwordHash = passwordHashService.HashPassword(request.Password);
                var response = await repository.CreateSignupRequestAsync(request, passwordHash, cancellationToken);
                return Results.Created($"/api/users/{response.User.UserId}", response);
            }
            catch (MySqlException exception) when (exception.Number == 1062)
            {
                return Results.Conflict(new { message = "Email already exists." });
            }
            catch (MySqlException exception) when (exception.Number == 1452)
            {
                return Results.BadRequest(new { message = "Selected department or role does not exist." });
            }
            catch (InvalidOperationException exception)
            {
                return Results.BadRequest(new { message = exception.Message });
            }
            catch (MySqlException exception)
            {
                var detail = environment.IsDevelopment()
                    ? $"Database connection failed: {exception.Message}"
                    : "Database connection failed.";

                return Results.Problem(detail, statusCode: StatusCodes.Status503ServiceUnavailable);
            }
        })
        .WithName("SignupRequest");

        group.MapPost("/email-otp/request", async (
            OtpRequest request,
            AuthRepository repository,
            OtpService otpService,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            var validationError = ValidateOtpRequest(request.Email, request.Purpose);
            if (validationError is not null)
            {
                return Results.BadRequest(new { message = validationError });
            }

            var purpose = Normalize(request.Purpose, AllowedOtpPurposes);
            var otpCode = otpService.GenerateOtpCode();
            var otpHash = otpService.HashOtp(otpCode);

            try
            {
                var response = await repository.CreateEmailOtpAsync(request.Email, purpose, otpHash, cancellationToken);
                var responseWithDevOtp = environment.IsDevelopment()
                    ? response with { DevelopmentOtpCode = otpCode }
                    : response;

                return Results.Created($"/api/auth/email-otp/{response.OtpRequestId}", responseWithDevOtp);
            }
            catch (InvalidOperationException exception)
            {
                return Results.BadRequest(new { message = exception.Message });
            }
            catch (MySqlException exception)
            {
                var detail = environment.IsDevelopment()
                    ? $"Database connection failed: {exception.Message}"
                    : "Database connection failed.";

                return Results.Problem(detail, statusCode: StatusCodes.Status503ServiceUnavailable);
            }
        })
        .WithName("RequestEmailOtp");

        group.MapPost("/email-otp/verify", async (
            OtpVerifyRequest request,
            AuthRepository repository,
            OtpService otpService,
            IHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            var validationError = ValidateOtpRequest(request.Email, request.Purpose);
            if (validationError is not null)
            {
                return Results.BadRequest(new { message = validationError });
            }

            if (string.IsNullOrWhiteSpace(request.OtpCode) || request.OtpCode.Length != 6)
            {
                return Results.BadRequest(new { message = "Valid 6-digit OTP is required." });
            }

            var purpose = Normalize(request.Purpose, AllowedOtpPurposes);

            try
            {
                var otpRecord = await repository.GetLatestOtpAsync(request.Email, purpose, cancellationToken);
                if (otpRecord is null)
                {
                    return Results.NotFound(new { message = "OTP request not found." });
                }

                if (otpRecord.IsUsed)
                {
                    return Results.BadRequest(new { message = "OTP is already used." });
                }

                if (otpRecord.Attempts >= otpRecord.MaxAttempts)
                {
                    return Results.BadRequest(new { message = "OTP attempt limit exceeded." });
                }

                if (otpRecord.ExpiresAt < DateTimeOffset.Now)
                {
                    return Results.BadRequest(new { message = "OTP has expired." });
                }

                if (!otpService.VerifyOtp(request.OtpCode, otpRecord.OtpHash))
                {
                    await repository.MarkOtpAttemptAsync(otpRecord.OtpRequestId, cancellationToken);
                    return Results.BadRequest(new { message = "Invalid OTP." });
                }

                await repository.MarkOtpVerifiedAsync(otpRecord.OtpRequestId, otpRecord.UserId, cancellationToken);
                return Results.Ok(new OtpVerifyResponse(otpRecord.Email, otpRecord.Purpose, "OTP verified successfully."));
            }
            catch (InvalidOperationException exception)
            {
                return Results.BadRequest(new { message = exception.Message });
            }
            catch (MySqlException exception)
            {
                var detail = environment.IsDevelopment()
                    ? $"Database connection failed: {exception.Message}"
                    : "Database connection failed.";

                return Results.Problem(detail, statusCode: StatusCodes.Status503ServiceUnavailable);
            }
        })
        .WithName("VerifyEmailOtp");

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

    private static string? ValidateLoginRequest(LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return "Email is required.";
        }

        if (string.IsNullOrWhiteSpace(request.Password))
        {
            return "Password is required.";
        }

        return null;
    }

    private static string? ValidateSignupRequest(SignupRequest request)
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

        if (string.IsNullOrWhiteSpace(request.RequestedRoleCode))
        {
            return "Requested role is required.";
        }

        return AllowedSignupRoleCodes.Contains(request.RequestedRoleCode)
            ? null
            : "Requested role must be Admin, Employee, or Viewer.";
    }

    private static string? ValidateOtpRequest(string email, string purpose)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return "Email is required.";
        }

        if (email.Length > 150 || !email.Contains('@', StringComparison.Ordinal))
        {
            return "Valid email is required.";
        }

        if (string.IsNullOrWhiteSpace(purpose))
        {
            return "OTP purpose is required.";
        }

        return AllowedOtpPurposes.Contains(purpose)
            ? null
            : "OTP purpose is invalid.";
    }

    private static string Normalize(string value, HashSet<string> validValues)
    {
        return validValues.First(validValue =>
            validValue.Equals(value, StringComparison.OrdinalIgnoreCase));
    }
}
