using ITEquipment.Api.Data;
using ITEquipment.Api.Endpoints;
using ITEquipment.Api.Middleware;
using ITEquipment.Api.Security;
using ITEquipment.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddSingleton<MySqlConnectionFactory>();
builder.Services.AddScoped<RoleRepository>();
builder.Services.AddScoped<DepartmentRepository>();
builder.Services.AddScoped<VendorRepository>();
builder.Services.AddScoped<AssetRepository>();
builder.Services.AddScoped<AssetDocumentRepository>();
builder.Services.AddScoped<WorkOrderRepository>();
builder.Services.AddScoped<DeliveryRepository>();
builder.Services.AddScoped<TransferRepository>();
builder.Services.AddScoped<ReturnRepository>();
builder.Services.AddScoped<MaintenanceRepository>();
builder.Services.AddScoped<AuthRepository>();
builder.Services.AddScoped<ApprovalRepository>();
builder.Services.AddScoped<ActivityLogRepository>();
builder.Services.AddScoped<ReportRepository>();
builder.Services.AddSingleton<PasswordHashService>();
builder.Services.AddSingleton<OtpService>();
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
        policy
            .WithOrigins(
                "http://localhost:3000",
                "http://localhost:3001",
                "https://it-equipments.vercel.app")
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

app.MapRoleEndpoints();
app.MapDepartmentEndpoints();
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
app.MapAuthEndpoints();
app.MapSecurityEndpoints();
app.MapApprovalEndpoints();

app.Run();

internal sealed record HealthResponse(
    string Status,
    string Service,
    string Environment,
    DateTimeOffset CheckedAtUtc);
