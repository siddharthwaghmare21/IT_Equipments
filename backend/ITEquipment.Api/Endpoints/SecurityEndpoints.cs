using ITEquipment.Api.Security;
using ITEquipment.Api.Services;

namespace ITEquipment.Api.Endpoints;

public static class SecurityEndpoints
{
    public static RouteGroupBuilder MapSecurityEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/security")
            .WithTags("Security")
            .RequireAuthorization(AppAuthorizationPolicies.RequireReportsRead);

        group.MapGet("/role-permissions", () =>
        {
            var response = AppRoles.All.Select(roleCode => new
            {
                roleCode,
                permissions = RolePermissionMatrix.GetPermissions(roleCode).OrderBy(permission => permission)
            });

            return Results.Ok(response);
        })
        .WithName("GetRolePermissions");

        group.MapGet("/email-status", (EmailSenderService emailSenderService) =>
        {
            return Results.Ok(new
            {
                isConfigured = emailSenderService.IsConfigured,
                message = emailSenderService.IsConfigured
                    ? "SMTP email delivery is configured."
                    : "SMTP email delivery is not configured."
            });
        })
        .WithName("GetEmailStatus");

        return group;
    }
}
