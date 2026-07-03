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
    <div className="min-h-screen bg-slate-100">
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close sidebar overlay"
            onClick={() => setIsSidebarOpen(false)}
            className="absolute inset-0 bg-black/50"
          />

          <div className="relative h-full">
            <Sidebar
              currentUser={currentUser}
              isSuperAdmin={isSuperAdmin}
              canManageAccessRequests={canManageAccessRequests}
              onLogout={handleLogout}
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      <div>
        <Header
          currentUser={currentUser}
          isSuperAdmin={isSuperAdmin}
          onLogout={handleLogout}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
          <Breadcrumbs />
          {canAccessCurrentPage ? (
            children
          ) : (
            <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800 shadow-sm">
              <h2 className="text-lg font-bold">Access restricted</h2>
              <p className="mt-2 text-sm leading-6">
                Your current role does not have permission to open this page.
                Please contact Super Admin if access is required.
              </p>
            </section>
          )}
        </main>
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
