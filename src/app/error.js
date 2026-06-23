"use client";

import { ErrorState } from "@/components/common/StateBlock";

export default function Error({ unstable_retry, reset }) {
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
        title="Page could not be loaded"
        description="Please retry. If the issue repeats, we will check the page route and data source."
        onRetry={handleRetry}
      />
    </main>
  );
}
