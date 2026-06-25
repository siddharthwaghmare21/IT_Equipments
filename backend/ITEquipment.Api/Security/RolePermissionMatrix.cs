namespace ITEquipment.Api.Security;

public static class RolePermissionMatrix
{
    private static readonly IReadOnlyDictionary<string, IReadOnlySet<string>> PermissionsByRole =
        new Dictionary<string, IReadOnlySet<string>>(StringComparer.OrdinalIgnoreCase)
        {
            [AppRoles.SuperAdmin] = new HashSet<string>(AppPermissions.All, StringComparer.OrdinalIgnoreCase),
            [AppRoles.Admin] = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                AppPermissions.UserApproval,
                AppPermissions.BackupExportControl,
                AppPermissions.AssetWorkflowControl,
                AppPermissions.AssetWrite,
                AppPermissions.ReportsRead,
                AppPermissions.RecordsRead
            },
            [AppRoles.Employee] = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                AppPermissions.BackupExportControl,
                AppPermissions.AssetWorkflowControl,
                AppPermissions.AssetWrite,
                AppPermissions.ReportsRead,
                AppPermissions.RecordsRead
            },
            [AppRoles.Viewer] = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                AppPermissions.ReportsRead,
                AppPermissions.RecordsRead
            }
        };

    public static bool HasPermission(string roleCode, string permission)
    {
        return PermissionsByRole.TryGetValue(roleCode, out var permissions) &&
            permissions.Contains(permission);
    }

    public static IReadOnlySet<string> GetPermissions(string roleCode)
    {
        return PermissionsByRole.TryGetValue(roleCode, out var permissions)
            ? permissions
            : new HashSet<string>(StringComparer.OrdinalIgnoreCase);
    }
}
