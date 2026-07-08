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
    <div className="min-h-screen bg-[#edf1fb] dark:bg-[linear-gradient(180deg,#091223_0%,#111c31_100%)]">
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close sidebar overlay"
            onClick={() => setIsSidebarOpen(false)}
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-[1px]"
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

      <div className="mx-auto flex min-h-screen w-full overflow-hidden bg-transparent dark:bg-[#0f1a2f]">
        <div className="hidden shrink-0 lg:block">
          <Sidebar
            currentUser={currentUser}
            isSuperAdmin={isSuperAdmin}
            canManageAccessRequests={canManageAccessRequests}
            onLogout={handleLogout}
            isPersistent
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col bg-[#f5f7fc] dark:bg-[#111c31]">
          <Header
            currentUser={currentUser}
            isSuperAdmin={isSuperAdmin}
            onLogout={handleLogout}
            onMenuClick={() => setIsSidebarOpen(true)}
          />

          <main className="app-main flex-1 p-4 sm:p-5 lg:p-8">
            <div className="mx-auto w-full max-w-[1520px]">
              <Breadcrumbs />
              {canAccessCurrentPage ? (
                children
              ) : (
                <section className="rounded-[28px] border border-red-200 bg-red-50 p-6 text-red-800 shadow-sm">
                  <h2 className="text-lg font-bold">Access restricted</h2>
                  <p className="mt-2 text-sm leading-6">
                    Your current role does not have permission to open this page.
                    Please contact Super Admin if access is required.
                  </p>
                </section>
              )}
            </div>
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
