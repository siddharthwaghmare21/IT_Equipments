"use client";

import Link from "next/link";
import { readSession } from "@/lib/authSession";
import { canUseWriteActions } from "@/lib/rbac";

export default function ActionButtons({
  viewHref,
  updateHref,
  onDelete,
  deleteLabel = "Delete",
}) {
  const currentUser = readSession();
  const canWrite = canUseWriteActions(currentUser);

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={viewHref}
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
      >
        View
      </Link>

      {canWrite && (
        <Link
          href={updateHref}
          className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800"
        >
          Edit
        </Link>
      )}

      {canWrite && onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
        >
          {deleteLabel}
        </button>
      )}
    </div>
  );
}
