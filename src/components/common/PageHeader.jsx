import Link from "next/link";

export default function PageHeader({
  title,
  buttonText,
  buttonHref,
}) {
  return (
    <div className="mb-4 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-slate-950 sm:text-2xl">
            {title}
          </h1>
        </div>

      </div>

      {buttonText && buttonHref && (
        <Link
          href={buttonHref}
          className="inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-indigo-700 hover:to-violet-700 sm:w-auto"
        >
          {buttonText}
        </Link>
      )}
      </div>
    </div>
  );
}
