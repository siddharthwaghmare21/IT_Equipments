"use client";

import Link from "next/link";
import { EmptyState } from "./StateBlock";
import { readSession } from "@/lib/authSession";
import { canUseWriteActions } from "@/lib/rbac";

export default function CompactRecordList({
  records,
  titleKey,
  subtitleKey,
  meta = [],
  getTitle,
  getSubtitle,
  getMeta,
  getStatus,
  getHref,
  getEditHref,
  statusRender,
  viewHref,
  editHref,
  onArchive,
  onDelete,
  archiveLabel = "Delete",
  emptyTitle = "No records found",
  emptyDescription = "Try changing filters or search terms.",
}) {
  const currentUser = readSession();
  const canWrite = canUseWriteActions(currentUser);

  if (records.length === 0) {
    return (
      <div className="md:hidden">
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  return (
    <div className="mb-6 divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm md:hidden">
      {records.map((record) => {
        const metaItems = getMeta
          ? getMeta(record).map((value, index) => ({
              label: `Info ${index + 1}`,
              value,
            }))
          : meta.map((item) => ({
              label: item.label,
              value: record[item.key] || "-",
            }));
        const resolvedViewHref = getHref ? getHref(record) : viewHref?.(record);
        const resolvedEditHref = getEditHref
          ? getEditHref(record)
          : editHref?.(record);

        return (
        <article key={record.id} className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-950">
                {getTitle ? getTitle(record) : record[titleKey]}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {getSubtitle ? getSubtitle(record) : record[subtitleKey]}
              </p>
            </div>
            {statusRender
              ? statusRender(record)
              : getStatus && (
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    {getStatus(record)}
                  </span>
                )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            {metaItems.map((item) => (
              <div key={item.label}>
                <p className="text-slate-500">{item.label}</p>
                <p className="mt-1 font-semibold text-slate-950">
                  {item.value || "-"}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {resolvedViewHref && (
              <Link
                href={resolvedViewHref}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                View
              </Link>
            )}
            {resolvedEditHref && canWrite && (
              <Link
                href={resolvedEditHref}
                className="rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Edit
              </Link>
            )}
            {(onArchive || onDelete) && canWrite && (
              <button
                type="button"
                onClick={() => (onDelete || onArchive)(record)}
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
              >
                {archiveLabel}
              </button>
            )}
          </div>
        </article>
        );
      })}
    </div>
  );
}
