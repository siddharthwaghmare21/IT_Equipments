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
        className="inline-flex items-center gap-1.5 rounded-xl border border-[#314666] bg-[#101a2b] px-3 py-1.5 text-xs font-semibold text-[#c8d4ec] hover:bg-[#16233a]"
      >
        <ActionIcon type="view" />
        View
      </Link>

      {canWrite && (
        <Link
          href={editHref || updateHref}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#6a3df0] to-[#8b5cf6] px-3 py-1.5 text-xs font-semibold text-white hover:from-[#5f35df] hover:to-[#7c4cf3]"
        >
          <ActionIcon type="edit" />
          Edit
        </Link>
      )}

      {canWrite && onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/12 px-3 py-1.5 text-xs font-semibold text-rose-100 hover:bg-rose-500/18"
        >
          <ActionIcon type="delete" />
          {deleteLabel}
        </button>
      )}
    </div>
  );
}
