"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { TEMP_AUTH_BYPASS } from "@/lib/authConfig";
import { readSession } from "@/lib/authSession";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (TEMP_AUTH_BYPASS) {
      router.replace("/dashboard");
      return;
    }

    const savedSession = readSession();

    router.replace(savedSession ? "/dashboard" : "/login");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <p className="text-sm font-semibold text-gray-700">Redirecting...</p>
    </main>
  );
}
