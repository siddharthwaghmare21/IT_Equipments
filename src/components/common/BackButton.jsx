"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function BackButton({ href, label }) {
  const searchParams = useSearchParams();
  const searchReturnHref = searchParams.get("fromSearch");
  const hasSearchReturn =
    searchReturnHref?.startsWith("/search") && !searchReturnHref.startsWith("//");
  const resolvedHref = hasSearchReturn ? searchReturnHref : href;
  const resolvedLabel = hasSearchReturn ? "Search Results" : label;

  return (
    <Link
      href={resolvedHref}
      className="back-button inline-flex h-11 w-full items-center justify-center rounded-2xl border border-[#314666] bg-[#101a2b] px-4 text-sm font-semibold text-[#c8d4ec] hover:bg-[#16233a] sm:w-auto"
    >
      Back to {resolvedLabel}
    </Link>
  );
}
