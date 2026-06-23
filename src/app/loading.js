import { LoadingState } from "@/components/common/StateBlock";

export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <LoadingState
        title="Loading workspace"
        description="Preparing IT equipment management data."
      />
    </main>
  );
}
