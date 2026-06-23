"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "./Header";
import Sidebar from "./Sidebar";
import ConfirmDialog from "./ConfirmDialog";
import { showToast } from "./ToastHost";

const SESSION_KEY = "itAssetUserSession";

export default function LayoutWrapper({ children }) {
  const router = useRouter();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const savedSession = JSON.parse(
      localStorage.getItem(SESSION_KEY) || "null"
    );

    setTimeout(() => setCurrentUser(savedSession), 0);
  }, []);

  const isSuperAdmin = currentUser?.role === "Super Admin";
  const canManageAccessRequests =
    currentUser?.role === "Super Admin" || currentUser?.role === "Admin";

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
    <div className="min-h-screen bg-gray-100">
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:block">
        <Sidebar
          currentUser={currentUser}
          isSuperAdmin={isSuperAdmin}
          canManageAccessRequests={canManageAccessRequests}
          onLogout={handleLogout}
        />
      </div>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
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

      <div className="lg:pl-72">
        <Header
          currentUser={currentUser}
          isSuperAdmin={isSuperAdmin}
          onLogout={handleLogout}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
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

    </div>
  );
}
