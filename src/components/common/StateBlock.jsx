"use client";

export function LoadingState({ title = "Loading", description }) {
  return (
    <div className="rounded-[24px] border border-[#2c3f63] bg-[#18253d] p-6 text-center shadow-sm">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#314666] border-t-[#8b5cf6]" />
      <h2 className="mt-4 text-base font-bold text-white">{title}</h2>
      {description && (
        <p className="mt-2 text-sm leading-6 text-[#8fa4c7]">{description}</p>
      )}
    </div>
  );
}

export function EmptyState({
  title = "No records found",
  description = "Try changing filters or adding a new record.",
  actionLabel,
  onAction,
}) {
  return (
    <div className="rounded-[24px] border border-dashed border-[#314666] bg-[#18253d] p-8 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#314666] bg-[#101a2b]">
        <svg
          aria-hidden="true"
          className="h-6 w-6 text-[#8fa4c7]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 7h16M4 12h16M4 17h10"
          />
        </svg>
      </div>
      <h2 className="mt-4 text-base font-bold text-white">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#8fa4c7]">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 rounded-xl bg-gradient-to-r from-[#6a3df0] to-[#8b5cf6] px-4 py-2 text-sm font-semibold text-white"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "Please try again.",
  actionLabel,
  onAction,
  onRetry,
}) {
  const resolvedOnRetry = onRetry || onAction;
  const resolvedLabel = actionLabel || "Retry";

  return (
    <div className="rounded-[24px] border border-rose-500/30 bg-rose-500/10 p-8 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/12 text-rose-100">
        <svg
          aria-hidden="true"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v4m0 4h.01M10.3 4.4 2.8 17.5A2 2 0 0 0 4.5 20h15a2 2 0 0 0 1.7-2.5L13.7 4.4a2 2 0 0 0-3.4 0Z"
          />
        </svg>
      </div>
      <h2 className="mt-4 text-base font-bold text-rose-100">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-rose-200">{description}</p>
      {resolvedOnRetry && (
        <button
          type="button"
          onClick={resolvedOnRetry}
          className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/15 px-4 py-2 text-sm font-semibold text-rose-100 hover:bg-rose-500/20"
        >
          {resolvedLabel}
        </button>
      )}
    </div>
  );
}
