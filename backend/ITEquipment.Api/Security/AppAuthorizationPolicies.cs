namespace ITEquipment.Api.Security;

public static class AppAuthorizationPolicies
{
    public const string RequireSuperAdmin = "RequireSuperAdmin";
    public const string RequireAdminOrSuperAdmin = "RequireAdminOrSuperAdmin";
    public const string RequireBackupAccess = "RequireBackupAccess";
    public const string RequireAssetWrite = "RequireAssetWrite";
    public const string RequireReportsRead = "RequireReportsRead";
}
