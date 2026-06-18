"use client";

import Link from "next/link";

export default function ActionButtons({
  viewHref,
  updateHref,
  onDelete,
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={viewHref}
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
      >
        View
      </Link>

      <Link
        href={updateHref}
        className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800"
      >
        Update
      </Link>

      <button
        type="button"
        onClick={onDelete}
        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
      >
        Delete
      </button>
    </div>
  );
}