"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/common/StateBlock";

export default function ErrorPage({ error, unstable_retry, reset }) {
  useEffect(() => {
    void error;
  }, [error]);

  function handleRetry() {
    if (unstable_retry) {
      unstable_retry();
      return;
    }

    if (reset) {
      reset();
      return;
    }

    window.location.reload();
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <ErrorState
        title="Page could not load"
        description="Something unexpected happened in this screen. Try loading the page again."
        onRetry={handleRetry}
      />
    </main>
  );
}
