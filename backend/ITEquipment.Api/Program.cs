using ITEquipment.Api.Data;
using ITEquipment.Api.Endpoints;
using ITEquipment.Api.Middleware;
using ITEquipment.Api.Models;
using ITEquipment.Api.Security;
using ITEquipment.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

if (builder.Environment.IsDevelopment())
{
    var dataProtectionPath = Path.Combine(
        Path.GetTempPath(),
        "ITEquipment.Api",
        "DataProtectionKeys");
    Directory.CreateDirectory(dataProtectionPath);
    builder.Services
        .AddDataProtection()
        .PersistKeysToFileSystem(new DirectoryInfo(dataProtectionPath));
}

builder.Services.AddOpenApi();
builder.Services.AddSingleton<MySqlConnectionFactory>();
builder.Services.AddScoped<RoleRepository>();
builder.Services.AddScoped<DepartmentRepository>();
builder.Services.AddScoped<DepartmentDemandRepository>();
builder.Services.AddScoped<VendorRepository>();
builder.Services.AddScoped<AssetRepository>();
builder.Services.AddScoped<AssetDocumentRepository>();
builder.Services.AddScoped<WorkOrderRepository>();
builder.Services.AddScoped<DeliveryRepository>();
builder.Services.AddScoped<TransferRepository>();
builder.Services.AddScoped<ReturnRepository>();
builder.Services.AddScoped<MaintenanceRepository>();
builder.Services.AddScoped<AuthRepository>();
builder.Services.AddScoped<UserRepository>();
builder.Services.AddScoped<ApprovalRepository>();
builder.Services.AddScoped<ActivityLogRepository>();
builder.Services.AddScoped<ReportRepository>();
builder.Services.AddScoped<ExportImportBackupRepository>();
builder.Services.AddScoped<SystemSettingRepository>();
builder.Services.AddSingleton<PasswordHashService>();
builder.Services.AddSingleton<OtpService>();
builder.Services.Configure<EmailOptions>(builder.Configuration.GetSection(EmailOptions.SectionName));
builder.Services.AddSingleton<EmailSenderService>();
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));
builder.Services.AddSingleton<JwtTokenService>();
var jwtOptions = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>() ?? new JwtOptions();
if (string.IsNullOrWhiteSpace(jwtOptions.SigningKey) || jwtOptions.SigningKey.Length < 32)
{
    throw new InvalidOperationException("JWT signing key must be configured with at least 32 characters.");
}

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidAudience = jwtOptions.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SigningKey)),
            ClockSkew = TimeSpan.FromMinutes(2)
        };
    });
builder.Services.AddAuthorizationBuilder()
    .AddPolicy(AppAuthorizationPolicies.RequireSuperAdmin, policy =>
        policy.RequireRole(AppRoles.SuperAdmin))
    .AddPolicy(AppAuthorizationPolicies.RequireAdminOrSuperAdmin, policy =>
        policy.RequireRole(AppRoles.SuperAdmin, AppRoles.Admin))
    .AddPolicy(AppAuthorizationPolicies.RequireBackupAccess, policy =>
        policy.RequireRole(AppRoles.SuperAdmin, AppRoles.Admin, AppRoles.Employee))
    .AddPolicy(AppAuthorizationPolicies.RequireAssetWrite, policy =>
        policy.RequireRole(AppRoles.SuperAdmin, AppRoles.Admin, AppRoles.Employee))
    .AddPolicy(AppAuthorizationPolicies.RequireReportsRead, policy =>
        policy.RequireRole(AppRoles.SuperAdmin, AppRoles.Admin, AppRoles.Employee, AppRoles.Viewer));
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        var allowedOrigins = builder.Configuration
            .GetSection("Cors:AllowedOrigins")
            .Get<string[]>()
            ?.Where(origin => !string.IsNullOrWhiteSpace(origin))
            .Select(origin => origin.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        if (allowedOrigins is null || allowedOrigins.Length == 0)
        {
            allowedOrigins =
            [
                "http://localhost:3000",
                "http://localhost:3001"
            ];
        }

        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<ActivityLogMiddleware>();

app.MapGet("/api/health", () =>
{
    var response = new HealthResponse(
        Status: "Healthy",
        Service: "IT Equipment Management API",
        Environment: app.Environment.EnvironmentName,
        CheckedAtUtc: DateTimeOffset.UtcNow);

    return Results.Ok(response);
})
.WithName("HealthCheck");

app.MapGet("/api/backups/download", async (
    string? scope,
    System.Security.Claims.ClaimsPrincipal user,
    ExportImportBackupRepository repository,
    IHostEnvironment environment,
    CancellationToken cancellationToken) =>
{
    var backupScope = string.IsNullOrWhiteSpace(scope) ? "Full Database" : scope.Trim();
    var validScopes = new[] { "Full Database", "Schema Only", "Data Only" };

    if (!validScopes.Contains(backupScope, StringComparer.OrdinalIgnoreCase))
    {
        return Results.BadRequest(new { message = "Backup scope must be Full Database, Schema Only or Data Only." });
    }

    try
    {
        var normalizedScope = validScopes.First(validScope =>
            validScope.Equals(backupScope, StringComparison.OrdinalIgnoreCase));
        var snapshot = await repository.CreateBackupSnapshotAsync(
            normalizedScope,
            user.Identity?.Name ?? "Authenticated User",
            cancellationToken);
        var json = JsonSerializer.Serialize(
            snapshot,
            new JsonSerializerOptions { WriteIndented = true });
        var bytes = Encoding.UTF8.GetBytes(json);
        var timestamp = DateTimeOffset.UtcNow.ToString("yyyyMMdd-HHmmss");

        return Results.File(
            bytes,
            "application/json",
            $"it-equipment-backup-{timestamp}.json");
    }
    catch (InvalidOperationException exception)
    {
        return Results.Problem(exception.Message, statusCode: StatusCodes.Status503ServiceUnavailable);
    }
    catch (MySqlConnector.MySqlException exception)
    {
        var detail = environment.IsDevelopment()
            ? $"Database connection failed: {exception.Message}"
            : "Database connection failed.";

        return Results.Problem(detail, statusCode: StatusCodes.Status503ServiceUnavailable);
    }
})
.RequireAuthorization(AppAuthorizationPolicies.RequireBackupAccess)
.WithTags("Backup")
.WithName("DownloadBackupSnapshot");

app.MapPost("/api/backups/restore", async (
    BackupRestoreRequest request,
    ExportImportBackupRepository repository,
    IHostEnvironment environment,
    CancellationToken cancellationToken) =>
{
    if (!string.Equals(request.Confirmation?.Trim(), "RESTORE BACKUP", StringComparison.Ordinal))
    {
        return Results.BadRequest(new { message = "Type RESTORE BACKUP to confirm this operation." });
    }

    try
    {
        var result = await repository.RestoreBackupSnapshotAsync(request.Snapshot, cancellationToken);
        return Results.Ok(result);
    }
    catch (InvalidOperationException exception)
    {
        return Results.BadRequest(new { message = exception.Message });
    }
    catch (MySqlConnector.MySqlException exception)
    {
        var detail = environment.IsDevelopment()
            ? $"Backup restore failed: {exception.Message}"
            : "Backup restore failed.";

        return Results.Problem(detail, statusCode: StatusCodes.Status503ServiceUnavailable);
    }
})
.RequireAuthorization(AppAuthorizationPolicies.RequireSuperAdmin)
.WithTags("Backup")
.WithName("RestoreBackupSnapshot");

app.MapRoleEndpoints();
app.MapDepartmentEndpoints();
app.MapDepartmentDemandEndpoints();
app.MapVendorEndpoints();
app.MapAssetEndpoints();
app.MapAssetDocumentEndpoints();
app.MapWorkOrderEndpoints();
app.MapDeliveryEndpoints();
app.MapTransferEndpoints();
app.MapReturnEndpoints();
app.MapMaintenanceEndpoints();
app.MapActivityLogEndpoints();
app.MapReportEndpoints();
app.MapExportImportBackupEndpoints();
app.MapAuthEndpoints();
app.MapUserEndpoints();
app.MapSecurityEndpoints();
app.MapSystemSettingEndpoints();
app.MapApprovalEndpoints();

app.Run();

internal sealed record HealthResponse(
    string Status,
    string Service,
    string Environment,
    DateTimeOffset CheckedAtUtc);
