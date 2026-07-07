import Link from "next/link";

export default function BackButton({ href, label }) {
  return (
    <Link
      href={href}
      className="back-button inline-flex h-10 w-full items-center justify-center rounded-lg border border-slate-300 bg-slate-50 px-4 text-sm font-semibold text-slate-800 hover:bg-white dark:border-slate-500 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 sm:w-auto"
    >
      Back to {label}
    </Link>
  );
}
