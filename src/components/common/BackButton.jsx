import Link from "next/link";

export default function BackButton({ href, label }) {
  return (
    <Link
      href={href}
      className="inline-flex w-full justify-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 sm:w-auto"
    >
      ← Back to {label}
    </Link>
  );
}