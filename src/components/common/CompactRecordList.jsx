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
    <div className="mb-6 divide-y divide-[#2c3f63] overflow-hidden rounded-[24px] border border-[#2c3f63] bg-[#18253d] shadow-[0_18px_38px_rgba(6,12,24,0.14)] md:hidden">
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
              <p className="text-sm font-bold text-white">
                {getTitle ? getTitle(record) : record[titleKey]}
              </p>
              <p className="mt-1 text-sm text-[#8fa4c7]">
                {getSubtitle ? getSubtitle(record) : record[subtitleKey]}
              </p>
            </div>
            {statusRender
              ? statusRender(record)
              : getStatus && (
                  <span className="rounded-full border border-[#314666] bg-[#101a2b] px-2.5 py-1 text-xs font-semibold text-[#c8d4ec]">
                    {getStatus(record)}
                  </span>
                )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            {metaItems.map((item) => (
              <div key={item.label}>
                <p className="text-[#8fa4c7]">
                  {item.label}
                </p>
                <p className="mt-1 font-semibold text-white">
                  {item.value || "-"}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {resolvedViewHref && (
              <Link
                href={resolvedViewHref}
                className="rounded-xl border border-[#314666] bg-[#101a2b] px-3 py-1.5 text-xs font-semibold text-[#c8d4ec] hover:bg-[#16233a]"
              >
                View
              </Link>
            )}
            {resolvedEditHref && canWrite && (
              <Link
                href={resolvedEditHref}
                className="rounded-xl bg-gradient-to-r from-[#6a3df0] to-[#8b5cf6] px-3 py-1.5 text-xs font-semibold text-white hover:from-[#5f35df] hover:to-[#7c4cf3]"
              >
                Edit
              </Link>
            )}
            {(onArchive || onDelete) && canWrite && (
              <button
                type="button"
                onClick={() => (onDelete || onArchive)(record)}
                className="rounded-xl border border-rose-500/30 bg-rose-500/12 px-3 py-1.5 text-xs font-semibold text-rose-100 hover:bg-rose-500/18"
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
