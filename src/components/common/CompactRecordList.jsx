"use client";

import Link from "next/link";
import { EmptyState } from "./StateBlock";

export default function CompactRecordList({
  records,
  titleKey,
  subtitleKey,
  meta = [],
  statusRender,
  viewHref,
  editHref,
  onArchive,
  archiveLabel = "Archive",
  emptyTitle = "No records found",
  emptyDescription = "Try changing filters or search terms.",
}) {
  if (records.length === 0) {
    return (
      <div className="md:hidden">
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  return (
    <div className="mb-6 divide-y divide-gray-200 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:hidden">
      {records.map((record) => (
        <article key={record.id} className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-gray-900">
                {record[titleKey]}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {record[subtitleKey]}
              </p>
            </div>
            {statusRender && statusRender(record)}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            {meta.map((item) => (
              <div key={item.label}>
                <p className="text-gray-500">{item.label}</p>
                <p className="mt-1 font-semibold text-gray-900">
                  {record[item.key] || "-"}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {viewHref && (
              <Link
                href={viewHref(record)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
              >
                View
              </Link>
            )}
            {editHref && (
              <Link
                href={editHref(record)}
                className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800"
              >
                Edit
              </Link>
            )}
            {onArchive && (
              <button
                type="button"
                onClick={() => onArchive(record)}
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
              >
                {archiveLabel}
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
