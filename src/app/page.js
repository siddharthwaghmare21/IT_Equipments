"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SESSION_KEY, TEMP_AUTH_BYPASS } from "@/lib/authConfig";

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
