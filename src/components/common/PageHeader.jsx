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
    <div className="no-print mb-3 rounded-[22px] border border-[#2c3f63] bg-[#18253d] px-4 py-3 shadow-[0_14px_32px_rgba(6,12,24,0.18)]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-white">
            {title}
            </h1>
          </div>
        </div>

        {buttonText && buttonHref && (
          <Link
            href={buttonHref}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#6a3df0] to-[#8b5cf6] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(83,104,183,0.18)] hover:from-[#5c33dd] hover:to-[#7c4cf4] sm:w-auto"
          >
            <HeaderActionIcon />
            {buttonText}
          </Link>
        )}
      </div>
    </div>
  );
}
