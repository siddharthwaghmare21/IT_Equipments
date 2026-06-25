using ITEquipment.Api.Security;

namespace ITEquipment.Api.Endpoints;

public static class SecurityEndpoints
{
    public static RouteGroupBuilder MapSecurityEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/security").WithTags("Security");

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

        return group;
    }
}
