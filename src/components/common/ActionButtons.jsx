"use client";

import Link from "next/link";
import { readSession } from "@/lib/authSession";
import { canUseWriteActions } from "@/lib/rbac";

export default function ActionButtons({
  viewHref,
  updateHref,
  editHref,
  onDelete,
  deleteLabel = "Delete",
}) {
  const currentUser = readSession();
  const canWrite = canUseWriteActions(currentUser);

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={viewHref}
        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
      >
        View
      </Link>

      {canWrite && (
        <Link
          href={editHref || updateHref}
          className="rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
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
