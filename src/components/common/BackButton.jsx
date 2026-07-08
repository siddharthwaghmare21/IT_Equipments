import Link from "next/link";

export default function BackButton({ href, label }) {
  return (
    <Link
      href={href}
      className="back-button inline-flex h-11 w-full items-center justify-center rounded-2xl border border-[#314666] bg-[#101a2b] px-4 text-sm font-semibold text-[#c8d4ec] hover:bg-[#16233a] sm:w-auto"
    >
      Back to {label}
    </Link>
  );
}
