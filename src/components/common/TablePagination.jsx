"use client";

export default function TablePagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  itemLabel = "records",
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const buttonClassName =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-2xl border border-[#314666] bg-[#101a2b] px-3 text-sm font-semibold text-white hover:bg-[#16233a] disabled:cursor-not-allowed disabled:opacity-45";

  return (
    <div className="no-print flex flex-col gap-3 border-t border-[#2c3f63] bg-[#142033] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-[#8fa4c7]">
        Showing <span className="font-semibold text-white">{startItem}</span>-
        <span className="font-semibold text-white">{endItem}</span> of{" "}
        <span className="font-semibold text-white">{totalItems}</span> {itemLabel}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange?.(1)}
          disabled={currentPage <= 1}
          className={buttonClassName}
        >
          First
        </button>
        <button
          type="button"
          onClick={() => onPageChange?.(currentPage - 1)}
          disabled={currentPage <= 1}
          className={buttonClassName}
        >
          Prev
        </button>
        <span className="rounded-2xl border border-[#314666] bg-[#18253d] px-4 py-2 text-sm font-semibold text-[#c8d4ec]">
          Page {currentPage} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange?.(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={buttonClassName}
        >
          Next
        </button>
        <button
          type="button"
          onClick={() => onPageChange?.(totalPages)}
          disabled={currentPage >= totalPages}
          className={buttonClassName}
        >
          Last
        </button>
      </div>
    </div>
  );
}
