"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TEMP_AUTH_BYPASS } from "@/lib/authConfig";
import { readSession } from "@/lib/authSession";

const publicRoutes = ["/login", "/admin-setup", "/admin-request-access"];

export default function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const savedSession = readSession();

    if (TEMP_AUTH_BYPASS) {
      if (pathname === "/") {
        router.replace("/dashboard");
        return;
      }

      setTimeout(() => setIsChecking(false), 0);
      return;
    }

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

      setTimeout(() => setIsChecking(false), 0);
      return;
    }

    if (!savedSession) {
      router.replace("/login");
      return;
    }

    setTimeout(() => setIsChecking(false), 0);
  }, [pathname, router]);

  if (isChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">
        <div className="rounded-lg border border-slate-200 bg-white px-6 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Checking access...
          </p>
        </div>
      </main>
    );
  }

  return children;
}
