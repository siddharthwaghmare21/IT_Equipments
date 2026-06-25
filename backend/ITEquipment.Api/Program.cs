using ITEquipment.Api.Data;
using ITEquipment.Api.Endpoints;
using ITEquipment.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddSingleton<MySqlConnectionFactory>();
builder.Services.AddScoped<RoleRepository>();
builder.Services.AddScoped<DepartmentRepository>();
builder.Services.AddScoped<VendorRepository>();
builder.Services.AddScoped<AssetRepository>();
builder.Services.AddScoped<AuthRepository>();
builder.Services.AddSingleton<PasswordHashService>();
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

app.UseHttpsRedirection();
app.UseCors("Frontend");

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
app.MapAuthEndpoints();

app.Run();

internal sealed record HealthResponse(
    string Status,
    string Service,
    string Environment,
    DateTimeOffset CheckedAtUtc);
