namespace ITEquipment.Api.Security;

public static class AppRoles
{
    public const string SuperAdmin = "SUPER_ADMIN";
    public const string Admin = "ADMIN";
    public const string Employee = "EMPLOYEE";
    public const string Viewer = "VIEWER";

    public static readonly string[] All =
    [
        SuperAdmin,
        Admin,
        Employee,
        Viewer
    ];
}
