"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Header from "./Header";
import Sidebar from "./Sidebar";
import ConfirmDialog from "./ConfirmDialog";
import Breadcrumbs from "./Breadcrumbs";
import CommandPalette from "./CommandPalette";
import { showToast } from "./ToastHost";
import { SESSION_KEY } from "@/lib/authConfig";
import { readSession } from "@/lib/authSession";
import { canAccessPath } from "@/lib/rbac";

export default function LayoutWrapper({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    setTimeout(() => setCurrentUser(readSession()), 0);
  }, []);

  const isSuperAdmin = currentUser?.roleCode === "SUPER_ADMIN";
  const canManageAccessRequests =
    currentUser?.roleCode === "SUPER_ADMIN" || currentUser?.roleCode === "ADMIN";
  const canAccessCurrentPage = !currentUser || canAccessPath(currentUser, pathname);

  function handleLogout() {
    setShowLogoutConfirm(true);
  }

  function confirmLogout() {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
    setShowLogoutConfirm(false);
    showToast("Logged out successfully.");
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#b9cff6_0%,#d8e5fb_100%)] px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6 dark:bg-[linear-gradient(180deg,#0f172a_0%,#16233a_100%)]">
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close sidebar overlay"
            onClick={() => setIsSidebarOpen(false)}
            className="absolute inset-0 bg-black/50"
          />

          <div className="relative h-full max-w-[320px]">
            <Sidebar
              currentUser={currentUser}
              isSuperAdmin={isSuperAdmin}
              canManageAccessRequests={canManageAccessRequests}
              onLogout={handleLogout}
              onClose={() => setIsSidebarOpen(false)}
              isPersistent={false}
            />
          </div>
        </div>
      )}

      <div className="mx-auto flex min-h-[calc(100vh-24px)] w-full max-w-[1480px] overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_28px_80px_rgba(73,98,147,0.18)] dark:border-slate-700/80 dark:bg-[#0f1729] lg:min-h-[calc(100vh-48px)]">
        <div className="hidden shrink-0 lg:block">
          <Sidebar
            currentUser={currentUser}
            isSuperAdmin={isSuperAdmin}
            canManageAccessRequests={canManageAccessRequests}
            onLogout={handleLogout}
            isPersistent
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col bg-[#f7f9fe] dark:bg-[#111a2c]">
          <Header
            currentUser={currentUser}
            isSuperAdmin={isSuperAdmin}
            onLogout={handleLogout}
            onMenuClick={() => setIsSidebarOpen(true)}
          />

          <main className="app-main flex-1 p-3 sm:p-4 lg:p-6">
            <Breadcrumbs />
            {canAccessCurrentPage ? (
              children
            ) : (
              <section className="rounded-[24px] border border-red-200 bg-red-50 p-6 text-red-800 shadow-sm">
                <h2 className="text-lg font-bold">Access restricted</h2>
                <p className="mt-2 text-sm leading-6">
                  Your current role does not have permission to open this page.
                  Please contact Super Admin if access is required.
                </p>
              </section>
            )}
          </main>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Logout?"
        description="Your current session will be closed on this device."
        confirmLabel="Logout"
        tone="default"
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
      />

      <CommandPalette currentUser={currentUser} />
    </div>
  );
}
