"use client";

import Link from "next/link";
import { readSession } from "@/lib/authSession";
import { canUseWriteActions } from "@/lib/rbac";

function ActionIcon({ type }) {
  const commonProps = {
    "aria-hidden": "true",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "h-3.5 w-3.5",
  };

  const paths = {
    view: (
      <>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    edit: (
      <>
        <path d="M12 20h9" />
        <path d="m16.5 3.5 4 4L8 20l-5 1 1-5 12.5-12.5Z" />
      </>
    ),
    delete: (
      <>
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="m19 6-1 14H6L5 6" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
      </>
    ),
  };

  return <svg {...commonProps}>{paths[type]}</svg>;
}

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
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <ActionIcon type="view" />
        View
      </Link>

      {canWrite && (
        <Link
          href={editHref || updateHref}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500"
        >
          <ActionIcon type="edit" />
          Edit
        </Link>
      )}

      {canWrite && onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          <ActionIcon type="delete" />
          {deleteLabel}
        </button>
      )}
    </div>
  );
}
