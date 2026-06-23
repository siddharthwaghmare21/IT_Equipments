"use client";

export default function HelpTooltip({ text }) {
  return (
    <span className="group relative inline-flex">
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 bg-gray-50 text-xs font-bold text-gray-600">
        ?
      </span>
      <span className="pointer-events-none absolute left-1/2 top-7 z-20 hidden w-56 -translate-x-1/2 rounded-xl border border-gray-200 bg-white p-3 text-xs font-medium leading-5 text-gray-600 shadow-lg group-hover:block">
        {text}
      </span>
    </span>
  );
}
