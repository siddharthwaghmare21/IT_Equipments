export const roleCodes = {
  superAdmin: "SUPER_ADMIN",
  admin: "ADMIN",
  employee: "EMPLOYEE",
  viewer: "VIEWER",
};

export const permissions = {
  userManagement: "USER_MANAGEMENT",
  userApproval: "USER_APPROVAL",
  backupExportControl: "BACKUP_EXPORT_CONTROL",
  assetWorkflowControl: "ASSET_WORKFLOW_CONTROL",
  assetWrite: "ASSET_WRITE",
  reportsRead: "REPORTS_READ",
  recordsRead: "RECORDS_READ",
};

const permissionsByRole = {
  [roleCodes.superAdmin]: Object.values(permissions),
  [roleCodes.admin]: [
    permissions.userApproval,
    permissions.backupExportControl,
    permissions.assetWorkflowControl,
    permissions.assetWrite,
    permissions.reportsRead,
    permissions.recordsRead,
  ],
  [roleCodes.employee]: [
    permissions.backupExportControl,
    permissions.assetWorkflowControl,
    permissions.assetWrite,
    permissions.reportsRead,
    permissions.recordsRead,
  ],
  [roleCodes.viewer]: [permissions.reportsRead, permissions.recordsRead],
};

const routeRules = [
  { prefix: "/admin-user-management", permission: permissions.userManagement },
  { prefix: "/admin-request-management", permission: permissions.userApproval },
  { prefix: "/settings", permission: permissions.backupExportControl },
  { prefix: "/activity-logs", permission: permissions.reportsRead },
  { prefix: "/reports", permission: permissions.reportsRead },
  { prefix: "/profile", permission: permissions.recordsRead },
  { prefix: "/help", permission: permissions.recordsRead },
  { prefix: "/dashboard", permission: permissions.recordsRead },
  { prefix: "/search", permission: permissions.recordsRead },
  { prefix: "/assets/add", permission: permissions.assetWrite },
  { prefix: "/assets/edit", permission: permissions.assetWrite },
  { prefix: "/purchases/add", permission: permissions.assetWrite },
  { prefix: "/purchases/edit", permission: permissions.assetWrite },
  { prefix: "/deliveries/delivery", permission: permissions.assetWrite },
  { prefix: "/deliveries/edit", permission: permissions.assetWrite },
  { prefix: "/returns/add", permission: permissions.assetWrite },
  { prefix: "/returns/edit", permission: permissions.assetWrite },
  { prefix: "/maintenance/add", permission: permissions.assetWrite },
  { prefix: "/maintenance/edit", permission: permissions.assetWrite },
  { prefix: "/transfers/add", permission: permissions.assetWrite },
  { prefix: "/transfers/edit", permission: permissions.assetWrite },
  { prefix: "/vendors/add", permission: permissions.assetWrite },
  { prefix: "/vendors/edit", permission: permissions.assetWrite },
  { prefix: "/departments/add", permission: permissions.assetWrite },
  { prefix: "/departments/edit", permission: permissions.assetWrite },
  { prefix: "/purchases", permission: permissions.recordsRead },
  { prefix: "/vendors", permission: permissions.recordsRead },
  { prefix: "/assets", permission: permissions.recordsRead },
  { prefix: "/departments", permission: permissions.recordsRead },
  { prefix: "/deliveries", permission: permissions.recordsRead },
  { prefix: "/transfers", permission: permissions.recordsRead },
  { prefix: "/returns", permission: permissions.recordsRead },
  { prefix: "/maintenance", permission: permissions.recordsRead },
];

export function getUserRoleCode(user) {
  return user?.roleCode || "";
}

export function hasPermission(user, permission) {
  const roleCode = getUserRoleCode(user);
  return Boolean(
    permissionsByRole[roleCode]?.includes(permission)
  );
}

export function canAccessPath(user, path) {
  if (!path) return true;

  const rule = routeRules.find((routeRule) =>
    path === routeRule.prefix || path.startsWith(`${routeRule.prefix}/`)
  );

  return rule ? hasPermission(user, rule.permission) : true;
}

export function canAccessSidebarPath(user, path) {
  return canAccessPath(user, path);
}

export function canUseWriteActions(user) {
  return hasPermission(user, permissions.assetWrite);
}

export function canUseBackupExport(user) {
  return hasPermission(user, permissions.backupExportControl);
}
