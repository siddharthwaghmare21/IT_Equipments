"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const SESSION_KEY = "itAssetUserSession";

const publicRoutes = ["/login", "/admin-setup", "/admin-request-access"];

export default function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const savedSession = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");

    if (pathname === "/") {
      router.replace(savedSession ? "/dashboard" : "/login");
      return;
    }

    const isPublicRoute = publicRoutes.includes(pathname);

    if (isPublicRoute) {
      if (savedSession && pathname === "/login") {
        router.replace("/dashboard");
        return;
      }

      setIsChecking(false);
      return;
    }

    if (!savedSession) {
      router.replace("/login");
      return;
    }

    setIsChecking(false);
  }, [pathname, router]);

  if (isChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-700">
            Checking access...
          </p>
        </div>
      </main>
    );
  }

  return children;
}