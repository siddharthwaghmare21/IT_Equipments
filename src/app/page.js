"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { TEMP_AUTH_BYPASS } from "@/lib/authConfig";
import { readSession } from "@/lib/authSession";
import { getBootstrapStatus } from "@/lib/apiClient";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    async function resolveLandingPage() {
      if (TEMP_AUTH_BYPASS) {
        router.replace("/dashboard");
        return;
      }

      const savedSession = readSession();

      if (savedSession) {
        router.replace("/dashboard");
        return;
      }

      try {
        const status = await getBootstrapStatus();
        if (isMounted) {
          router.replace(status?.hasActiveSuperAdmin ? "/login" : "/admin-setup");
        }
      } catch {
        if (isMounted) router.replace("/login");
      }
    }

    resolveLandingPage();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Redirecting...</p>
    </main>
  );
}
