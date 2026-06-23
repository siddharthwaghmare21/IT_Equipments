"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const SESSION_KEY = "itAssetUserSession";

// Temporary frontend review mode. Set false again before backend auth starts.
const TEMP_AUTH_BYPASS = true;

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (TEMP_AUTH_BYPASS) {
      router.replace("/dashboard");
      return;
    }

    const savedSession = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");

    router.replace(savedSession ? "/dashboard" : "/login");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <p className="text-sm font-semibold text-gray-700">Redirecting...</p>
    </main>
  );
}
