import Link from "next/link";

function HeaderActionIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export default function PageHeader({
  title,
  buttonText,
  buttonHref,
}) {
  return (
    <div className="mb-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-slate-950 dark:text-slate-100 sm:text-2xl">
            {title}
          </h1>
        </div>

      </div>

      {buttonText && buttonHref && (
        <Link
          href={buttonHref}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-indigo-700 hover:to-violet-700 sm:w-auto"
        >
          <HeaderActionIcon />
          {buttonText}
        </Link>
      )}
      </div>
    </div>
  );
}
