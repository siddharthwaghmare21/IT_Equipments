"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const labels = {
  dashboard: "Dashboard",
  assets: "Assets",
  add: "Add",
  edit: "Edit",
  view: "View",
  purchases: "Purchases",
  vendors: "Vendors",
  employees: "Employees",
  departments: "Departments",
  deliveries: "Deliveries",
  delivery: "Delivery",
  returns: "Returns",
  maintenance: "Maintenance",
  reports: "Reports",
  settings: "Settings",
  profile: "Profile",
  help: "Help / SOP",
  "activity-logs": "Activity Logs",
  "import-data": "Import Data",
  "admin-request-management": "Admin Requests",
  "admin-user-management": "User Management",
};

function formatSegment(segment) {
  return labels[segment] || segment.replaceAll("-", " ");
}

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0 || pathname === "/dashboard") return null;

  const crumbs = [
    { label: "Dashboard", href: "/dashboard" },
    ...segments.map((segment, index) => ({
      label: formatSegment(segment),
      href: `/${segments.slice(0, index + 1).join("/")}`,
    })),
  ];

  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm">
      <ol className="flex flex-wrap items-center gap-2 text-gray-500">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <li key={`${crumb.href}-${index}`} className="flex items-center gap-2">
              {index > 0 && <span className="text-gray-300">/</span>}
              {isLast ? (
                <span className="font-semibold text-gray-900">
                  {crumb.label}
                </span>
              ) : (
                <Link href={crumb.href} className="hover:text-gray-900">
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
