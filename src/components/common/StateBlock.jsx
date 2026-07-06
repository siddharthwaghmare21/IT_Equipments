"use client";

export function LoadingState({ title = "Loading", description }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600 dark:border-slate-800 dark:border-t-indigo-400" />
      <h2 className="mt-4 text-base font-bold text-slate-950 dark:text-slate-100">{title}</h2>
      {description && (
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
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
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-950">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
        <svg
          aria-hidden="true"
          className="h-6 w-6 text-slate-500 dark:text-slate-400"
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
      <h2 className="mt-4 text-base font-bold text-slate-950 dark:text-slate-100">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
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
  onRetry,
}) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center shadow-sm dark:border-red-900 dark:bg-red-950">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg border border-red-200 bg-white text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
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
      <h2 className="mt-4 text-base font-bold text-red-800">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-red-700">{description}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Retry
        </button>
      )}
    </div>
  );
}
