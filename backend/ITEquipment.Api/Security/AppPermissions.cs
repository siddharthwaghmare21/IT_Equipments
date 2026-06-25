namespace ITEquipment.Api.Security;

public static class AppPermissions
{
    public const string FullAccess = "full_access";
    public const string UserApproval = "user_approval";
    public const string RoleManagement = "role_management";
    public const string SettingsManagement = "settings_management";
    public const string BackupExportControl = "backup_export_control";
    public const string AssetWorkflowControl = "asset_workflow_control";
    public const string AssetWrite = "asset_write";
    public const string ReportsRead = "reports_read";
    public const string RecordsRead = "records_read";

    public static readonly string[] All =
    [
        FullAccess,
        UserApproval,
        RoleManagement,
        SettingsManagement,
        BackupExportControl,
        AssetWorkflowControl,
        AssetWrite,
        ReportsRead,
        RecordsRead
    ];
}
